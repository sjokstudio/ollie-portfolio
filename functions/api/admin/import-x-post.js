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

function cleanManualText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function truncate(value, maxLength) {
  const text = compact(value)
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function expandEntities(text, entities) {
  let nextText = String(text || '')
  const urls = entities?.urls || []

  for (const item of urls) {
    if (item.url && item.expanded_url) {
      nextText = nextText.replaceAll(item.url, item.expanded_url)
    }
  }

  return nextText.trim()
}

async function fetchSyndicationTweet(tweetId) {
  const response = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=zh-cn`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!response.ok) throw new Error(`X syndication 请求失败：${response.status}`)
  const data = await response.json()
  if (!data?.text) return null

  return {
    text: expandEntities(data.text, data.entities),
    isTruncatedLongPost: Boolean(data.note_tweet),
  }
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

    const { url, text } = await readJson(context.request)
    const tweet = normalizeUrl(url)
    const manualText = cleanManualText(text)
    let tweetText = manualText
    let isTruncatedLongPost = false

    if (!tweetText) {
      const syndicationTweet = await fetchSyndicationTweet(tweet.id).catch(() => null)
      if (syndicationTweet?.text) {
        tweetText = syndicationTweet.text
        isTruncatedLongPost = syndicationTweet.isTruncatedLongPost
      } else {
        const embed = await fetchOEmbed(tweet.url)
        tweetText = cleanTweetText(embed.html)
      }
    }

    const title = truncate(tweetText, MAX_TITLE_LENGTH)
    const excerpt = truncate(tweetText, MAX_EXCERPT_LENGTH)
    const longPostNote = isTruncatedLongPost
      ? '\n\n提示：X 返回的长文内容可能被折叠了。如果这条推文有“显示更多”，请在导入面板的“展开全文”里粘贴完整内容后重新导入。'
      : ''

    return json({
      postDraft: {
        id: '',
        title,
        slug: `x-post-${tweet.id}`,
        category: 'AI',
        excerpt,
        cover: '',
        body: `${tweetText}${longPostNote}\n\n来源：${tweet.url}`,
        sourceUrl: tweet.url,
        tags: ['X', 'Ollie'],
        status: 'draft',
      },
    })
  } catch (importError) {
    return error(importError.message || '导入推文失败', 400)
  }
}
