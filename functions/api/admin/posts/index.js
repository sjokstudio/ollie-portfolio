import { ensureSchema, error, json, normalizePostInput, postFromRow, readJson, requireAdmin } from '../../../_utils.js'

export async function onRequestGet(context) {
  try {
    const session = await requireAdmin(context)
    if (!session) return error('Unauthorized', 401)

    await ensureSchema(context.env.DB)
    const rows = await context.env.DB.prepare('SELECT * FROM posts ORDER BY updated_at DESC').all()
    return json({ posts: (rows.results || []).map(postFromRow) })
  } catch (postsError) {
    return error(postsError.message, 500)
  }
}

export async function onRequestPost(context) {
  try {
    const session = await requireAdmin(context)
    if (!session) return error('Unauthorized', 401)

    await ensureSchema(context.env.DB)
    const input = normalizePostInput(await readJson(context.request))
    const now = new Date().toISOString()
    const publishedAt = input.status === 'published' ? now : null
    const id = crypto.randomUUID()

    await context.env.DB.prepare(`
      INSERT INTO posts (
        id, slug, title, category, excerpt, cover, body, source_url, tags,
        status, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      input.slug,
      input.title,
      input.category,
      input.excerpt,
      input.cover,
      input.body,
      input.sourceUrl,
      JSON.stringify(input.tags),
      input.status,
      now,
      now,
      publishedAt,
    ).run()

    const row = await context.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first()
    return json({ post: postFromRow(row) }, 201)
  } catch (postError) {
    return error(postError.message, postError.message.includes('UNIQUE') ? 409 : 400)
  }
}
