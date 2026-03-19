'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteReservationDialogProps {
  isOpen: boolean
  guestName: string
  maxQuantity: number
  loading?: boolean
  onConfirm: (quantity: number) => void
  onCancel: () => void
}

export default function DeleteReservationDialog({
  isOpen,
  guestName,
  maxQuantity,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteReservationDialogProps) {
  const [mode, setMode] = useState<'all' | 'custom'>('all')
  const [customQty, setCustomQty] = useState(1)

  useEffect(() => {
    if (isOpen) {
      setMode('all')
      setCustomQty(1)
    }
  }, [isOpen])

  if (!isOpen) return null

  const quantity = mode === 'all' ? maxQuantity : customQty

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      <div className="relative w-full max-w-sm bg-background rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-1.5 bg-gradient-to-r from-destructive/80 to-destructive" />

        <div className="px-6 pt-6 pb-7 space-y-5">
          {/* Icon + close */}
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Trash2 size={22} className="text-destructive" />
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-foreground/40 hover:text-foreground/70 transition-colors mt-0.5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-foreground">Excluir reserva</h3>
            <p className="text-sm text-foreground/60">
              Reserva de <span className="font-semibold text-foreground">{guestName}</span> — {maxQuantity} unidade(s)
            </p>
          </div>

          {/* Mode selector */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground/70">Quanto deseja devolver?</p>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 cursor-pointer hover:bg-secondary/20 transition-colors has-[:checked]:border-destructive/50 has-[:checked]:bg-destructive/5">
              <input
                type="radio"
                name="mode"
                value="all"
                checked={mode === 'all'}
                onChange={() => setMode('all')}
                className="accent-destructive"
              />
              <span className="text-sm text-foreground">
                Tudo — devolver <span className="font-bold">{maxQuantity}</span> unidade(s)
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 cursor-pointer hover:bg-secondary/20 transition-colors has-[:checked]:border-destructive/50 has-[:checked]:bg-destructive/5">
              <input
                type="radio"
                name="mode"
                value="custom"
                checked={mode === 'custom'}
                onChange={() => setMode('custom')}
                className="accent-destructive"
              />
              <span className="text-sm text-foreground">Quantidade específica</span>
            </label>

            {mode === 'custom' && (
              <div className="flex items-center gap-3 pl-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 font-semibold transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center text-lg font-bold">{customQty}</span>
                <button
                  type="button"
                  onClick={() => setCustomQty((q) => Math.min(maxQuantity, q + 1))}
                  disabled={customQty >= maxQuantity}
                  className="w-9 h-9 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 font-semibold transition-colors disabled:opacity-40"
                >
                  +
                </button>
                <span className="text-xs text-foreground/50">máx. {maxQuantity}</span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/15 px-3 py-2.5">
            <AlertTriangle size={14} className="text-destructive/80 shrink-0" />
            <p className="text-xs text-destructive/80">
              {quantity} unidade(s) voltarão para a lista de presentes.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl h-11"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => onConfirm(quantity)}
              disabled={loading}
              className="flex-1 rounded-xl h-11 bg-destructive hover:bg-destructive/90 text-white"
            >
              {loading ? 'Excluindo...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
