'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, PackagePlus, ImageIcon } from 'lucide-react'

interface AddGiftModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddGiftModal({ isOpen, onClose, onSuccess }: AddGiftModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Diversos',
    description: '',
    total_needed: '1',
    image_url: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['Moradia', 'Eletrônicos', 'Moda', 'Decoração', 'Diversos']

  useEffect(() => {
    return () => { if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl) }
  }, [imagePreviewUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let imageUrl = formData.image_url || null
      if (imageFile) {
        const fd = new FormData()
        fd.set('file', imageFile)
        const uploadRes = await fetch('/api/admin/gifts/upload-image', { method: 'POST', body: fd, credentials: 'include' })
        if (!uploadRes.ok) throw new Error((await uploadRes.text()) || 'Falha ao enviar imagem')
        imageUrl = (await uploadRes.json()).image_url || null
      }
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, image_url: imageUrl, total_needed: parseInt(formData.total_needed) }),
      })
      if (!response.ok) throw new Error('Falha ao adicionar presente')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar presente')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const preview = imagePreviewUrl || formData.image_url || null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />

      <div className="relative w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/90 to-primary px-6 pt-6 pb-8 shrink-0">
          <button onClick={onClose} disabled={loading} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <PackagePlus size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Novo item</p>
              <h2 className="font-serif text-xl font-bold text-white">Adicionar Presente</h2>
            </div>
          </div>
        </div>
        <div className="h-4 bg-primary" />
        <div className="h-4 bg-background rounded-t-3xl -mt-4 shrink-0" />

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="px-6 pb-8 -mt-2 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">Nome do presente</label>
            <Input
              type="text"
              placeholder="Ex: Jogo de Cama"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="rounded-xl bg-secondary/20 border-border/60 h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-border/60 bg-secondary/20 text-foreground text-sm"
              >
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80">Quantidade</label>
              <Input
                type="number"
                min="1"
                value={formData.total_needed}
                onChange={(e) => setFormData({ ...formData, total_needed: e.target.value })}
                required
                className="rounded-xl bg-secondary/20 border-border/60 h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">Descrição</label>
            <textarea
              placeholder="Descreva o presente..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-foreground text-sm resize-none"
            />
          </div>

          {/* Image */}
          <div className="space-y-2 rounded-2xl border border-border/60 bg-secondary/10 p-4">
            <label className="text-sm font-semibold text-foreground/80 flex items-center gap-1.5">
              <ImageIcon size={14} /> Imagem
            </label>
            {preview ? (
              <img src={preview} alt="preview" className="w-full max-h-40 object-contain rounded-xl border border-border/50 bg-foreground/5" />
            ) : (
              <div className="w-full h-24 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-foreground/30 text-sm">
                Sem imagem
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setImageFile(file)
                setImagePreviewUrl(file ? URL.createObjectURL(file) : null)
              }}
              className="rounded-xl bg-background border-border/60 text-sm"
            />
            <Input
              type="url"
              placeholder="Ou cole uma URL de imagem"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="rounded-xl bg-background border-border/60 h-10 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-11">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name} className="flex-1 rounded-xl h-11 font-serif">
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
