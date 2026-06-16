import request from './request'

/** 友链申请（需登录） */
export const linkApplyApi = {
  /** 提交友链申请 name/url/logo/description/applyEmail */
  submit: (data) => request.post('/link-apply', data),
  /** 我的友链申请记录（含审核状态 PENDING/APPROVED/REJECTED） */
  mine: () => request.get('/link-apply/mine'),
}
