<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { fileApi } from '@/api/file'
import { useUserStore } from '@/stores/user'
import PageHeader from '@/components/admin/PageHeader.vue'

const userStore = useUserStore()
const loading = ref(false)
const list = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const uploading = ref(false)
const formRef = ref()
const form = ref({ id: null, name: '', url: '', logo: '', description: '', sort: 0, status: 1 })
const rules = {
  name: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入网站地址', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    list.value = (await adminApi.links.list()) || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  form.value = { id: null, name: '', url: '', logo: '', description: '', sort: 0, status: 1 }
  dialogVisible.value = true
}
function openEdit(row) {
  dialogMode.value = 'edit'
  form.value = {
    id: row.id,
    name: row.name,
    url: row.url,
    logo: row.logo,
    description: row.description,
    sort: row.sort ?? 0,
    status: row.status ?? 1,
  }
  dialogVisible.value = true
}

function uploadLogo(opt) {
  uploading.value = true
  return fileApi
    .upload(opt.file)
    .then((url) => {
      form.value.logo = url
      ElMessage.success('上传成功')
    })
    .catch(() => {})
    .finally(() => {
      uploading.value = false
    })
}

async function submit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        await adminApi.links.create(form.value)
        ElMessage.success('创建成功')
      } else {
        await adminApi.links.update(form.value)
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
  await ElMessageBox.confirm(`确定删除友链「${row.name}」吗？`, '提示', { type: 'warning' })
  await adminApi.links.remove(row.id)
  ElMessage.success('已删除')
  load()
}

load()
</script>

<template>
  <div>
    <PageHeader title="友链管理" subtitle="维护友情链接与站点导航">
      <template #actions>
        <el-button v-if="userStore.hasPerm('link:create')" type="primary" :icon="Plus" round @click="openCreate">
          新建友链
        </el-button>
      </template>
    </PageHeader>

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="Logo" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.logo" shape="square">
              {{ (row.name || '?').charAt(0).toUpperCase() }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="140">
          <template #default="{ row }">
            <strong>{{ row.name }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="地址" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <a :href="row.url" target="_blank" rel="noopener noreferrer" class="link-url">{{ row.url }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light">
              {{ row.status === 1 ? '显示' : '下线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="right">
          <template #default="{ row }">
            <el-button v-if="userStore.hasPerm('link:update')" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="userStore.hasPerm('link:delete')" link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无友链" /></template>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建友链' : '编辑友链'"
      width="520px"
      align-center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入网站名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="地址" prop="url">
          <el-input v-model="form.url" placeholder="https://example.com" maxlength="255" />
        </el-form-item>
        <el-form-item label="Logo">
          <div class="logo-field">
            <el-input v-model="form.logo" placeholder="图片URL，可手填或上传" maxlength="255" />
            <el-upload
              class="logo-upload"
              :show-file-list="false"
              accept="image/*"
              :http-request="uploadLogo"
            >
              <el-button :loading="uploading">上传 Logo</el-button>
            </el-upload>
          </div>
          <el-avatar v-if="form.logo" :size="48" :src="form.logo" shape="square" class="logo-preview" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="选填" maxlength="255" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="显示" inactive-text="下线" />
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
.link-url {
  color: var(--el-color-primary);
  text-decoration: none;
}
.link-url:hover {
  text-decoration: underline;
}
.logo-field {
  display: flex;
  gap: 8px;
  width: 100%;
}
.logo-upload {
  flex-shrink: 0;
}
.logo-preview {
  margin-top: 8px;
}
</style>
