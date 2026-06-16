import request from './request'

/** 文件上传（需登录） */
export const fileApi = {
  /**
   * 上传图片，返回可直接访问的 URL（如 /api/uploads/2026/06/xxx.png）
   * @param {File} file 图片文件
   * @param {(percent:number)=>void} [onProgress]
   */
  upload(file, onProgress) {
    const form = new FormData()
    form.append('file', file)
    return request.post('/file/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
      },
    })
  },
}
