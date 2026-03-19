'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Gift, CheckCircle2 } from 'lucide-react'

interface Gift {
  id: string
  name: string
  total_needed: number
  reserved_count: number
  status: 'available' | 'almost_complete' | 'complete'
}

interface ReservationModalProps {
  gift: Gift
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ReservationModal({ gift, isOpen, onClose, onSuccess }: ReservationModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const maxQuantity = Math.max(0, (gift.total_needed || 1) - (gift.reserved_count || 0))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gift_id: gift.id, guest_name: guestName, quantity }),
      })
      if (!response.ok) throw new Error('Falha ao criar reserva')
      setSuccess(true)
      setTimeout(() => onSuccess(), 2200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar reserva')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* Decorative header */}
        <div className="bg-gradient-to-br from-primary/90 to-primary px-6 pt-6 pb-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Gift size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Reservar presente</p>
              <h2 className="font-serif text-xl font-bold text-white leading-tight">{gift.name}</h2>
            </div>
          </div>
        </div>

        {/* Curved connector */}
        <div className="h-4 bg-primary -mt-px" style={{ borderRadius: '0 0 0 0' }} />
        <div className="h-4 bg-background rounded-t-3xl -mt-4" />

        {/* Content */}
        <div className="px-6 pb-8 -mt-2">
          {success ? (
            <div className="text-center space-y-4 py-6">
              <div className="flex justify-center">
                <CheckCircle2 size={56} className="text-primary" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-primary">Reserva confirmada!</h3>
                <p className="text-sm text-foreground/60">
                  Obrigado por reservar este presente para o nosso casamento.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground/80">Seu nome</label>
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="rounded-xl bg-secondary/20 border-border/60 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground/80">Quantidade</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 text-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    className="w-11 h-11 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 text-lg font-semibold transition-colors flex items-center justify-center disabled:opacity-40"
                  >
                    +
                  </button>
                  <span className="text-xs text-foreground/50 ml-1">{maxQuantity} disponível(is)</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-11">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !guestName || quantity < 1} className="flex-1 rounded-xl h-11 font-serif">
                  {loading ? 'Processando...' : 'Confirmar'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
