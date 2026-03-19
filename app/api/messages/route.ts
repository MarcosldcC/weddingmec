import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type GuestMessageRow = {
  id: string
  guest_name: string
  message: string
  created_at: string
}

export async function GET(_request: NextRequest) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('guest_messages')
    .select('id, guest_name, message, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 },
    )
  }

  return NextResponse.json({ messages: data as GuestMessageRow[] })
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    body = null
  }

  const { guest_name, message } = (body || {}) as {
    guest_name?: unknown
    message?: unknown
  }

  const guestName =
    typeof guest_name === 'string' ? guest_name.trim() : undefined
  const msg = typeof message === 'string' ? message.trim() : undefined

  if (!guestName || guestName.length < 2) {
    return NextResponse.json(
      { error: 'Informe seu nome (mínimo 2 caracteres).' },
      { status: 400 },
    )
  }

  if (!msg || msg.length < 2) {
    return NextResponse.json(
      { error: 'Informe sua mensagem (mínimo 2 caracteres).' },
      { status: 400 },
    )
  }

  if (guestName.length > 80) {
    return NextResponse.json(
      { error: 'Seu nome está muito longo (máx. 80 caracteres).' },
      { status: 400 },
    )
  }

  if (msg.length > 2000) {
    return NextResponse.json(
      { error: 'Sua mensagem está muito longa (máx. 2000 caracteres).' },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from('guest_messages')
    .insert([{ guest_name: guestName, message: msg }])
    .select('id, guest_name, message, created_at')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to submit message' },
      { status: 500 },
    )
  }

  return NextResponse.json({ message: data }, { status: 201 })
}

