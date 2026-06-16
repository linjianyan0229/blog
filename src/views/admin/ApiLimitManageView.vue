<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { useUserStore } from '@/stores/user'
import PageHeader from '@/components/admin/PageHeader.vue'

const userStore = useUserStore()
const loading = ref(false)
const list = ref([])
const page = reactive({ current: 1, size: 10, total: 0 })

const methodOptions = ['ALL', 'GET', 'POST', 'PUT', 'DELETE']
const dimensionOptions = ['IP', 'USER', 'GLOBAL']

const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const formRef = ref()

function emptyForm() {
  return {
    id: null,
    name: '',
    urlPattern: '',
    method: 'ALL',
    dimension: 'IP',
    maxRequests: 60,
    windowSeconds: 60,
    enabled: 1,
    remark: '',
  }
}
const form = ref(emptyForm())

const rules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  urlPattern: [{ required: true, message: '请输入接口路径，如 /auth/**', trigger: 'blur' }],
  maxRequests: [{ required: true, message: '请输入最大次数', trigger: 'change' }],
  windowSeconds: [{ required: true, message: '请输入时间窗口', trigger: 'change' }],
}

async function load() {
  loading.value = true
  try {
    const res = (await adminApi.apiLimits.list({ page: page.current, size: page.size })) || {}
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

function openCreate() {
  dialogMode.value = 'create'
  form.value = emptyForm()
  dialogVisible.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  form.value = { ...emptyForm(), ...row }
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        await adminApi.apiLimits.create(form.value)
        ElMessage.success('创建成功')
      } else {
        await adminApi.apiLimits.update(form.value)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      load()
    } finally {
      submitting.value = false
    }
  })
}

async function toggleEnabled(row) {
  try {
    await adminApi.apiLimits.update(row)
    ElMessage.success(row.enabled === 1 ? '已启用' : '已停用')
  } catch (e) {
    // 失败回滚
    row.enabled = row.enabled === 1 ? 0 : 1
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除规则「${row.name}」吗？`, '提示', { type: 'warning' })
  await adminApi.apiLimits.remove(row.id)
  ElMessage.success('已删除')
  load()
}

load()
</script>

<template>
  <div>
    <PageHeader title="接口限流" subtitle="配置接口访问频率限制规则">
      <template #actions>
        <el-button v-if="userStore.hasPerm('api:create')" type="primary" :icon="Plus" round @click="openCreate">
          新建规则
        </el-button>
      </template>
    </PageHeader>

    <el-alert
      title="规则修改后约 10 秒内生效（本地缓存刷新），超限请求返回 429。"
      type="info"
      :closable="false"
      show-icon
      class="tip-alert"
    />

    <div class="card table-card">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="名称" min-width="140">
          <template #default="{ row }"><strong>{{ row.name }}</strong></template>
        </el-table-column>
        <el-table-column prop="urlPattern" label="urlPattern" min-width="180" show-overflow-tooltip />
        <el-table-column label="method" width="100">
          <template #default="{ row }"><el-tag size="small" type="warning">{{ row.method }}</el-tag></template>
        </el-table-column>
        <el-table-column label="dimension" width="110">
          <template #default="{ row }"><el-tag size="small">{{ row.dimension }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="maxRequests" label="最大次数" width="100" />
        <el-table-column prop="windowSeconds" label="窗口(秒)" width="100" />
        <el-table-column label="启用" width="90">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              :active-value="1"
              :inactive-value="0"
              :disabled="!userStore.hasPerm('api:update')"
              @change="toggleEnabled(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="right" fixed="right">
          <template #default="{ row }">
            <el-button v-if="userStore.hasPerm('api:update')" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="userStore.hasPerm('api:delete')" link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无规则" /></template>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建规则' : '编辑规则'"
      width="520px"
      align-center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入规则名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="urlPattern" prop="urlPattern">
          <el-input v-model="form.urlPattern" placeholder="Ant 风格，如 /auth/**" maxlength="200" />
        </el-form-item>
        <el-form-item label="method">
          <el-select v-model="form.method" style="width: 100%">
            <el-option v-for="m in methodOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="dimension">
          <el-select v-model="form.dimension" style="width: 100%">
            <el-option v-for="d in dimensionOptions" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="最大次数" prop="maxRequests">
          <el-input-number v-model="form.maxRequests" :min="1" :max="1000000" />
        </el-form-item>
        <el-form-item label="窗口(秒)" prop="windowSeconds">
          <el-input-number v-model="form.windowSeconds" :min="1" :max="86400" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="选填" maxlength="200" />
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
.tip-alert {
  margin-bottom: var(--space-4, 16px);
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
