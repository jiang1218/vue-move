const USER_KEY = ''
export const getUser = () => {
  return JSON.parse(window.localStorage.getItem(USER_KEY) || '{}')
}

export const setUser = (user) => {
  window.localStorage.setItem('USER_KEY', JSON.stringify(user))
}

// 删除用户信息
export const delUser = () => {
  window.localStorage.removeItem(USER_KEY)
}
