import { error } from '../../_utils.js'

export async function onRequestGet(context) {
  try {
    if (!context.env.MEDIA_BUCKET) return error('Missing R2 binding: MEDIA_BUCKET', 500)
    const path = Array.isArray(context.params.path)
      ? context.params.path.join('/')
      : context.params.path
    if (!path) return error('Media not found', 404)

    const object = await context.env.MEDIA_BUCKET.get(path)
    if (!object) return error('Media not found', 404)

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': object.httpMetadata?.cacheControl || 'public, max-age=31536000',
      },
    })
  } catch (mediaError) {
    return error(mediaError.message, 500)
  }
}
