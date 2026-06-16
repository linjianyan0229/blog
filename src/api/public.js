import request from './request'

/** 公开接口（游客 + 登录用户） */
export const publicApi = {
  /** 文章列表（分页）params: page,size,categoryId,tagId,keyword */
  getArticles: (params) => request.get('/public/articles', { params }),
  /** 文章详情，访问数自动 +1 */
  getArticle: (id) => request.get(`/public/articles/${id}`),
  /** 点赞 -> 最新点赞数 */
  likeArticle: (id) => request.post(`/public/articles/${id}/like`),
  /** 文章评论（树形） */
  getComments: (id) => request.get(`/public/articles/${id}/comments`),
  /** 全部分类 */
  getCategories: () => request.get('/public/categories'),
  /** 全部标签 */
  getTags: () => request.get('/public/tags'),
  /** 显示中的友链 */
  getLinks: () => request.get('/public/links'),
  /** 站点基础配置：返回 key→value 的 Map */
  getSiteConfig: () => request.get('/public/site-config'),
}
