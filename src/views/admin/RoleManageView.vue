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

// ============ 新建 / 编辑 ============
const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const formRef = ref()

function emptyForm() {
  return { id: null, name: '', code: '', description: '', status: 1 }
}
const form = ref(emptyForm())

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    list.value = (await adminApi.roles.list()) || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  form.value = emptyForm()
  dialogVisible.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  form.value = {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status ?? 1,
  }
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        await adminApi.roles.create(form.value)
        ElMessage.success('创建成功')
      } else {
        await adminApi.roles.update(form.value)
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
  await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '提示', { type: 'warning' })
  await adminApi.roles.remove(row.id)
  ElMessage.success('已删除')
  load()
}

// ============ 分配权限 ============
const permDialogVisible = ref(false)
const permLoading = ref(false)
const permSubmitting = ref(false)
const permTree = ref([])
const checkedIds = ref([])
const treeRef = ref()
const currentRole = ref(null)

async function openAssign(row) {
  currentRole.value = row
  permDialogVisible.value = true
  permLoading.value = true
  try {
    const [tree, ids] = await Promise.all([
      adminApi.permissions.tree(),
      adminApi.roles.permissions(row.id),
    ])
    permTree.value = tree || []
    // roles.permissions 返回的是权限ID数组（List<Long>）
    checkedIds.value = (ids || []).map((it) => (it && typeof it === 'object' ? it.id : it))
  } finally {
    permLoading.value = false
  }
}

async function submitAssign() {
  if (!treeRef.value) return
  const permissionIds = treeRef.value.getCheckedKeys().concat(treeRef.value.getHalfCheckedKeys())
  permSubmitting.value = true
  try {
    await adminApi.roles.assignPermissions({ roleId: currentRole.value.id, permissionIds })
    ElMessage.success('分配成功')
    permDialogVisible.value = false
  } finally {
    permSubmitting.value = false
  }
}

load()
</script>

<template>
  <div>
    <PageHeader title="角色权限" subtitle="管理后台角色并为其分配权限">
      <template #actions>
        <el-button v-if="userStore.hasPerm('role:create')" type="primary" :icon="Plus" round @click="openCreate">
          新建角色
        </el-button>
      </template>
    </PageHeader>

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名" min-width="140">
          <template #default="{ row }"><strong>{{ row.name }}</strong></template>
        </el-table-column>
        <el-table-column label="编码" min-width="140">
          <template #default="{ row }"><el-tag size="small">{{ row.code }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="right" fixed="right">
          <template #default="{ row }">
            <el-button v-if="userStore.hasPerm('role:update')" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="userStore.hasPerm('role:assign')" link type="primary" @click="openAssign(row)">分配权限</el-button>
            <el-button v-if="userStore.hasPerm('role:delete')" link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无角色" /></template>
      </el-table>
    </div>

    <!-- 新建 / 编辑角色 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建角色' : '编辑角色'"
      width="480px"
      align-center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="如 ADMIN / EDITOR" maxlength="50" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="选填" maxlength="200" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限 -->
    <el-dialog
      v-model="permDialogVisible"
      :title="currentRole ? `分配权限 - ${currentRole.name}` : '分配权限'"
      width="480px"
      align-center
    >
      <div v-loading="permLoading" class="perm-tree-wrap">
        <el-tree
          ref="treeRef"
          :data="permTree"
          show-checkbox
          node-key="id"
          :props="{ label: 'name', children: 'children' }"
          :default-checked-keys="checkedIds"
          :default-expand-all="true"
        />
        <el-empty v-if="!permLoading && permTree.length === 0" description="暂无权限数据" />
      </div>
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="permSubmitting" @click="submitAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.table-card {
  padding: 8px 8px 4px;
  overflow: hidden;
}
.perm-tree-wrap {
  max-height: 420px;
  overflow: auto;
}
</style>
