import request from './request'

/** 用户中心（需登录） */
export const userApi = {
  /** 当前登录用户信息（含 roles / permissions） */
  getInfo: () => request.get('/user/info'),
  /** 修改个人信息 nickname/avatar/bio/gender */
  updateProfile: (data) => request.put('/user/profile', data),
  /** 修改密码 oldPassword/newPassword */
  updatePassword: (data) => request.put('/user/password', data),
}
