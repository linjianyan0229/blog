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
  /** 解锁加密文章（密码错误返回 code 1011），返回完整文章详情 */
  unlockArticle: (id, password) =>
    request.post(`/public/articles/${id}/unlock`, { password }, { silent: true }),
  /** 上报一次访问（埋点），返回最新总 PV；失败静默不打扰用户 */
  recordVisit: (path) =>
    request.post('/public/visit', null, { params: path ? { path } : {}, silent: true }),
  /** 网站访问量统计：totalPv/totalUv/todayPv/todayUv */
  getVisitStats: () => request.get('/public/visit/stats'),
}
