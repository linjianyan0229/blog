<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Picture } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { publicApi } from '@/api/public'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'
import PageHeader from '@/components/admin/PageHeader.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const list = ref([])
const categories = ref([])

// 分页 + 筛选状态
const query = reactive({
  page: 1,
  size: 10,
  total: 0,
  keyword: '',
  categoryId: null,
  status: null, // null=全部 0=草稿 1=已发布
})

async function loadCategories() {
  categories.value = (await publicApi.getCategories()) || []
}

async function load() {
  loading.value = true
  try {
    const res = await adminApi.articles.list({
      page: query.page,
      size: query.size,
      categoryId: query.categoryId ?? undefined,
      keyword: query.keyword || undefined,
      status: query.status ?? undefined,
    })
    list.value = res?.records || []
    query.total = res?.total || 0
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  load()
}

function reset() {
  query.keyword = ''
  query.categoryId = null
  query.status = null
  query.page = 1
  load()
}

function handlePageChange(page) {
  query.page = page
  load()
}

function goCreate() {
  router.push('/admin/articles/edit')
}

function goEdit(row) {
  router.push('/admin/articles/edit/' + row.id)
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除文章「${row.title}」吗？`, '提示', { type: 'warning' })
  await adminApi.articles.remove(row.id)
  ElMessage.success('已删除')
  // 删除后若当前页空了，回退一页
  if (list.value.length === 1 && query.page > 1) query.page -= 1
  load()
}

loadCategories()
load()
</script>

<template>
  <div>
    <PageHeader title="文章管理" subtitle="管理博客文章、草稿与发布状态">
      <template #actions>
        <el-button
          v-if="userStore.hasPerm('article:create')"
          type="primary"
          :icon="Plus"
          round
          @click="goCreate"
        >
          写文章
        </el-button>
      </template>
    </PageHeader>

    <!-- 筛选栏 -->
    <div class="card filter-bar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索标题 / 摘要"
        clearable
        style="width: 220px"
        @keyup.enter="search"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select
        v-model="query.categoryId"
        placeholder="全部分类"
        clearable
        style="width: 160px"
      >
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
        <el-option label="草稿" :value="0" />
        <el-option label="已发布" :value="1" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="缩略图" width="92">
          <template #default="{ row }">
            <el-image
              v-if="row.thumbnail"
              :src="row.thumbnail"
              fit="cover"
              class="thumb"
              :preview-src-list="[row.thumbnail]"
              preview-teleported
            />
            <div v-else class="thumb thumb-empty">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="标题" min-width="240">
          <template #default="{ row }">
            <strong class="title">{{ row.title }}</strong>
            <p v-if="row.summary" class="summary">{{ row.summary }}</p>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <span>{{ row.categoryName || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="作者" width="120">
          <template #default="{ row }">
            <span>{{ row.authorName || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="150">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
            <el-tag v-if="row.isPublic === 0" type="warning" size="small" class="mark">不公开</el-tag>
            <el-tag v-if="row.top === 1" type="danger" size="small" class="mark">置顶</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="数据" width="130">
          <template #default="{ row }">
            <p class="stat">阅读 {{ row.viewCount ?? 0 }}</p>
            <p class="stat">赞 {{ row.likeCount ?? 0 }} · 评论 {{ row.commentCount ?? 0 }}</p>
          </template>
        </el-table-column>

        <el-table-column label="时间" width="150">
          <template #default="{ row }">
            <span class="time">{{ formatDateTime(row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" align="right" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="userStore.hasPerm('article:update')"
              link
              type="primary"
              @click="goEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="userStore.hasPerm('article:delete')"
              link
              type="danger"
              @click="remove(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>

        <template #empty><el-empty description="暂无文章" /></template>
      </el-table>

      <div class="pager">
        <el-pagination
          :current-page="query.page"
          :page-size="query.size"
          :total="query.total"
          layout="total, prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 16px;
  margin-bottom: var(--space-5);
}
.table-card {
  padding: 8px 8px 4px;
  overflow: hidden;
}
.thumb {
  width: 60px;
  height: 40px;
  border-radius: 6px;
  display: block;
}
.thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fill-2, #f2f3f5);
  color: var(--text-muted, #909399);
  font-size: 18px;
}
.title {
  color: var(--text-strong);
  font-size: 14px;
}
.summary {
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mark {
  margin-left: 6px;
}
.stat {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.6;
}
.time {
  font-size: 12.5px;
  color: var(--text-muted);
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px 8px;
}
</style>
