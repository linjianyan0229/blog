<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'
import PageHeader from '@/components/admin/PageHeader.vue'

const userStore = useUserStore()
const loading = ref(false)
const list = ref([])

// 角色字典：id -> name，并作为表单多选 options
const roles = ref([])
const roleMap = ref({})

// 筛选 + 分页
const query = reactive({ keyword: '', status: null })
const pagination = reactive({ page: 1, size: 10, total: 0 })

// 弹窗
const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const formRef = ref()
const form = reactive({
  id: null,
  username: '',
  email: '',
  password: '',
  nickname: '',
  avatar: '',
  bio: '',
  gender: 0,
  status: 1,
  roleIds: [],
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (dialogMode.value === 'create' && !value) {
          callback(new Error('请输入密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const genderOptions = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
]

async function loadRoles() {
  roles.value = (await adminApi.roles.list()) || []
  const map = {}
  for (const r of roles.value) map[r.id] = r.name
  roleMap.value = map
}

async function load() {
  loading.value = true
  try {
    const res =
      (await adminApi.users.list({
        page: pagination.page,
        size: pagination.size,
        keyword: query.keyword || undefined,
        status: query.status ?? undefined,
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
  query.keyword = ''
  query.status = null
  pagination.page = 1
  load()
}
function onPageChange(p) {
  pagination.page = p
  load()
}

/** 取该用户的角色名列表用于展示；优先 roleNames，否则用 roleIds 映射 */
function roleTags(row) {
  if (Array.isArray(row.roleNames) && row.roleNames.length) return row.roleNames
  if (Array.isArray(row.roleIds)) return row.roleIds.map((id) => roleMap.value[id]).filter(Boolean)
  return []
}

function resetForm() {
  form.id = null
  form.username = ''
  form.email = ''
  form.password = ''
  form.nickname = ''
  form.avatar = ''
  form.bio = ''
  form.gender = 0
  form.status = 1
  form.roleIds = []
}

function openCreate() {
  dialogMode.value = 'create'
  resetForm()
  formRef.value?.clearValidate()
  dialogVisible.value = true
}

async function openEdit(row) {
  dialogMode.value = 'edit'
  resetForm()
  // 直接用行数据回显（UserAdminVO 已包含所有字段，含 roleIds）
  let data = row
  try {
    data = (await adminApi.users.detail(row.id)) || row
  } catch {
    data = row
  }
  form.id = data.id
  form.username = data.username || ''
  form.email = data.email || ''
  form.password = ''
  form.nickname = data.nickname || ''
  form.avatar = data.avatar || ''
  form.bio = data.bio || ''
  form.gender = data.gender ?? 0
  form.status = data.status ?? 1
  form.roleIds = Array.isArray(data.roleIds) ? [...data.roleIds] : []
  formRef.value?.clearValidate()
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        username: form.username,
        email: form.email,
        nickname: form.nickname,
        avatar: form.avatar,
        bio: form.bio,
        gender: form.gender,
        status: form.status,
        roleIds: form.roleIds,
      }
      // 编辑时密码留空 -> 不提交，表示不修改
      if (form.password) payload.password = form.password

      if (dialogMode.value === 'create') {
        await adminApi.users.create(payload)
        ElMessage.success('创建成功')
      } else {
        payload.id = form.id
        await adminApi.users.update(payload)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      load()
    } finally {
      submitting.value = false
    }
  })
}

/** 状态开关：直接调用 update 切换 */
async function toggleStatus(row) {
  const next = row.status === 1 ? 0 : 1
  try {
    await adminApi.users.update({
      id: row.id,
      username: row.username,
      email: row.email,
      nickname: row.nickname,
      avatar: row.avatar,
      bio: row.bio,
      gender: row.gender,
      status: next,
      roleIds: row.roleIds || [],
    })
    row.status = next
    ElMessage.success(next === 1 ? '已启用' : '已禁用')
  } catch {
    /* 失败保持原值，拦截器已提示 */
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除用户「${row.username}」吗？`, '提示', { type: 'warning' })
  await adminApi.users.remove(row.id)
  ElMessage.success('已删除')
  // 删除后若当前页空了，回退一页
  if (list.value.length === 1 && pagination.page > 1) pagination.page -= 1
  load()
}

loadRoles()
load()
</script>

<template>
  <div>
    <PageHeader title="用户管理" subtitle="管理后台用户与角色分配">
      <template #actions>
        <el-button v-if="userStore.hasPerm('user:create')" type="primary" :icon="Plus" round @click="openCreate">
          新建用户
        </el-button>
      </template>
    </PageHeader>

    <div class="card filter-bar">
      <el-input
        v-model="query.keyword"
        placeholder="用户名 / 邮箱"
        clearable
        style="width: 220px"
        @keyup.enter="onSearch"
      />
      <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px">
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="onSearch">查询</el-button>
      <el-button :icon="Refresh" @click="onReset">重置</el-button>
    </div>

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36" :src="row.avatar">{{ (row.username || '?').charAt(0).toUpperCase() }}</el-avatar>
              <div class="user-meta">
                <strong>{{ row.username }}</strong>
                <span v-if="row.nickname" class="nickname">{{ row.nickname }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column label="角色" min-width="180">
          <template #default="{ row }">
            <el-tag v-for="(name, i) in roleTags(row)" :key="i" size="small" class="role-tag">{{ name }}</el-tag>
            <span v-if="!roleTags(row).length" class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :disabled="!userStore.hasPerm('user:update')"
              @change="toggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="right">
          <template #default="{ row }">
            <el-button v-if="userStore.hasPerm('user:update')" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="userStore.hasPerm('user:delete')" link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无用户" /></template>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建用户' : '编辑用户'"
      width="560px"
      align-center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" maxlength="50" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="100" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="dialogMode === 'edit' ? '留空则不修改' : '请输入密码'"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="选填" maxlength="50" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender" style="width: 160px">
            <el-option v-for="g in genderOptions" :key="g.value" :label="g.label" :value="g.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleIds" multiple clearable placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="form.avatar" placeholder="头像 URL（选填）" maxlength="255" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.bio" type="textarea" :rows="3" placeholder="选填" maxlength="200" />
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
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.user-meta .nickname {
  font-size: 12px;
  color: var(--text-muted);
}
.role-tag {
  margin-right: 4px;
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
