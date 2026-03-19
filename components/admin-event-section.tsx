'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AdminEventSection() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [weddingDatetimeInput, setWeddingDatetimeInput] = useState('')
  const [weddingLocation, setWeddingLocation] = useState('')

  const toInputValue = (iso: string) => {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    // datetime-local usa horário local sem fuso
    const yyyy = d.getFullYear()
    const MM = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mm = pad(d.getMinutes())
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/event/settings')
        const json = await res.json()
        setWeddingDatetimeInput(toInputValue(json.wedding_datetime))
        setWeddingLocation(json.wedding_location || '')
      } catch {
        setError('Falha ao carregar configurações do evento')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (!weddingDatetimeInput) {
        throw new Error('Data do casamento é obrigatória')
      }

      const wedding_datetime = new Date(weddingDatetimeInput).toISOString()

      const res = await fetch('/api/event/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          wedding_datetime,
          wedding_location: weddingLocation,
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Falha ao salvar configurações')
      }

      // sem necessidade de recarregar: mantém estado
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-foreground/60">Carregando evento...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-primary">Configurar Evento</h2>

      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Data e hora do casamento</label>
            <Input
              type="datetime-local"
              value={weddingDatetimeInput}
              onChange={(e) => setWeddingDatetimeInput(e.target.value)}
              className="bg-secondary/20 border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Local</label>
            <Input
              type="text"
              value={weddingLocation}
              onChange={(e) => setWeddingLocation(e.target.value)}
              className="bg-secondary/20 border-border"
              placeholder="Ex: Quinta do Freio, Sintra"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="font-serif flex-1">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

