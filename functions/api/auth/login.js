import { createSession, error, json, readJson, sessionCookie } from '../../_utils.js'

export async function onRequestPost(context) {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET } = context.env
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !SESSION_SECRET) {
    return error('Admin environment variables are not configured', 500)
  }

  const body = await readJson(context.request)
  if (body.username !== ADMIN_USERNAME || body.password !== ADMIN_PASSWORD) {
    return error('Invalid username or password', 401)
  }

  const token = await createSession(body.username, SESSION_SECRET)
  return json({ ok: true }, 200, {
    'Set-Cookie': sessionCookie(token),
  })
}
