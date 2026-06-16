<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { useUserStore } from '@/stores/user'
import PageHeader from '@/components/admin/PageHeader.vue'

const userStore = useUserStore()
const loading = ref(false)
const list = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const formRef = ref()
const form = ref({ id: null, name: '' })
const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
}

// 仅当列表中存在 articleCount 字段时才显示「文章数」列
const showArticleCount = computed(() => list.value.some((t) => t.articleCount != null))

async function load() {
  loading.value = true
  try {
    list.value = (await adminApi.tags.list()) || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  form.value = { id: null, name: '' }
  dialogVisible.value = true
}
function openEdit(row) {
  dialogMode.value = 'edit'
  form.value = { id: row.id, name: row.name }
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        await adminApi.tags.create(form.value)
        ElMessage.success('创建成功')
      } else {
        await adminApi.tags.update(form.value)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      load()
    } finally {
      submitting.value = false
    }
  })
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除标签「${row.name}」吗？`, '提示', { type: 'warning' })
  await adminApi.tags.remove(row.id)
  ElMessage.success('已删除')
  load()
}

load()
</script>

<template>
  <div>
    <PageHeader title="标签管理" subtitle="为文章打上灵活的内容标签">
      <template #actions>
        <el-button v-if="userStore.hasPerm('tag:create')" type="primary" :icon="Plus" round @click="openCreate">
          新建标签
        </el-button>
      </template>
    </PageHeader>

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="200">
          <template #default="{ row }">
            <strong>{{ row.name }}</strong>
          </template>
        </el-table-column>
        <el-table-column v-if="showArticleCount" prop="articleCount" label="文章数" width="120">
          <template #default="{ row }">{{ row.articleCount ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="right">
          <template #default="{ row }">
            <el-button v-if="userStore.hasPerm('tag:update')" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="userStore.hasPerm('tag:delete')" link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无标签" /></template>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建标签' : '编辑标签'"
      width="460px"
      align-center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.table-card {
  padding: 8px 8px 4px;
  overflow: hidden;
}
</style>
