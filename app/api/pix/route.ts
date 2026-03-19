import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    const { contributor_name, amount } = body

    const { data, error } = await supabase
      .from('pix_contributions')
      .insert([
        {
          contributor_name,
          amount,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0], { status: 201 })
  } catch (error) {
    console.error('Error creating PIX contribution:', error)
    return NextResponse.json(
      { error: 'Failed to create PIX contribution' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase.from('pix_contributions').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting PIX contribution:', error)
    return NextResponse.json({ error: 'Failed to delete contribution' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { data: contributions, error } = await supabase
      .from('pix_contributions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const total = contributions?.reduce((sum, c) => sum + c.amount, 0) || 0

    return NextResponse.json({
      contributions: contributions || [],
      total,
      count: contributions?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching PIX contributions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PIX contributions' },
      { status: 500 }
    )
  }
}
