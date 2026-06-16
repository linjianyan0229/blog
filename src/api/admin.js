import request from './request'

/** 后台管理接口（需登录 + 对应权限） */
export const adminApi = {
  // ============ 文章 ============
  articles: {
    list: (params) => request.get('/admin/articles', { params }),
    detail: (id) => request.get(`/admin/articles/${id}`),
    create: (data) => request.post('/admin/articles', data),
    update: (data) => request.put('/admin/articles', data),
    remove: (id) => request.delete(`/admin/articles/${id}`),
  },

  // ============ 分类 ============
  categories: {
    list: () => request.get('/admin/categories'),
    create: (data) => request.post('/admin/categories', data),
    update: (data) => request.put('/admin/categories', data),
    remove: (id) => request.delete(`/admin/categories/${id}`),
  },

  // ============ 标签 ============
  tags: {
    list: () => request.get('/admin/tags'),
    create: (data) => request.post('/admin/tags', data),
    update: (data) => request.put('/admin/tags', data),
    remove: (id) => request.delete(`/admin/tags/${id}`),
  },

  // ============ 友链 ============
  links: {
    list: () => request.get('/admin/links'),
    create: (data) => request.post('/admin/links', data),
    update: (data) => request.put('/admin/links', data),
    remove: (id) => request.delete(`/admin/links/${id}`),
  },

  // ============ 评论 ============
  comments: {
    list: (params) => request.get('/admin/comments', { params }),
    remove: (id) => request.delete(`/admin/comments/${id}`),
  },

  // ============ 用户 ============
  users: {
    list: (params) => request.get('/admin/users', { params }),
    detail: (id) => request.get(`/admin/users/${id}`),
    create: (data) => request.post('/admin/users', data),
    update: (data) => request.put('/admin/users', data),
    remove: (id) => request.delete(`/admin/users/${id}`),
    assignRoles: (data) => request.post('/admin/users/assign-roles', data),
  },

  // ============ 角色 ============
  roles: {
    list: () => request.get('/admin/roles'),
    permissions: (id) => request.get(`/admin/roles/${id}/permissions`),
    create: (data) => request.post('/admin/roles', data),
    update: (data) => request.put('/admin/roles', data),
    remove: (id) => request.delete(`/admin/roles/${id}`),
    assignPermissions: (data) => request.post('/admin/roles/assign-permissions', data),
  },

  // ============ 权限 ============
  permissions: {
    tree: () => request.get('/admin/permissions/tree'),
    list: () => request.get('/admin/permissions'),
  },

  // ============ 接口限流 ============
  apiLimits: {
    list: (params) => request.get('/admin/api-limits', { params }),
    create: (data) => request.post('/admin/api-limits', data),
    update: (data) => request.put('/admin/api-limits', data),
    remove: (id) => request.delete(`/admin/api-limits/${id}`),
  },

  // ============ 站点配置 ============
  siteConfig: {
    // 配置列表（含中文名 name / 类型 type，供表单渲染）
    list: () => request.get('/admin/site-config'),
    // 批量更新：请求体为数组，每项 { configKey, configValue, name?, type?, sort? }
    update: (list) => request.put('/admin/site-config', list),
  },
}
