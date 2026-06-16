<script setup>
import { ref } from 'vue'
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
const form = ref({ id: null, name: '', description: '', sort: 0 })
const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    list.value = (await adminApi.categories.list()) || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  form.value = { id: null, name: '', description: '', sort: 0 }
  dialogVisible.value = true
}
function openEdit(row) {
  dialogMode.value = 'edit'
  form.value = { id: row.id, name: row.name, description: row.description, sort: row.sort ?? 0 }
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        await adminApi.categories.create(form.value)
        ElMessage.success('创建成功')
      } else {
        await adminApi.categories.update(form.value)
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
  await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '提示', { type: 'warning' })
  await adminApi.categories.remove(row.id)
  ElMessage.success('已删除')
  load()
}

load()
</script>

<template>
  <div>
    <PageHeader title="分类管理" subtitle="组织文章的主题分类">
      <template #actions>
        <el-button v-if="userStore.hasPerm('category:create')" type="primary" :icon="Plus" round @click="openCreate">
          新建分类
        </el-button>
      </template>
    </PageHeader>

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="160">
          <template #default="{ row }">
            <strong>{{ row.name }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="240" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="操作" width="160" align="right">
          <template #default="{ row }">
            <el-button v-if="userStore.hasPerm('category:update')" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="userStore.hasPerm('category:delete')" link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无分类" /></template>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建分类' : '编辑分类'"
      width="460px"
      align-center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="选填" maxlength="200" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
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
