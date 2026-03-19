'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import GiftCard from '@/components/gift-card'
import ReservationModal from '@/components/reservation-modal'
import PIXContributionForm from '@/components/pix-contribution-form'
import PIXQRCode from '@/components/pix-qrcode'
import PIXContributionList from '@/components/pix-contribution-list'
import { Copy, Check } from 'lucide-react'

function PixKeyBox({ pixKey }: { pixKey: string | null }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!pixKey) return
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-secondary/10 rounded-lg p-4 sm:p-6 space-y-3">
      <h3 className="font-serif text-lg font-bold text-primary">Chave PIX</h3>
      <p className="text-sm text-foreground/60">
        Você também pode usar a seguinte chave PIX:
      </p>
      <div className="flex items-center gap-2 bg-background rounded px-4 py-3">
        <span className="font-mono text-sm text-foreground/80 break-all flex-1">
          {pixKey ?? 'Defina a chave PIX no Admin'}
        </span>
        {pixKey && (
          <button
            onClick={handleCopy}
            className="shrink-0 text-foreground/50 hover:text-primary transition-colors"
            title="Copiar chave PIX"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

interface Gift {
  id: string
  name: string
  category: string
  description: string
  image_url: string | null
  total_needed: number
  reserved_count: number
  status: 'available' | 'almost_complete' | 'complete'
}

interface Contribution {
  id: string
  contributor_name: string
  amount: number
  created_at: string
}

interface PIXData {
  contributions: Contribution[]
  total: number
  count: number
}

type Tab = 'gifts' | 'pix'

export default function GiftsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('gifts')

  // Gifts state
  const [gifts, setGifts] = useState<Gift[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'almost_complete'>('all')
  const [giftsLoading, setGiftsLoading] = useState(true)
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [showModal, setShowModal] = useState(false)

  // PIX state
  const [pixData, setPixData] = useState<PIXData | null>(null)
  const [pixSettings, setPixSettings] = useState<{ pix_key: string | null; pix_qr_url: string | null } | null>(null)
  const [pixLoading, setPixLoading] = useState(true)

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const response = await fetch('/api/gifts')
        const data = await response.json()
        setGifts(Array.isArray(data) ? data : [])
      } catch {
        setGifts([])
      } finally {
        setGiftsLoading(false)
      }
    }
    fetchGifts()
  }, [])

  useEffect(() => {
    const fetchPix = async () => {
      try {
        const [pixRes, settingsRes] = await Promise.all([
          fetch('/api/pix'),
          fetch('/api/pix/settings'),
        ])
        const [pixJson, settingsJson] = await Promise.all([pixRes.json(), settingsRes.json()])
        setPixData(pixJson)
        setPixSettings(settingsJson)
      } catch {
        // silently fail
      } finally {
        setPixLoading(false)
      }
    }
    fetchPix()
  }, [])

  const handleReserve = (gift: Gift) => {
    setSelectedGift(gift)
    setShowModal(true)
  }

  const handleReservationSuccess = async () => {
    setShowModal(false)
    setSelectedGift(null)
    try {
      const response = await fetch('/api/gifts')
      const data = await response.json()
      if (Array.isArray(data)) setGifts(data)
    } catch {}
  }

  const handleContributionSuccess = async () => {
    try {
      const response = await fetch('/api/pix')
      const data = await response.json()
      setPixData(data)
    } catch {}
  }

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const categoryOptions = Array.from(new Set(gifts.map((g) => g.category))).sort()

  const filteredGifts = gifts.filter((g) => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false
    if (statusFilter !== 'all' && g.status !== statusFilter) return false
    if (!normalizedSearch) return true
    return (
      g.name.toLowerCase().includes(normalizedSearch) ||
      g.category.toLowerCase().includes(normalizedSearch) ||
      (g.description || '').toLowerCase().includes(normalizedSearch)
    )
  })

  const sectionCategories = Array.from(new Set(filteredGifts.map((g) => g.category))).sort()

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="font-serif text-4xl md:text-5xl text-primary font-bold">
                Presentes
              </h1>
              <p className="text-foreground/60">
                Escolha um presente ou contribua com PIX
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 border-b border-border/40">
            <button
              onClick={() => setActiveTab('gifts')}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === 'gifts'
                  ? 'bg-primary text-white'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Lista de Presentes
            </button>
            <button
              onClick={() => setActiveTab('pix')}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === 'pix'
                  ? 'bg-primary text-white'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Contribuir com PIX
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Gifts Tab */}
        {activeTab === 'gifts' && (
          <>
            {giftsLoading ? (
              <div className="text-center py-12">
                <p className="text-foreground/60">Carregando presentes...</p>
              </div>
            ) : gifts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60">Nenhum presente disponível no momento</p>
              </div>
            ) : (
              <>
                <div className="mb-10 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-foreground/80">Busca</label>
                      <input
                        className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-secondary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ex: jogo de pratos, cozinha..."
                      />
                    </div>
                    <div className="w-full sm:w-56">
                      <label className="text-sm font-semibold text-foreground/80">Categoria</label>
                      <select
                        className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-secondary/20"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value || 'all')}
                      >
                        <option value="all">Todas</option>
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full sm:w-56">
                      <label className="text-sm font-semibold text-foreground/80">Status</label>
                      <select
                        className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-secondary/20"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'almost_complete')}
                      >
                        <option value="all">Todos</option>
                        <option value="available">Disponível</option>
                        <option value="almost_complete">Quase completo</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-foreground/60">
                    {filteredGifts.length} presente(s) encontrado(s)
                  </div>
                </div>

                {filteredGifts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-foreground/60">Nenhum presente corresponde aos filtros.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {sectionCategories.map((cat) => {
                      const sectionGifts = filteredGifts.filter((g) => g.category === cat)
                      if (sectionGifts.length === 0) return null
                      return (
                        <section key={cat} className="space-y-4">
                          <h3 className="font-serif text-2xl font-bold text-primary">{cat}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sectionGifts.map((gift) => (
                              <GiftCard key={gift.id} gift={gift} onReserve={handleReserve} />
                            ))}
                          </div>
                        </section>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* PIX Tab */}
        {activeTab === 'pix' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: QR Code */}
              <div className="space-y-8">
                <p className="text-foreground/70 text-lg">
                  Escaneie o código QR abaixo ou utilize a chave PIX para fazer sua contribuição.
                </p>
                <div className="bg-card rounded-lg p-6 sm:p-8 border border-border/50">
                  <PIXQRCode qrUrl={pixSettings?.pix_qr_url ?? null} />
                </div>
                <PixKeyBox pixKey={pixSettings?.pix_key ?? null} />
              </div>

              {/* Right: Form + Stats */}
              <div className="space-y-8">
                <PIXContributionForm onSuccess={handleContributionSuccess} />
                {!pixLoading && pixData && (
                  <div className="bg-card rounded-lg p-4 sm:p-6 border border-border/50 space-y-4">
                    <h3 className="font-serif text-lg font-bold text-primary">Resumo de Contribuições</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/10 rounded p-4 text-center">
                        <div className="font-serif text-3xl font-bold text-primary">{pixData.count}</div>
                        <p className="text-sm text-foreground/60 mt-1">Contribuintes</p>
                      </div>
                      <div className="bg-secondary/10 rounded p-4 text-center">
                        <div className="font-serif text-3xl font-bold text-primary">
                          R$ {(pixData.total / 100).toFixed(2)}
                        </div>
                        <p className="text-sm text-foreground/60 mt-1">Total Arrecadado</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!pixLoading && pixData && pixData.contributions.length > 0 && (
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-6">Últimas Contribuições</h2>
                <PIXContributionList contributions={pixData.contributions} />
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selectedGift && (
        <ReservationModal
          gift={selectedGift}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleReservationSuccess}
        />
      )}
    </main>
  )
}
