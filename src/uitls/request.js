import axios from 'axios'
import jsonBigInt from 'json-bigint'
import store from '@/store'
import router from '@/router'

const instance = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn',
  // 在数据转换器中设置数据，防止超出js最大数据报错
  transformResponse: [function (data) {
    try {
      return jsonBigInt.parse(data)
    } catch (e) {
      return data
    }
  }]
})
// 请求拦截器配置
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  if (store.state.user.token) {
    config.headers.Athorization = `Bearer ${store.state.user.token}`
  }
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})
// 配置响应拦截器
instance.interceptors.response.use(function (res) {
  try {
    return res.data.data
  } catch (e) {
    return res
  }
},
async err => {
  // 实现token失效处理
  // 1. 判断是否是401状态
  // 2. 如果未登录（拦截到登录页面，预留回跳功能）
  if (err.response && err.response.status === 401) {
    // 路由中的 query传参 方式 其中router.currentRouter.path当前地址栏信息
    let loginConfig = { path: '/login', query: { redirectUrl: router.currentRouter.path } }
    const { user } = store.state
    if (user || !user.token || !user.refresh_token) { // 此时说明用户没有登陆过
      router.push(loginConfig)
      return Promise.reject(err)
    }
    // 3. token失效，发请求给后台刷新token
    try {
      const { data: { data } } = await axios({
        path: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
        method: 'put',
        headers: {
          Authorization: `Bearer ${user.refresh_token}`
        }
      })
      // 3.1 刷新成功  更新vuex中token和本地存储的token
      store.commit('setUser', {
        token: data.token,
        refresh_token: user.refresh_token
      })
      // 3.2 刷新成功  把原本失败的请求继续发送出去
      instance(err.config)
      return Promise.reject(err)
      // err.config 中存放的就是，失败时请求的配置参数
    } catch (e) {
      // 3.3 刷新失败  删除vuex中token和本地存储的token （拦截到登录页面，预留回跳功能）
      // 刷新失败
      // 1. 删除token
      store.commit('delUser')
      // 2. 拦截登录
      router.push(loginConfig)
      return Promise.reject(err)
    }
  }
  // return Promise.reject(err)
})

// 导出配置好的 axios 函数
export default (url, method, data) => {
  return instance({
    url,
    method,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}
