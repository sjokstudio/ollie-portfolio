import { ensureSchema, error, json, postFromRow } from '../../_utils.js'

export async function onRequestGet(context) {
  try {
    await ensureSchema(context.env.DB)
    const slug = context.params.slug
    const row = await context.env.DB.prepare(`
      SELECT * FROM posts
      WHERE slug = ? AND status = 'published'
      LIMIT 1
    `).bind(slug).first()
    if (!row) return error('Post not found', 404)
    return json({ post: postFromRow(row) })
  } catch (postError) {
    return error(postError.message, 500)
  }
}
