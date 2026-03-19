'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CountdownTimer from '@/components/countdown-timer'
import { Allura, Cormorant_Garamond } from 'next/font/google'

const namesFont = Cormorant_Garamond({ subsets: ['latin'], weight: ['300'] })
const verseFont = Allura({ subsets: ['latin'], weight: ['400'] })

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [eventSettings, setEventSettings] = useState<{
    wedding_datetime: string
    wedding_location: string
  } | null>(null)

  const [transitionOpen, setTransitionOpen] = useState(false)
  const [circleWipe, setCircleWipe] = useState(false)

  type GuestMessage = {
    id: string
    guest_name: string
    message: string
    created_at: string
  }

  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messages, setMessages] = useState<GuestMessage[]>([])

  const [guestName, setGuestName] = useState('')
  const [guestMessage, setGuestMessage] = useState('')
  const [submitMessageLoading, setSubmitMessageLoading] = useState(false)
  const [submitMessageError, setSubmitMessageError] = useState<string | null>(
    null,
  )
  const [submitMessageSuccess, setSubmitMessageSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/event/settings')
        const json = await res.json()
        setEventSettings({
          wedding_datetime: json.wedding_datetime,
          wedding_location: json.wedding_location,
        })
      } catch {
        setEventSettings({
          wedding_datetime: '2024-09-28T00:00:00Z',
          wedding_location: 'Quinta do Freio, Sintra',
        })
      }
    }

    fetchSettings()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    const fetchMessages = async () => {
      setMessagesLoading(true)
      setMessagesError(null)

      try {
        const res = await fetch('/api/messages')
        const json = await res.json()
        setMessages(json.messages || [])
      } catch {
        setMessagesError('Não foi possível carregar as mensagens.')
      } finally {
        setMessagesLoading(false)
      }
    }

    fetchMessages()
  }, [mounted])

  if (!mounted) return null

  const weddingDate = eventSettings?.wedding_datetime ?? '2024-09-28T00:00:00Z'
  const weddingLocation = eventSettings?.wedding_location ?? 'Quinta do Freio, Sintra'
  const weddingDateLabel = (() => {
    const d = new Date(weddingDate)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  })()

  const startNavTransition = (href: string) => {
    // evita double click
    if (transitionOpen) return

    setTransitionOpen(true)
    setCircleWipe(false)

    // dispara no próximo tick para garantir transição
    requestAnimationFrame(() => setCircleWipe(true))

    window.setTimeout(() => {
      router.push(href)
    }, 550)

    window.setTimeout(() => {
      setTransitionOpen(false)
      setCircleWipe(false)
    }, 900)
  }

  return (
    <main className="relative min-h-screen bg-[oklch(0.22_0.03_130/0.98)]">
      {/* Fundo: verde musgo (sem faixa/overlay extra) */}

      {/* Discreet navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-6 pt-5">
          <div className="flex justify-center gap-6 text-sm">
            <Link
              href="/gifts"
              onClick={(e) => {
                e.preventDefault()
                startNavTransition('/gifts')
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              Lista de Presentes
            </Link>
          </div>
        </div>
      </nav>

      {/* Color wipe transition */}
      {transitionOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div className="absolute inset-0 bg-[oklch(0.22_0.03_130/0.98)]" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full"
            style={{
              transform: circleWipe ? 'translateY(-25%) scale(60)' : 'translateY(-25%) scale(0)',
              transition: 'transform 650ms cubic-bezier(0.2, 0.9, 0.2, 1)',
            }}
          />
        </div>
      )}

      {/* Hero content */}
      <div className="relative z-10 flex min-h-[78vh] items-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-6 py-16 sm:py-24">
          <div className="text-center space-y-6">
            <h1
              className={`${namesFont.className} text-5xl sm:text-6xl md:text-7xl leading-[0.92] text-white drop-shadow-sm`}
              style={{ fontWeight: 300 }}
            >
              <span className="block">Marcos</span>
              <span className="block">& Carolina</span>
            </h1>

            {/* Date and location */}
            <div className="space-y-1 text-white/85">
              <p className="text-base sm:text-lg">{weddingDateLabel}</p>
              <p className="text-base sm:text-lg">{weddingLocation}</p>
            </div>

            {/* Minimal countdown */}
            <div className="mx-auto max-w-3xl">
              <CountdownTimer targetDate={weddingDate} variant="minimal" />
            </div>

            {/* Versículo */}
            <div className="mx-auto max-w-3xl pt-2">
              <p
                className={`${verseFont.className} text-white/90 text-lg sm:text-xl italic leading-relaxed`}
                style={{ fontWeight: 400 }}
              >
                <span className="block">
                  O amor não se alegra com a injustiça, mas se alegra com a verdade.
                </span>
                <span className="block">
                  · Tudo sofre, tudo crê, tudo espera, tudo suporta.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story section (parte branca) */}
      <section className="relative z-20 bg-white rounded-t-[56px] sm:rounded-t-[90px] overflow-hidden">
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-6 lg:px-6 pt-20 pb-14 sm:pt-16 sm:pb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-primary font-semibold">
            Nossa história
          </h2>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Placeholder da imagem da história */}
            <div className="w-full">
              <div className="aspect-[4/3] rounded-3xl bg-secondary/20 border border-border/60 flex items-center justify-center p-6">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold">
                    +
                  </div>
                  <p className="text-foreground/70 text-sm sm:text-base">
                    Imagem da nossa história (placeholder)
                  </p>
                  <p className="text-foreground/50 text-xs sm:text-sm">
                    Assim que você cadastrar no admin, essa área mostra a foto real.
                  </p>
                </div>
              </div>
            </div>

            {/* Conteúdo expandido */}
            <div className="space-y-6 text-foreground/80 text-base sm:text-lg leading-relaxed">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Como nos conhecemos
                </div>
                <p>
                  Somos uma história de encontros, conversas longas e um “nós” que foi crescendo com
                  o tempo. Agora, queremos celebrar esse começo junto com vocês.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Momentos marcantes
                </div>
                <p>
                  Cada fase da nossa jornada tem um pedaço de vocês na lembrança: risadas, planos,
                  desafios superados e aquela certeza que ficou mais forte a cada dia.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Galeria de fotos */}
      <section className="relative z-10 bg-white">
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-6 lg:px-6 pt-14 pb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-primary font-semibold">
            Galeria de fotos
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              'Fotos do casal',
              'Pré-wedding',
              'Momentos especiais',
            ].map((label) => (
              <div
                key={label}
                className="rounded-3xl bg-secondary/10 border border-border/60 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-secondary/15 flex items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold">
                      +
                    </div>
                    <p className="text-foreground/70 text-sm">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mensagens para os noivos */}
      <section className="relative z-10 bg-white">
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-6 lg:px-6 pt-14 pb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-primary font-semibold">
            Mensagens para os noivos
          </h2>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <div className="rounded-3xl border border-border/60 bg-secondary/5 p-6 sm:p-8">
              <div className="space-y-2">
                <p className="text-sm text-foreground/70">
                  Convidados podem enviar mensagens sem login. Basta informar seu nome e escrever uma mensagem.
                </p>
              </div>

              <form
                className="mt-6 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setSubmitMessageError(null)
                  setSubmitMessageSuccess(false)
                  setSubmitMessageLoading(true)

                  try {
                    const res = await fetch('/api/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        guest_name: guestName,
                        message: guestMessage,
                      }),
                    })

                    const json = await res.json()
                    if (!res.ok) {
                      throw new Error(json?.error || 'Falha ao enviar mensagem.')
                    }

                    setGuestName('')
                    setGuestMessage('')
                    setSubmitMessageSuccess(true)

                    // Atualiza a lista para ver a mensagem enviada.
                    const listRes = await fetch('/api/messages')
                    const listJson = await listRes.json()
                    setMessages(listJson.messages || [])
                  } catch (err: unknown) {
                    setSubmitMessageError(
                      err instanceof Error ? err.message : 'Falha ao enviar mensagem.',
                    )
                  } finally {
                    setSubmitMessageLoading(false)
                  }
                }}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Seu nome
                  </label>
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex.: Ana Paula"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Mensagem
                  </label>
                  <textarea
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    className="w-full min-h-[120px] rounded-xl border border-border/70 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                    placeholder="Escreva aqui..."
                  />
                </div>

                {submitMessageError && (
                  <p className="text-sm text-destructive">{submitMessageError}</p>
                )}
                {submitMessageSuccess && (
                  <p className="text-sm text-primary">
                    Mensagem enviada com sucesso.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitMessageLoading}
                  className="w-full rounded-xl bg-primary text-white py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {submitMessageLoading ? 'Enviando...' : 'Enviar mensagem'}
                </button>
              </form>
            </div>

            {/* Lista */}
            <div className="rounded-3xl border border-border/60 bg-secondary/5 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-foreground/80">
                  Lista de mensagens exibidas
                </p>
                <p className="text-xs text-foreground/60">
                  {messages.length ? `${messages.length} recente(s)` : '—'}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {messagesLoading && (
                  <p className="text-sm text-foreground/70">Carregando...</p>
                )}

                {messagesError && (
                  <p className="text-sm text-destructive">{messagesError}</p>
                )}

                {!messagesLoading && !messagesError && messages.length === 0 && (
                  <p className="text-sm text-foreground/70">
                    Ainda não há mensagens. Seja o primeiro a deixar a sua.
                  </p>
                )}

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl bg-background border border-border/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-semibold text-foreground/85">
                        {m.guest_name}
                      </p>
                      <p className="text-xs text-foreground/55">
                        {new Date(m.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-foreground/75 whitespace-pre-wrap">
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
