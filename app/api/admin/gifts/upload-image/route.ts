import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = createAdminClient()

  // Auth check: apenas admins podem fazer upload.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: adminRow } = await admin
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  const originalName = (file as any).name ? String((file as any).name) : 'image'
  const ext = originalName.includes('.') ? originalName.split('.').pop() : undefined
  const safeExt = ext ? `.${ext}` : ''
  const fileName = `gifts/${randomUUID()}${safeExt}`

  try {
    const contentType = file.type || 'application/octet-stream'

    const uploadRes = await admin.storage
      .from('gift-images')
      .upload(fileName, file, {
        contentType,
        upsert: true,
      })

    if (uploadRes.error) throw uploadRes.error

    const publicUrlRes = admin.storage.from('gift-images').getPublicUrl(fileName)

    return NextResponse.json({
      ok: true,
      image_url: publicUrlRes.data.publicUrl,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

