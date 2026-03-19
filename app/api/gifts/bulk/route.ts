import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type BulkGiftInput = {
  name: string
  category: string
  description?: string | null
  image_url?: string | null
  source_link?: string | null
  total_needed: number
}

function normalizeGift(input: any): BulkGiftInput | null {
  const name = typeof input?.name === 'string' ? input.name.trim() : ''
  const category = typeof input?.category === 'string' ? input.category.trim() : ''
  const total = Number(input?.total_needed)

  if (!name || !category || !Number.isFinite(total)) return null

  return {
    name,
    category,
    description: input?.description ? String(input.description) : null,
    image_url: input?.image_url ? String(input.image_url) : null,
    source_link: input?.source_link ? String(input.source_link) : null,
    total_needed: Math.max(1, Math.floor(total)),
  }
}

function looksLikeDirectImageUrl(value: string) {
  if (!value) return false
  if (value.startsWith('data:image/')) return true
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(value)
}

async function extractOgImage(sourceUrl: string): Promise<string | null> {
  try {
    // Se já for imagem direta, reaproveita.
    if (looksLikeDirectImageUrl(sourceUrl)) return sourceUrl

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(sourceUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) return null

    const html = await res.text()

    const ogMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      ) ||
      html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      )

    const raw = ogMatch?.[1]
    if (!raw) return null

    // Resolve URLs relativas.
    return raw.startsWith('http') || raw.startsWith('data:')
      ? raw
      : new URL(raw, sourceUrl).href
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = createAdminClient()

  // Auth check: apenas admins podem inserir.
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
    const rawGifts = body?.gifts

    if (!Array.isArray(rawGifts)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const gifts = rawGifts.map(normalizeGift).filter(Boolean) as BulkGiftInput[]

    if (gifts.length === 0) {
      return NextResponse.json({ error: 'No valid gifts found' }, { status: 400 })
    }

    // Idempotência: se o presente (pelo `name`) já existir, ignora e não adiciona de novo.
    const uniqueNames = Array.from(new Set(gifts.map((g) => g.name)))
    const { data: existing, error: existingError } = await supabase
      .from('gifts')
      .select('name')
      .in('name', uniqueNames)

    if (existingError) throw existingError

    const existingNames = new Set((existing ?? []).map((r) => r.name))
    const giftsToInsertRaw = gifts.filter((g) => !existingNames.has(g.name))
    // Evita duplicar dentro do próprio arquivo (mesmo `name` repetido).
    const giftsToInsert = Array.from(
      giftsToInsertRaw.reduce((acc, g) => {
        if (!acc.has(g.name)) acc.set(g.name, g)
        return acc
      }, new Map<string, BulkGiftInput>() as Map<string, BulkGiftInput>).values(),
    )

    if (giftsToInsert.length === 0) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        ignored: gifts.length,
      })
    }

    // Se `image_url` vier vazio, tenta extrair imagem da URL via `og:image`.
    const giftsToInsertWithImages: BulkGiftInput[] = []
    for (const g of giftsToInsert) {
      if (g.image_url) {
        giftsToInsertWithImages.push(g)
        continue
      }

      if (!g.source_link) {
        giftsToInsertWithImages.push(g)
        continue
      }

      const extracted = await extractOgImage(g.source_link)
      giftsToInsertWithImages.push({
        ...g,
        image_url: extracted,
      })
    }

    const { data, error } = await supabase
      .from('gifts')
      .insert(
        giftsToInsertWithImages.map((g) => ({
          name: g.name,
          category: g.category,
          description: g.description,
          image_url: g.image_url,
          total_needed: g.total_needed,
          reserved_count: 0,
          status: 'available',
        })),
      )
      .select()

    if (error) throw error

    return NextResponse.json({
      ok: true,
      inserted: data?.length || 0,
      ignored: gifts.length - (data?.length || 0),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to insert bulk gifts' }, { status: 500 })
  }
}

