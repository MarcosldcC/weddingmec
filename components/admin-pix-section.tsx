'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pixRes = await fetch('/api/pix')
        const pixJson = await pixRes.json()
        setContributions(pixJson.contributions || [])
        setTotal(pixJson.total || 0)
      } catch (error) {
        console.error('Error fetching PIX data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
      setTotal((prev) => prev - (contributions.find((c) => c.id === id)?.amount ?? 0))
      setContributions((prev) => prev.filter((c) => c.id !== id))
    } catch {
      // silent
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const formatCurrency = (amount: number) =>
    (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (loading) {
    return <div className="text-center py-12 text-foreground/60">Carregando contribuições...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-primary">Contribuições via PIX</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-foreground/60 mb-2">Total de Contribuições</p>
            <p className="font-serif text-4xl font-bold text-primary">{contributions.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-foreground/60 mb-2">Valor Total</p>
            <p className="font-serif text-4xl font-bold text-primary">{formatCurrency(total)}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-foreground/60 mb-2">Ticket Médio</p>
            <p className="font-serif text-4xl font-bold text-primary">
              {contributions.length > 0 ? formatCurrency(total / contributions.length) : 'R$ 0,00'}
            </p>
          </CardContent>
        </Card>
      </div>

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
                      <p className="font-semibold text-foreground">{contribution.contributor_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Valor</p>
                      <p className="font-serif font-bold text-primary text-xl">{formatCurrency(contribution.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Data</p>
                      <p className="text-sm text-foreground">{formatDate(contribution.created_at)}</p>
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
