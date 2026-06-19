import { ensureSchema, error, json, postFromRow } from '../../_utils.js'

export async function onRequestGet(context) {
  try {
    await ensureSchema(context.env.DB)
    const rows = await context.env.DB.prepare(`
      SELECT * FROM posts
      WHERE status = 'published'
      ORDER BY COALESCE(published_at, created_at) DESC
    `).all()
    return json({ posts: (rows.results || []).map(postFromRow) })
  } catch (postsError) {
    return error(postsError.message, 500)
  }
}
