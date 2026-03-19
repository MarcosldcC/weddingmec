import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function extractStorageObjectPath(publicUrl: string, bucket: string): string | null {
  if (!publicUrl) return null

  // Exemplo típico de publicUrl do Supabase:
  // http://127.0.0.1:54321/storage/v1/object/public/gift-images/gifts/uuid.jpg
  const regex = new RegExp(
    `/storage\\/v1\\/object\\/public\\/${bucket}\\/(.+)$`,
    'i',
  )
  const match = publicUrl.match(regex)
  return match?.[1] ?? null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = createAdminClient()

  // Auth check: apenas admins podem excluir.
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

  const body = await request.json().catch(() => null)
  const ids = body?.ids

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids é obrigatório' }, { status: 400 })
  }

  const cleanIds = ids.filter((x: any) => typeof x === 'string' && x.trim().length > 0)
  if (cleanIds.length === 0) {
    return NextResponse.json({ error: 'ids inválidos' }, { status: 400 })
  }

  // Busca os gifts pra também limpar imagens do Storage.
  const { data: gifts, error: giftsError } = await admin
    .from('gifts')
    .select('id,image_url')
    .in('id', cleanIds)

  if (giftsError) {
    return NextResponse.json({ error: 'Failed to load gifts' }, { status: 500 })
  }

  // Deleta os gifts (reservas têm FK com ON DELETE CASCADE).
  const { error: deleteError, data: deleted } = await admin
    .from('gifts')
    .delete()
    .in('id', cleanIds)
    .select('id')

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete gifts' }, { status: 500 })
  }

  // Limpa objetos no bucket de imagens.
  const objectPaths = (gifts ?? [])
    .map((g) => (g.image_url ? extractStorageObjectPath(g.image_url, 'gift-images') : null))
    .filter(Boolean) as string[]

  if (objectPaths.length > 0) {
    const { error: storageError } = await admin
      .storage
      .from('gift-images')
      .remove(objectPaths)

    if (storageError) {
      // Não bloqueia a exclusão do DB se o storage falhar; só loga.
      console.error('storageError:', storageError)
    }
  }

  return NextResponse.json({
    ok: true,
    deleted: deleted?.length ?? 0,
  })
}

