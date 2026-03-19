'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import AdminGiftsSection from '@/components/admin-gifts-section'
import AdminReservationsSection from '@/components/admin-reservations-section'
import AdminPIXSection from '@/components/admin-pix-section'
import AdminEventSection from '@/components/admin-event-section'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('gifts')
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check', { method: 'GET', credentials: 'include' })
        if (!res.ok) {
          router.push('/auth/login?redirect=/admin')
          return
        }
        setCheckingAuth(false)
      } catch {
        router.push('/auth/login?redirect=/admin')
      }
    }

    checkAdmin()
  }, [router])

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground/60">Carregando...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary font-bold">
                Painel Administrativo
              </h1>
              <p className="text-foreground/60">
                Gerencie presentes, reservas e contribuições
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-border/50 sticky top-0 bg-background/95 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'gifts', label: 'Presentes' },
              { id: 'reservations', label: 'Reservas' },
              { id: 'pix', label: 'PIX' },
              { id: 'event', label: 'Evento' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground/60 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'gifts' && <AdminGiftsSection />}
        {activeTab === 'reservations' && <AdminReservationsSection />}
        {activeTab === 'pix' && <AdminPIXSection />}
        {activeTab === 'event' && <AdminEventSection />}
      </div>
    </main>
  )
}
