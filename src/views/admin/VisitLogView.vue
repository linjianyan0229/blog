<script setup>
import { reactive, ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { formatDateTime } from '@/utils/format'
import PageHeader from '@/components/admin/PageHeader.vue'

const loading = ref(false)
const list = ref([])
const stats = reactive({ totalPv: 0, totalUv: 0, todayPv: 0, todayUv: 0 })
const query = reactive({ ip: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })

async function loadStats() {
  try {
    Object.assign(stats, (await adminApi.visit.stats()) || {})
  } catch {
    /* ignore */
  }
}

async function load() {
  loading.value = true
  try {
    const res =
      (await adminApi.visit.logs({
        ip: query.ip || undefined,
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
  query.ip = ''
  pagination.page = 1
  load()
}
function onPageChange(p) {
  pagination.page = p
  load()
}

loadStats()
load()
</script>

<template>
  <div>
    <PageHeader title="访问统计" subtitle="网站访问量与访客日志（含 IP）" />

    <div class="stat-bar card">
      <div class="sb-item"><b>{{ stats.totalPv }}</b><span>总访问 PV</span></div>
      <div class="sb-item"><b>{{ stats.totalUv }}</b><span>总访客 UV</span></div>
      <div class="sb-item"><b class="accent">{{ stats.todayPv }}</b><span>今日访问</span></div>
      <div class="sb-item"><b class="accent">{{ stats.todayUv }}</b><span>今日访客</span></div>
    </div>

    <div class="card filter-bar">
      <el-input
        v-model="query.ip"
        placeholder="按 IP 模糊筛选"
        clearable
        style="width: 220px"
        @keyup.enter="onSearch"
      />
      <el-button type="primary" :icon="Search" @click="onSearch">查询</el-button>
      <el-button :icon="Refresh" @click="onReset">重置</el-button>
    </div>

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="ip" label="访客 IP" width="150" />
        <el-table-column prop="path" label="访问路径" min-width="200" show-overflow-tooltip />
        <el-table-column label="访客" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="row.userId ? 'primary' : 'info'">
              {{ row.userId ? `用户#${row.userId}` : '游客' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源页" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.referer || '—' }}</template>
        </el-table-column>
        <el-table-column label="浏览器 UA" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.userAgent || '—' }}</template>
        </el-table-column>
        <el-table-column label="访问时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <template #empty><el-empty description="暂无访问记录" /></template>
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
.stat-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  margin-bottom: var(--space-4);
}
.sb-item {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}
.sb-item b {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-strong);
}
.sb-item b.accent {
  background: var(--grad-brand);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sb-item span {
  font-size: 12.5px;
  color: var(--text-muted);
}
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
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px 8px;
}
</style>
