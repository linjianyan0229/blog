# 蔚蓝博客 · 前端 Blog Frontend

基于 **Vue 3 + Vite + JavaScript** 的现代博客前端，蓝白主题、适配系统浅色/深色，
交互流畅、富有空间感；后台管理基于 **Element Plus**。对接 `blogserver`（Spring Boot）后端。

## 技术栈

| 技术 | 说明 |
|------|------|
| Vue 3 (`<script setup>`) | 组合式 API |
| Vite 6 | 构建与开发服务器 |
| Vue Router 4 | 路由（前台 / 认证 / 用户中心 / 后台 + 守卫 + 进度条） |
| Pinia | 状态管理（用户登录态/权限、主题） |
| Axios | 统一响应解包、JWT 注入、401/403/429 处理 |
| Element Plus | 后台管理 UI（按需自动导入） |
| markdown-it + highlight.js | 文章正文渲染、代码高亮、目录锚点 |
| NProgress | 路由顶部加载条 |

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器 http://localhost:5173
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

> 开发态通过 Vite 代理把 `/api` 转发到后端 `http://localhost:8080`（见 `vite.config.js`）。
> 请先启动 `blogserver` 后端（默认 8080，自带 MySQL 建表与初始化数据）。

### 默认账号（来自后端）

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 超级管理员 | admin@blog.com | admin123 |
| 普通用户 | user@blog.com | 123456 |

## 主题

- 蓝白配色，CSS 变量驱动（`src/styles/variables.css`）。
- 默认跟随系统浅色/深色；可在导航栏/后台一键切换，选择持久化到 `localStorage`。
- 首屏脚本预设 `data-theme`，避免深浅色闪烁。

## 目录结构

```
src/
├── api/            # 接口封装：request(拦截器) + auth/public/user/comment/file/admin
├── assets/
├── components/     # 公共组件：ArticleCard/CommentSection/ThemeToggle/TextField...
│   └── admin/      # 后台公共组件：PageHeader
├── composables/    # useCountdown 等
├── layouts/        # FrontLayout(前台) / AdminLayout(后台)
├── router/         # 路由 + 守卫 + 权限
├── stores/         # pinia：user / theme
├── styles/         # variables / base / markdown / index
├── utils/          # 请求消息 toast / format / markdown / icons
└── views/
    ├── front/      # 首页/文章详情/分类/标签/友链/关于
    ├── auth/       # 登录/注册/重置密码
    ├── user/       # 用户中心
    └── admin/      # 仪表盘 + 文章/分类/标签/友链/评论/用户/角色权限/接口限流
```

## 功能一览

**前台**：首页（Hero + 分类筛选 + 文章网格 + 分页 + 搜索）、文章详情（顶部背景图 + Markdown +
目录高亮 + 点赞 + 树形评论/回复/删除）、分类、标签云、友链、关于、404。

**认证/用户**：邮箱登录、注册（发送验证码倒计时）、找回密码、用户中心（资料/头像上传/改密码）。

**后台（Element Plus，按权限显示菜单）**：仪表盘、文章管理与 Markdown 编辑（缩略图上传、分类/标签、
公开/置顶/草稿发布）、分类、标签、友链、评论、用户（含角色分配）、角色权限（权限树分配）、接口限流。

## 权限

RBAC：登录后由后端返回 `roles` / `permissions`，前端据此控制后台菜单与按钮显隐
（`useUserStore().hasPerm('article:create')`）；`ADMIN` 默认拥有全部权限。
