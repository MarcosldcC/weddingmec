'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PIXContributionForm from '@/components/pix-contribution-form'
import PIXQRCode from '@/components/pix-qrcode'
import PIXContributionList from '@/components/pix-contribution-list'

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

export default function PIXPage() {
  const [pixData, setPixData] = useState<PIXData | null>(null)
  const [pixSettings, setPixSettings] = useState<{ pix_key: string | null; pix_qr_url: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pixRes, settingsRes] = await Promise.all([
          fetch('/api/pix'),
          fetch('/api/pix/settings'),
        ])

        const [pixJson, settingsJson] = await Promise.all([
          pixRes.json(),
          settingsRes.json(),
        ])

        setPixData(pixJson)
        setPixSettings(settingsJson)
      } catch (error) {
        console.error('Error fetching PIX contributions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleContributionSuccess = async () => {
    // Refresh contributions
    try {
      const response = await fetch('/api/pix')
      const data = await response.json()
      setPixData(data)
    } catch (error) {
      console.error('Error refreshing contributions:', error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary font-bold">
                Contribuir com PIX
              </h1>
              <p className="text-foreground/60">
                Deixe seu presente através de PIX
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: QR Code and Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-foreground/70 text-lg">
                Escaneie o código QR abaixo ou utilize a chave PIX para fazer sua contribuição. Sua generosidade é muito importante para nós.
              </p>
            </div>

            {/* QR Code Section */}
            <div className="bg-card rounded-lg p-6 sm:p-8 border border-border/50">
              <PIXQRCode qrUrl={pixSettings?.pix_qr_url ?? null} />
            </div>

            {/* PIX Key Info */}
            <div className="bg-secondary/10 rounded-lg p-4 sm:p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-primary">Chave PIX</h3>
              <div className="space-y-2">
                <p className="text-sm text-foreground/60">
                  Você também pode usar a seguinte chave PIX:
                </p>
                <div className="bg-background rounded px-4 py-3 font-mono text-sm text-foreground/80 break-all">
                  {pixSettings?.pix_key ?? 'Defina a chave PIX no Admin'}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form and Contributions */}
          <div className="space-y-8">
            {/* Contribution Form */}
            <PIXContributionForm onSuccess={handleContributionSuccess} />

            {/* Summary Stats */}
            {!loading && pixData && (
              <div className="bg-card rounded-lg p-4 sm:p-6 border border-border/50 space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary">
                  Resumo de Contribuições
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/10 rounded p-4 text-center">
                    <div className="font-serif text-3xl font-bold text-primary">
                      {pixData.count}
                    </div>
                    <p className="text-sm text-foreground/60 mt-1">
                      Contribuintes
                    </p>
                  </div>
                  <div className="bg-secondary/10 rounded p-4 text-center">
                    <div className="font-serif text-3xl font-bold text-primary">
                      R$ {(pixData.total / 100).toFixed(2)}
                    </div>
                    <p className="text-sm text-foreground/60 mt-1">
                      Total Arrecadado
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Contributions */}
        {!loading && pixData && pixData.contributions.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-3xl font-bold text-primary mb-6">
              Últimas Contribuições
            </h2>
            <PIXContributionList contributions={pixData.contributions} />
          </div>
        )}
      </div>
    </main>
  )
}
