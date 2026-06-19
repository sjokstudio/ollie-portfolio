import { ensureSchema, error, json } from '../_utils.js'

export async function onRequestGet(context) {
  try {
    await ensureSchema(context.env.DB)
    const rows = await context.env.DB.prepare('SELECT key, value FROM site_settings').all()
    const settings = Object.fromEntries((rows.results || []).map((row) => [row.key, row.value]))
    return json({ settings })
  } catch (settingsError) {
    return error(settingsError.message, 500)
  }
}
