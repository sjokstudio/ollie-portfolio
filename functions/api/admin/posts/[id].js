import { ensureSchema, error, json, normalizePostInput, postFromRow, readJson, requireAdmin } from '../../../_utils.js'

export async function onRequestPut(context) {
  try {
    const session = await requireAdmin(context)
    if (!session) return error('Unauthorized', 401)

    await ensureSchema(context.env.DB)
    const id = context.params.id
    const existing = await context.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first()
    if (!existing) return error('Post not found', 404)

    const input = normalizePostInput(await readJson(context.request))
    const now = new Date().toISOString()
    const publishedAt = input.status === 'published'
      ? existing.published_at || now
      : null

    await context.env.DB.prepare(`
      UPDATE posts
      SET slug = ?, title = ?, category = ?, excerpt = ?, cover = ?, body = ?,
          source_url = ?, tags = ?, status = ?, updated_at = ?, published_at = ?
      WHERE id = ?
    `).bind(
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
      publishedAt,
      id,
    ).run()

    const row = await context.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first()
    return json({ post: postFromRow(row) })
  } catch (postError) {
    return error(postError.message, postError.message.includes('UNIQUE') ? 409 : 400)
  }
}

export async function onRequestDelete(context) {
  try {
    const session = await requireAdmin(context)
    if (!session) return error('Unauthorized', 401)

    await ensureSchema(context.env.DB)
    await context.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(context.params.id).run()
    return json({ ok: true })
  } catch (postError) {
    return error(postError.message, 500)
  }
}
