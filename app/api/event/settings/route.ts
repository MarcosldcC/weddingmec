import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('event_settings')
    .select('wedding_datetime, wedding_location')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }

  return NextResponse.json({
    wedding_datetime: data?.wedding_datetime ?? '2024-09-28T00:00:00Z',
    wedding_location: data?.wedding_location ?? '',
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
    const wedding_datetime = typeof body?.wedding_datetime === 'string' ? body.wedding_datetime : null
    const wedding_location = typeof body?.wedding_location === 'string' ? body.wedding_location : ''

    if (!wedding_datetime) {
      return NextResponse.json({ error: 'wedding_datetime é obrigatório' }, { status: 400 })
    }

    const { error: upsertError } = await admin
      .from('event_settings')
      .upsert(
        {
          id: 1,
          wedding_datetime,
          wedding_location,
        },
        { onConflict: 'id' },
      )

    if (upsertError) throw upsertError

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

