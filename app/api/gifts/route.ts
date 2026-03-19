import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { data: gifts, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(gifts || [])
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = createAdminClient()
  
  try {
    // Só admins podem criar/editar presentes.
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

    const body = await request.json()
    const { name, category, description, image_url, total_needed } = body

    const { data, error } = await supabase
      .from('gifts')
      .insert([
        {
          name,
          category,
          description,
          image_url,
          total_needed: total_needed || 1,
          reserved_count: 0,
          status: 'available',
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0], { status: 201 })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json(
      { error: 'Failed to create gift' },
      { status: 500 }
    )
  }
}
