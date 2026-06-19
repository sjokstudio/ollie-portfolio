import { ensureSchema, error, json, readJson, requireAdmin } from '../../_utils.js'

export async function onRequestPut(context) {
  try {
    const session = await requireAdmin(context)
    if (!session) return error('Unauthorized', 401)

    await ensureSchema(context.env.DB)
    const body = await readJson(context.request)
    const settings = body.settings || {}
    const now = new Date().toISOString()
    const allowedKeys = ['heroBackgroundUrl']

    await context.env.DB.batch(allowedKeys.map((key) => context.env.DB.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).bind(key, String(settings[key] || ''), now)))

    const rows = await context.env.DB.prepare('SELECT key, value FROM site_settings').all()
    return json({ settings: Object.fromEntries((rows.results || []).map((row) => [row.key, row.value])) })
  } catch (settingsError) {
    return error(settingsError.message, 500)
  }
}
