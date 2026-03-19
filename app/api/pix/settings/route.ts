import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('pix_settings')
    .select('pix_key, pix_qr_url, updated_at')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch pix settings' }, { status: 500 })
  }

  return NextResponse.json({
    pix_key: data?.pix_key ?? null,
    pix_qr_url: data?.pix_qr_url ?? null,
  })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const admin = createAdminClient()

  // Auth check: apenas admins podem alterar.
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

  try {
    const body = await request.json()
    const pix_key = typeof body?.pix_key === 'string' ? body.pix_key : null
    const pix_qr_url = typeof body?.pix_qr_url === 'string' ? body.pix_qr_url : null

    const { error: upsertError } = await admin
      .from('pix_settings')
      .upsert(
        {
          id: 1,
          pix_key,
          pix_qr_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )

    if (upsertError) throw upsertError

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update pix settings' }, { status: 500 })
  }
}

