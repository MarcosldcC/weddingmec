'use client'

import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      <div className="relative w-full max-w-sm bg-background rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top accent */}
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

          {/* Text */}
          <div className="space-y-1.5">
            <h3 className="font-serif text-xl font-bold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-foreground/60 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Warning note */}
          <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/15 px-3 py-2.5">
            <AlertTriangle size={14} className="text-destructive/80 shrink-0" />
            <p className="text-xs text-destructive/80">Esta ação não pode ser desfeita.</p>
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
              {cancelLabel}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl h-11 bg-destructive hover:bg-destructive/90 text-white"
            >
              {loading ? 'Excluindo...' : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
