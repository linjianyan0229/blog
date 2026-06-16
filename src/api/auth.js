import request from './request'

/** 认证模块（无需登录） */
export const authApi = {
  /** 发送邮箱验证码 type: register | reset */
  sendCode: (data) => request.post('/auth/send-code', data),
  /** 邮箱注册 */
  register: (data) => request.post('/auth/register', data),
  /** 邮箱密码登录 -> { token, tokenPrefix, expiresIn, userInfo } */
  login: (data) => request.post('/auth/login', data),
  /** 忘记密码-重置 */
  resetPassword: (data) => request.post('/auth/reset-password', data),
  /** 退出登录 */
  logout: () => request.post('/auth/logout'),
}
