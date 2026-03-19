'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check, CheckCircle2 } from 'lucide-react'

interface PIXContributionFormProps {
  onSuccess: () => void
}

type Step = 'form' | 'qr' | 'done'

export default function PIXContributionForm({ onSuccess }: PIXContributionFormProps) {
  const [step, setStep] = useState<Step>('form')
  const [contributorName, setContributorName] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const [pixQrBase64, setPixQrBase64] = useState<string | null>(null)
  const [pixQrCode, setPixQrCode] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/pix/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor_name: contributorName,
          amount_brl: parseFloat(amount),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar PIX')

      setPixQrBase64(data.qr_code_base64)
      setPixQrCode(data.qr_code)
      setPaymentId(data.payment_id)
      setStep('qr')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar PIX')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setLoading(true)
    try {
      const amountInCents = Math.round(parseFloat(amount) * 100)
      const res = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor_name: contributorName,
          amount: amountInCents,
          payment_id: paymentId,
        }),
      })
      if (!res.ok) throw new Error()
      setStep('done')
      setTimeout(() => {
        setStep('form')
        setContributorName('')
        setAmount('')
        setPixQrBase64(null)
        setPixQrCode(null)
        onSuccess()
      }, 3000)
    } catch {
      setError('Falha ao registrar contribuição.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!pixQrCode) return
    navigator.clipboard.writeText(pixQrCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === 'done') {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center space-y-4 py-10">
          <div className="flex justify-center">
            <CheckCircle2 size={52} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-xl font-bold text-primary">Contribuição registrada!</h4>
            <p className="text-sm text-foreground/60">Obrigado pela sua generosidade.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'qr') {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-5">
          <div>
            <h3 className="font-serif text-xl font-bold text-primary">Pague com PIX</h3>
            <p className="text-sm text-foreground/60 mt-1">
              Escaneie o QR ou copie o código abaixo
            </p>
          </div>

          {/* QR Code */}
          {pixQrBase64 && (
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${pixQrBase64}`}
                alt="QR Code PIX"
                className="w-52 h-52 rounded-2xl border border-border/50"
              />
            </div>
          )}

          {/* Copia e cola */}
          {pixQrCode && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Copia e cola</p>
              <div className="flex items-center gap-2 bg-secondary/20 rounded-xl px-4 py-3 border border-border/60">
                <span className="font-mono text-xs text-foreground/70 break-all flex-1 line-clamp-2">
                  {pixQrCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-foreground/50 hover:text-primary transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-sm text-foreground/60 bg-secondary/10 rounded-xl p-4">
            <p className="font-semibold text-foreground/80">Valor: R$ {parseFloat(amount).toFixed(2)}</p>
            <p>Contribuinte: {contributorName}</p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setStep('form'); setError('') }}
              disabled={loading}
              className="flex-1 rounded-xl"
            >
              Voltar
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="flex-1 rounded-xl font-serif"
            >
              {loading ? 'Registrando...' : 'Já paguei'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <h3 className="font-serif text-xl font-bold text-primary mb-6">
          Contribuir com PIX
        </h3>

        <form onSubmit={handleGeneratePix} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">Seu nome</label>
            <Input
              type="text"
              placeholder="Como você gostaria de aparecer?"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              required
              className="rounded-xl bg-secondary/20 border-border/60 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 text-sm">R$</span>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="rounded-xl bg-secondary/20 border-border/60 h-11 pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !contributorName || !amount}
            className="w-full rounded-xl h-11 font-serif"
          >
            {loading ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
