import { error, json, readJson, requireAdmin } from '../../_utils.js'

const X_STATUS_RE = /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/i
const MAX_TITLE_LENGTH = 28
const MAX_EXCERPT_LENGTH = 80

function normalizeUrl(value) {
  const url = String(value || '').trim()
  const match = url.match(X_STATUS_RE)
  if (!match) throw new Error('请输入有效的 X / Twitter 推文链接')
  return {
    id: match[1],
    url: url.replace('twitter.com', 'x.com').split('?')[0],
  }
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

function stripHtml(value) {
  return decodeHtml(String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00a0/g, ' '))
}

function cleanTweetText(html) {
  const text = stripHtml(html)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .replace(/\s*—\s*.+?\(@.+?\)\s+\w+\s+\d{1,2},\s+\d{4}\s*$/i, '')
    .replace(/\s*—\s*.+?\(@.+?\)\s+.+$/i, '')
    .trim()

  return text || '这是一条来自 X 的精选内容。'
}

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function truncate(value, maxLength) {
  const text = compact(value)
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

async function fetchOEmbed(url) {
  const endpoints = ['https://publish.x.com/oembed', 'https://publish.twitter.com/oembed']
  let lastError = null

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}&omit_script=true`)
      if (!response.ok) {
        lastError = new Error(`X oEmbed 请求失败：${response.status}`)
        continue
      }
      return response.json()
    } catch (fetchError) {
      lastError = fetchError
    }
  }

  throw lastError || new Error('无法读取这条推文')
}

export async function onRequestPost(context) {
  try {
    const session = await requireAdmin(context)
    if (!session) return error('Unauthorized', 401)

    const { url } = await readJson(context.request)
    const tweet = normalizeUrl(url)
    const embed = await fetchOEmbed(tweet.url)
    const tweetText = cleanTweetText(embed.html)
    const title = truncate(tweetText, MAX_TITLE_LENGTH)
    const excerpt = truncate(tweetText, MAX_EXCERPT_LENGTH)

    return json({
      postDraft: {
        id: '',
        title,
        slug: `x-post-${tweet.id}`,
        category: 'AI',
        excerpt,
        cover: '',
        body: `${tweetText}\n\n来源：${tweet.url}`,
        sourceUrl: tweet.url,
        tags: ['X', 'Ollie'],
        status: 'draft',
      },
    })
  } catch (importError) {
    return error(importError.message || '导入推文失败', 400)
  }
}
