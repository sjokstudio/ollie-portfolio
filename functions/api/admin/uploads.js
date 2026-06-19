import { error, json, requireAdmin, validateImage } from '../../_utils.js'

export async function onRequestPost(context) {
  try {
    const session = await requireAdmin(context)
    if (!session) return error('Unauthorized', 401)
    if (!context.env.MEDIA_BUCKET) return error('Missing R2 binding: MEDIA_BUCKET', 500)

    const formData = await context.request.formData()
    const file = formData.get('file')
    validateImage(file)

    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`
    await context.env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    })

    return json({ key, url: `/api/media/${key}` })
  } catch (uploadError) {
    return error(uploadError.message, 400)
  }
}
