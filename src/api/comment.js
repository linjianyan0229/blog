import request from './request'

/** 评论（需登录） */
export const commentApi = {
  /** 发表评论 articleId/content/parentId(默认0) */
  add: (data) => request.post('/comment', data),
  /** 删除自己的评论 */
  remove: (id) => request.delete(`/comment/${id}`),
}
