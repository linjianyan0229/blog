<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { publicApi } from '@/api/public'
import { fileApi } from '@/api/file'
import { renderMarkdown } from '@/utils/markdown'
import PageHeader from '@/components/admin/PageHeader.vue'

const route = useRoute()
const router = useRouter()

const articleId = computed(() => route.params.id || null)
const isEdit = computed(() => !!articleId.value)

const loading = ref(false)
const saving = ref(false)
const categories = ref([])
const tags = ref([]) // [{ id, name }]

// 保存字段对齐 ArticleSaveDTO
const form = reactive({
  id: null,
  title: '',
  summary: '',
  content: '',
  thumbnail: '',
  categoryId: null,
  tagIds: [],
  isPublic: 1,
  top: 0,
  status: 1,
})

// 正文 Markdown 实时预览
const previewHtml = computed(() => renderMarkdown(form.content))

async function load() {
  loading.value = true
  try {
    // 并行加载下拉数据
    const [cats, tagList] = await Promise.all([publicApi.getCategories(), publicApi.getTags()])
    categories.value = cats || []
    tags.value = tagList || []

    if (isEdit.value) {
      const detail = await adminApi.articles.detail(articleId.value)
      form.id = detail.id
      form.title = detail.title || ''
      form.summary = detail.summary || ''
      form.content = detail.content || ''
      form.thumbnail = detail.thumbnail || ''
      form.categoryId = detail.categoryId ?? null
      form.isPublic = detail.isPublic ?? 1
      form.top = detail.top ?? 0
      form.status = detail.status ?? 1

      // ===== 标签回显 =====
      // 后端 getByIdForEdit -> toDetailVO 返回的是 tags（标签【名称】数组），
      // ArticleDetailVO 中没有 tagIds 字段。因此这里用 getTags() 建立
      // name -> id 映射，把名称数组转换成保存所需的 tagIds(Long[])。
      const nameToId = new Map(tags.value.map((t) => [t.name, t.id]))
      form.tagIds = (detail.tags || [])
        .map((name) => nameToId.get(name))
        .filter((id) => id != null)
    }
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/admin/articles')
}

function handleUpload(opt) {
  return fileApi
    .upload(opt.file)
    .then((url) => {
      form.thumbnail = url
      ElMessage.success('上传成功')
    })
    .catch(() => {})
}

async function save(status) {
  if (!form.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('请输入正文内容')
    return
  }
  saving.value = true
  try {
    const payload = {
      id: form.id ?? undefined,
      title: form.title.trim(),
      summary: form.summary,
      content: form.content,
      thumbnail: form.thumbnail,
      categoryId: form.categoryId ?? undefined,
      tagIds: form.tagIds,
      isPublic: form.isPublic,
      top: form.top,
      status,
    }
    if (isEdit.value) {
      await adminApi.articles.update(payload)
    } else {
      await adminApi.articles.create(payload)
    }
    ElMessage.success(status === 0 ? '已存为草稿' : '发布成功')
    router.push('/admin/articles')
  } finally {
    saving.value = false
  }
}

load()
</script>

<template>
  <div v-loading="loading" class="editor-page">
    <PageHeader :title="isEdit ? '编辑文章' : '写文章'" />

    <!-- 顶部工具条 -->
    <div class="card toolbar">
      <el-button :icon="ArrowLeft" circle plain @click="goBack" />
      <el-input
        v-model="form.title"
        class="title-input"
        placeholder="请输入标题…"
        maxlength="100"
      />
      <div class="toolbar-actions">
        <el-button :loading="saving" @click="save(0)">存草稿</el-button>
        <el-button type="primary" :loading="saving" @click="save(1)">发布</el-button>
      </div>
    </div>

    <!-- 主体两栏：左编辑 / 右预览 -->
    <el-row :gutter="16" class="main-row">
      <el-col :xs="24" :md="12">
        <div class="card pane">
          <div class="pane-label">正文 (Markdown)</div>
          <el-input
            v-model="form.content"
            type="textarea"
            class="content-area"
            resize="none"
            placeholder="在此使用 Markdown 编写正文…"
          />
        </div>
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="card pane">
          <div class="pane-label">实时预览</div>
          <div class="preview markdown-body" v-html="previewHtml"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 文章设置 -->
    <div class="card settings">
      <div class="settings-title">文章设置</div>
      <el-form label-width="84px" label-position="top">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="摘要">
              <el-input
                v-model="form.summary"
                type="textarea"
                :rows="3"
                placeholder="选填，用于列表展示"
                maxlength="300"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="12">
            <el-form-item label="缩略图 / 顶部背景图">
              <div class="thumb-block">
                <el-upload
                  :show-file-list="false"
                  accept="image/*"
                  :http-request="handleUpload"
                >
                  <div class="thumb-uploader">
                    <el-image v-if="form.thumbnail" :src="form.thumbnail" fit="cover" class="thumb-preview" />
                    <div v-else class="thumb-placeholder">
                      <el-icon><Plus /></el-icon>
                      <span>点击上传</span>
                    </div>
                  </div>
                </el-upload>
                <el-input
                  v-model="form.thumbnail"
                  class="thumb-url"
                  placeholder="也可直接填写图片 URL"
                  clearable
                />
              </div>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="8">
            <el-form-item label="分类">
              <el-select v-model="form.categoryId" placeholder="请选择分类" clearable style="width: 100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="8">
            <el-form-item label="标签">
              <el-select
                v-model="form.tagIds"
                multiple
                filterable
                placeholder="请选择标签"
                style="width: 100%"
              >
                <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="8">
            <el-form-item label="选项">
              <div class="switches">
                <span class="switch-item">
                  <span class="switch-label">是否公开</span>
                  <el-switch v-model="form.isPublic" :active-value="1" :inactive-value="0" />
                </span>
                <span class="switch-item">
                  <span class="switch-label">置顶</span>
                  <el-switch v-model="form.top" :active-value="1" :inactive-value="0" />
                </span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.editor-page {
  padding-bottom: 24px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: var(--space-4);
}
.title-input {
  flex: 1;
}
.title-input :deep(.el-input__wrapper) {
  box-shadow: none;
  background: transparent;
}
.title-input :deep(.el-input__inner) {
  font-size: 20px;
  font-weight: 700;
}
.toolbar-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.main-row {
  margin-bottom: var(--space-4);
}
.pane {
  padding: 14px 16px;
  height: 520px;
  display: flex;
  flex-direction: column;
}
.pane-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.content-area {
  flex: 1;
}
.content-area :deep(.el-textarea__inner) {
  height: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 14px;
  line-height: 1.7;
}
.preview {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
}
.settings {
  padding: 18px 20px;
}
.settings-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-strong);
  margin-bottom: 14px;
}
.thumb-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.thumb-uploader {
  width: 220px;
  height: 124px;
  border: 1px dashed var(--border, #dcdfe6);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}
.thumb-uploader:hover {
  border-color: var(--el-color-primary);
}
.thumb-preview {
  width: 100%;
  height: 100%;
  display: block;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
}
.thumb-placeholder .el-icon {
  font-size: 22px;
}
.thumb-url {
  width: 220px;
}
.switches {
  display: flex;
  gap: 28px;
  align-items: center;
}
.switch-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.switch-label {
  font-size: 13.5px;
  color: var(--text);
}
</style>
