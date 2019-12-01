// 用户相关的api
import http from '@/uitls/request'

export const login = ({ mobile, code }) => {
  return http('/app/v1_0/authorizations', 'post', { mobile, code })
}
