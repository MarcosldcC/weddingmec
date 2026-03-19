'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import DeleteReservationDialog from '@/components/delete-reservation-dialog'

interface Reservation {
  id: string
  gift_id: string
  guest_name: string
  quantity: number
  created_at: string
}

interface Gift {
  id: string
  name: string
  total_needed: number
  reserved_count: number
}

export default function AdminReservationsSection() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [giftsMap, setGiftsMap] = useState<Record<string, Gift>>({})
  const [loading, setLoading] = useState(true)
  const [confirmReservation, setConfirmReservation] = useState<Reservation | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [resRes, giftsRes] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/gifts'),
      ])
      const reservationsData: Reservation[] = await resRes.json()
      const giftsData: Gift[] = await giftsRes.json()

      setReservations(Array.isArray(reservationsData) ? reservationsData : [])
      const map: Record<string, Gift> = {}
      if (Array.isArray(giftsData)) giftsData.forEach((g) => { map[g.id] = g })
      setGiftsMap(map)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string, quantity: number) => {
    setDeletingId(id)
    try {
      const res = await fetch('/api/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, quantity }),
      })
      if (!res.ok) throw new Error()
      await fetchData()
    } catch {
      // silent
    } finally {
      setDeletingId(null)
      setConfirmReservation(null)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  if (loading) {
    return <div className="text-center py-12 text-foreground/60">Carregando reservas...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-primary">Reservas de Presentes</h2>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/60">Nenhuma reserva ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => {
            const gift = giftsMap[reservation.gift_id]
            return (
              <Card key={reservation.id} className="border-border/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-xs text-foreground/50 mb-0.5">Presente</p>
                        <p className="font-semibold text-foreground text-sm">
                          {gift?.name ?? <span className="text-foreground/40 italic">Removido</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 mb-0.5">Convidado</p>
                        <p className="font-semibold text-foreground text-sm">{reservation.guest_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 mb-0.5">Quantidade</p>
                        <p className="font-semibold text-primary text-lg leading-tight">{reservation.quantity}x</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 mb-0.5">Data</p>
                        <p className="text-sm text-foreground">{formatDate(reservation.created_at)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmReservation(reservation)}
                      disabled={deletingId === reservation.id}
                      className="text-destructive/50 hover:text-destructive transition-colors disabled:opacity-40 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {reservations.length > 0 && (
        <Card className="bg-secondary/10 border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Total de Reservas</p>
                <p className="font-serif text-3xl font-bold text-primary">{reservations.length}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Total de Itens</p>
                <p className="font-serif text-3xl font-bold text-primary">
                  {reservations.reduce((sum, r) => sum + r.quantity, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Presentes Reservados</p>
                <p className="font-serif text-3xl font-bold text-primary">
                  {new Set(reservations.map((r) => r.gift_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DeleteReservationDialog
        isOpen={confirmReservation !== null}
        guestName={confirmReservation?.guest_name ?? ''}
        maxQuantity={confirmReservation?.quantity ?? 1}
        loading={deletingId !== null}
        onConfirm={(qty) => confirmReservation && handleDelete(confirmReservation.id, qty)}
        onCancel={() => setConfirmReservation(null)}
      />
    </div>
  )
}
