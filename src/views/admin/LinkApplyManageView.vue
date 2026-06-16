<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'
import PageHeader from '@/components/admin/PageHeader.vue'

const userStore = useUserStore()

const STATUS = {
  PENDING: { label: '待审核', type: 'warning' },
  APPROVED: { label: '已通过', type: 'success' },
  REJECTED: { label: '已拒绝', type: 'danger' },
}

const loading = ref(false)
const list = ref([])
const query = reactive({ status: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })

async function load() {
  loading.value = true
  try {
    const res =
      (await adminApi.linkApplies.list({
        status: query.status || undefined,
        page: pagination.page,
        size: pagination.size,
      })) || {}
    list.value = res.records || []
    pagination.total = res.total || 0
  } finally {
    loading.value = false
  }
}

function onSearch() {
  pagination.page = 1
  load()
}
function onReset() {
  query.status = ''
  pagination.page = 1
  load()
}
function onPageChange(p) {
  pagination.page = p
  load()
}

async function approve(row) {
  await ElMessageBox.confirm(
    `确认通过「${row.name}」的友链申请？通过后将自动加入友链并展示。`,
    '审核通过',
    { type: 'success', confirmButtonText: '通过' }
  )
  await adminApi.linkApplies.approve(row.id)
  ElMessage.success('已通过，已加入友链')
  load()
}

async function reject(row) {
  const { value } = await ElMessageBox.prompt('请输入拒绝原因（可选，将记录在案）', '拒绝申请', {
    confirmButtonText: '确定拒绝',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '拒绝原因…',
    inputValidator: () => true,
  })
  await adminApi.linkApplies.reject(row.id, value || '')
  ElMessage.success('已拒绝')
  load()
}

load()
</script>

<template>
  <div>
    <PageHeader title="友链申请" subtitle="审核用户提交的友链申请，通过后自动加入友链展示" />

    <div class="card filter-bar">
      <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 160px">
        <el-option label="待审核" value="PENDING" />
        <el-option label="已通过" value="APPROVED" />
        <el-option label="已拒绝" value="REJECTED" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="onSearch">查询</el-button>
      <el-button :icon="Refresh" @click="onReset">重置</el-button>
    </div>

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="网站" min-width="240">
          <template #default="{ row }">
            <div class="site-cell">
              <el-avatar :size="40" shape="square" :src="row.logo">{{ (row.name || 'L').charAt(0) }}</el-avatar>
              <div class="site-meta">
                <strong>{{ row.name }}</strong>
                <a :href="row.url" target="_blank" rel="noopener noreferrer" class="site-url">{{ row.url }}</a>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="applyEmail" label="联系邮箱" min-width="170" show-overflow-tooltip />
        <el-table-column label="状态" width="150">
          <template #default="{ row }">
            <el-tag :type="STATUS[row.status]?.type || 'info'" size="small">
              {{ STATUS[row.status]?.label || row.status }}
            </el-tag>
            <el-tooltip v-if="row.status === 'REJECTED' && row.auditRemark" :content="row.auditRemark">
              <span class="remark-hint">原因</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="right" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'PENDING' && userStore.hasPerm('link:audit')">
              <el-button link type="success" @click="approve(row)">通过</el-button>
              <el-button link type="danger" @click="reject(row)">拒绝</el-button>
            </template>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无友链申请" /></template>
      </el-table>

      <div class="pager">
        <el-pagination
          layout="total, prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.size"
          :current-page="pagination.page"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  padding: 14px 16px;
  margin-bottom: var(--space-4);
}
.table-card {
  padding: 8px 8px 4px;
  overflow: hidden;
}
.site-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.site-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.site-url {
  font-size: 12.5px;
  color: var(--text-muted);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.remark-hint {
  margin-left: 6px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: help;
  text-decoration: underline dotted;
}
.text-muted {
  color: var(--text-muted);
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px 8px;
}
</style>
