<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api/admin'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'
import PageHeader from '@/components/admin/PageHeader.vue'

const userStore = useUserStore()
const loading = ref(false)
const list = ref([])
const page = reactive({ current: 1, size: 10, total: 0 })

async function load() {
  loading.value = true
  try {
    const res = (await adminApi.comments.list({ page: page.current, size: page.size })) || {}
    list.value = res.records || []
    page.total = res.total || 0
  } finally {
    loading.value = false
  }
}

function handlePageChange(p) {
  page.current = p
  load()
}

async function remove(row) {
  await ElMessageBox.confirm('确定删除该评论吗？', '提示', { type: 'warning' })
  await adminApi.comments.remove(row.id)
  ElMessage.success('已删除')
  load()
}

load()
</script>

<template>
  <div>
    <PageHeader title="评论管理" subtitle="查看与清理用户评论" />

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" :src="row.avatar">{{ (row.nickname || '?').charAt(0) }}</el-avatar>
              <span class="nickname">{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="320" show-overflow-tooltip />
        <el-table-column prop="articleId" label="文章ID" width="100" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.parentId === 0" type="primary" size="small">评论</el-tag>
            <el-tag v-else type="info" size="small">回复</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="right">
          <template #default="{ row }">
            <el-button v-if="userStore.hasPerm('comment:delete')" link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无评论" /></template>
      </el-table>

      <div class="pager">
        <el-pagination
          layout="total, prev, pager, next"
          :total="page.total"
          :current-page="page.current"
          :page-size="page.size"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  padding: 8px 8px 4px;
  overflow: hidden;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nickname {
  font-weight: 600;
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px 8px;
}
</style>
