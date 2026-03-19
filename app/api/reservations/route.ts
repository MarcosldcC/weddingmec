import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    const { gift_id, guest_name, quantity } = body

    // Busca o gift atual para calcular o novo reserved_count e status
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('reserved_count, total_needed')
      .eq('id', gift_id)
      .single()

    if (giftError) throw giftError

    const newReservedCount = (gift.reserved_count || 0) + quantity
    const total = gift.total_needed || 1
    const newStatus =
      newReservedCount >= total
        ? 'complete'
        : newReservedCount >= total - 1
          ? 'almost_complete'
          : 'available'

    // Insere a reserva
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .insert([{ gift_id, guest_name, quantity }])
      .select()

    if (resError) throw resError

    // Atualiza o gift com valores calculados
    const { error: updateError } = await supabase
      .from('gifts')
      .update({ reserved_count: newReservedCount, status: newStatus })
      .eq('id', gift_id)

    if (updateError) throw updateError

    return NextResponse.json(reservation?.[0], { status: 201 })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { id, quantity: qtyToRemove } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Busca a reserva para saber a quantidade e o gift_id
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('gift_id, quantity')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const removeQty = qtyToRemove && qtyToRemove < reservation.quantity
      ? qtyToRemove
      : reservation.quantity

    const remainingQty = reservation.quantity - removeQty

    // Se sobrou quantidade, atualiza a reserva; senão, deleta
    if (remainingQty > 0) {
      const { error: updateResError } = await supabase
        .from('reservations')
        .update({ quantity: remainingQty })
        .eq('id', id)
      if (updateResError) throw updateResError
    } else {
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)
      if (deleteError) throw deleteError
    }

    // Atualiza o gift: decrementa reserved_count e recalcula status
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('reserved_count, total_needed')
      .eq('id', reservation.gift_id)
      .single()

    if (giftError) throw giftError

    const newReservedCount = Math.max(0, (gift.reserved_count || 0) - removeQty)
    const total = gift.total_needed || 1
    const newStatus =
      newReservedCount >= total
        ? 'complete'
        : newReservedCount >= total - 1
          ? 'almost_complete'
          : 'available'

    await supabase
      .from('gifts')
      .update({ reserved_count: newReservedCount, status: newStatus })
      .eq('id', reservation.gift_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const giftId = request.nextUrl.searchParams.get('gift_id')

  try {
    let query = supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })

    if (giftId) {
      query = query.eq('gift_id', giftId)
    }

    const { data: reservations, error } = await query

    if (error) throw error

    return NextResponse.json(reservations || [])
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}
