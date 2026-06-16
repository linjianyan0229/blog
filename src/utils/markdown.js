import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import hljs from 'highlight.js/lib/common'

/**
 * 配置 markdown-it：代码高亮 + 标题锚点（与后端 toc 的 anchor 规则保持一致：
 * 后端按标题文本生成锚点，这里用 slugify 生成可跳转 id）。
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch {
        /* ignore */
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

/** 与后端目录锚点一致的 slug 规则 */
export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w一-龥-]/g, '')
}

md.use(anchor, {
  slugify,
  permalink: anchor.permalink.headerLink({ safariReaderFix: true }),
  tabIndex: false,
})

export function renderMarkdown(content) {
  if (!content) return ''
  return md.render(content)
}

/** 外链在新窗口打开 */
const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const href = tokens[idx].attrGet('href') || ''
  if (/^https?:\/\//.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
  }
  return defaultRender(tokens, idx, options, env, self)
}

export default md
