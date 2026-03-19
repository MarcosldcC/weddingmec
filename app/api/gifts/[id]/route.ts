import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { id } = await params

  try {
    const body = await request.json()
    const {
      status,
      name,
      category,
      description,
      total_needed,
      image_url,
    }: {
      status?: 'available' | 'almost_complete' | 'complete'
      name?: string
      category?: string
      description?: string | null
      total_needed?: number
      image_url?: string | null
    } = body

    // Só admins podem alterar presentes.
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

    const updatePayload: any = {}
    if (typeof status === 'string') updatePayload.status = status
    if (typeof name === 'string') updatePayload.name = name.trim()
    if (typeof category === 'string') updatePayload.category = category.trim()
    if (typeof description === 'string') updatePayload.description = description
    if (description === null) updatePayload.description = null
    if (typeof total_needed === 'number' && Number.isFinite(total_needed)) {
      updatePayload.total_needed = Math.max(1, Math.floor(total_needed))
    }
    if (typeof image_url === 'string') updatePayload.image_url = image_url.trim()
    if (image_url === null) updatePayload.image_url = null

    // Sem campos pra atualizar: mantém compatível com o antigo toggle.
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('gifts')
      .update(updatePayload)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0])
  } catch (error) {
    console.error('Error updating gift:', error)
    return NextResponse.json(
      { error: 'Failed to update gift' },
      { status: 500 }
    )
  }
}
