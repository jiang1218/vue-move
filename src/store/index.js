import Vue from 'vue'
import Vuex from 'vuex'
import * as auth from '@/uitls/auth.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息  包含token
    user: auth.getUser()
  },
  mutations: {
    // 修改用户信息
    setUser (state, user) {
      state.user = user
      auth.setUser(user)
    },
    // 删除用户信息
    delUser (state) {
      state.user = {}
      auth.delUser()
    }
  },
  actions: {
  },
  modules: {
  }
})
