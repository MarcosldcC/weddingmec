'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'

interface Contribution {
  id: string
  contributor_name: string
  amount: number
  created_at: string
}

export default function AdminPIXSection() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [pixKey, setPixKey] = useState('')
  const [pixQrUrl, setPixQrUrl] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [settingsSaved, setSettingsSaved] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pixRes, settingsRes] = await Promise.all([
          fetch('/api/pix'),
          fetch('/api/pix/settings'),
        ])

        const pixJson = await pixRes.json()
        const settingsJson = await settingsRes.json()

        setContributions(pixJson.contributions || [])
        setTotal(pixJson.total || 0)

        setPixKey(settingsJson.pix_key || '')
        setPixQrUrl(settingsJson.pix_qr_url || '')
      } catch (error) {
        console.error('Error fetching PIX data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!qrFile) {
      setQrPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(qrFile)
    setQrPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [qrFile])

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch('/api/pix', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      setContributions((prev) => prev.filter((c) => c.id !== id))
      setTotal((prev) => prev - (contributions.find((c) => c.id === id)?.amount ?? 0))
    } catch {
      alert('Falha ao excluir contribuição.')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  if (loading) {
    return <div className="text-center py-12 text-foreground/60">Carregando contribuições...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-primary">Configurar PIX</h2>

      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Chave PIX</label>
            <Input
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="bg-secondary/20 border-border"
              placeholder="Cole aqui a chave PIX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Upload do QR Code</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setQrFile(e.target.files?.[0] ?? null)}
              className="bg-secondary/20 border-border"
            />

            {(qrPreviewUrl || pixQrUrl) && (
              <div className="mt-2">
                <img
                  src={qrPreviewUrl || pixQrUrl}
                  alt="QR Code PIX"
                  className="w-full max-w-xs rounded-md border border-border/50 bg-foreground/5"
                />
              </div>
            )}
          </div>

          {settingsError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{settingsError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={async () => {
                setSavingSettings(true)
                setSettingsError('')
                setSettingsSaved(false)
                try {
                  let qrUrlToSave = pixQrUrl || null

                  // Se selecionou arquivo, faz upload e usa a URL pública retornada.
                  if (qrFile) {
                    const fd = new FormData()
                    fd.set('file', qrFile)

                    const uploadRes = await fetch('/api/admin/pix/upload-qr-image', {
                      method: 'POST',
                      body: fd,
                      credentials: 'include',
                    })

                    if (!uploadRes.ok) {
                      const txt = await uploadRes.text()
                      throw new Error(txt || 'Falha ao enviar QR')
                    }

                    const uploadJson = await uploadRes.json()
                    qrUrlToSave = uploadJson.pix_qr_url || null
                  }

                  const res = await fetch('/api/pix/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ pix_key: pixKey, pix_qr_url: qrUrlToSave }),
                  })

                  if (!res.ok) {
                    const txt = await res.text()
                    throw new Error(txt || 'Falha ao salvar configurações')
                  }

                  setPixQrUrl(qrUrlToSave || '')
                  setSettingsSaved(true)
                } catch (e) {
                  setSettingsError(e instanceof Error ? e.message : 'Falha ao salvar configurações')
                } finally {
                  setSavingSettings(false)
                }
              }}
              disabled={savingSettings}
              className="font-serif"
            >
              {savingSettings ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>

          {settingsSaved && <p className="text-sm text-primary">Configurações salvas!</p>}
        </CardContent>
      </Card>

      <h2 className="font-serif text-2xl font-bold text-primary">Contribuições via PIX</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-foreground/60 mb-2">Total de Contribuições</p>
            <p className="font-serif text-4xl font-bold text-primary">
              {contributions.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-foreground/60 mb-2">Valor Total</p>
            <p className="font-serif text-4xl font-bold text-primary">
              {formatCurrency(total)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-foreground/60 mb-2">Ticket Médio</p>
            <p className="font-serif text-4xl font-bold text-primary">
              {contributions.length > 0
                ? formatCurrency(total / contributions.length)
                : 'R$ 0,00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contributions List */}
      {contributions.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-foreground/60">Nenhuma contribuição PIX ainda</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {contributions.map((contribution) => (
                <div key={contribution.id} className="p-4 sm:p-6 hover:bg-secondary/5 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-sm text-foreground/60">Contribuinte</p>
                      <p className="font-semibold text-foreground">
                        {contribution.contributor_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Valor</p>
                      <p className="font-serif font-bold text-primary text-xl">
                        {formatCurrency(contribution.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Data</p>
                      <p className="text-sm text-foreground">
                        {formatDate(contribution.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary/70 bg-primary/10 px-3 py-1 rounded-full">
                        Confirmado
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmId(contribution.id)}
                        disabled={deletingId === contribution.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmId !== null}
        title="Excluir contribuição?"
        description="A contribuição será removida permanentemente da lista."
        confirmLabel="Excluir"
        loading={deletingId !== null}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
