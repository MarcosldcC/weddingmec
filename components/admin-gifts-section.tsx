'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import AddGiftModal from '@/components/add-gift-modal'
import EditGiftModal from '@/components/edit-gift-modal'
import ConfirmDialog from '@/components/confirm-dialog'
import { ChevronDown, ExternalLink, ImageIcon, Trash2, Users } from 'lucide-react'
import DeleteReservationDialog from '@/components/delete-reservation-dialog'

interface Gift {
  id: string
  name: string
  category: string
  description: string | null
  image_url: string | null
  source_link?: string | null
  total_needed: number
  reserved_count: number
  status: 'available' | 'almost_complete' | 'complete'
}

interface GiftAdminCardProps {
  gift: Gift
  selected: boolean
  onToggleSelect: () => void
  onToggleStatus: () => void
  onEdit: () => void
}

function GiftAdminCard({ gift, selected, onToggleSelect, onToggleStatus, onEdit }: GiftAdminCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [reservations, setReservations] = useState<{ id: string; guest_name: string; quantity: number; created_at: string }[]>([])
  const [loadingRes, setLoadingRes] = useState(false)
  const [deletingResId, setDeletingResId] = useState<string | null>(null)
  const [confirmRes, setConfirmRes] = useState<{ id: string; guest_name: string; quantity: number } | null>(null)

  const handleExpand = async () => {
    const next = !expanded
    setExpanded(next)
    if (next && reservations.length === 0 && gift.reserved_count > 0) {
      setLoadingRes(true)
      try {
        const res = await fetch(`/api/reservations?gift_id=${gift.id}`)
        const data = await res.json()
        setReservations(Array.isArray(data) ? data : [])
      } catch { /* silent */ }
      finally { setLoadingRes(false) }
    }
  }

  const handleDeleteReservation = async (id: string, quantity: number) => {
    setDeletingResId(id)
    try {
      const res = await fetch('/api/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, quantity }),
      })
      if (!res.ok) throw new Error()
      // Recarrega reservas
      const updated = await fetch(`/api/reservations?gift_id=${gift.id}`)
      const data = await updated.json()
      setReservations(Array.isArray(data) ? data : [])
    } catch {
      // silent
    } finally {
      setDeletingResId(null)
      setConfirmRes(null)
    }
  }

  const statusLabel = gift.status === 'available' ? 'Disponível' : gift.status === 'almost_complete' ? 'Quase completo' : 'Completo'
  const statusClass = gift.status === 'available' ? 'bg-primary/10 text-primary' : gift.status === 'almost_complete' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardContent className="p-0">
        {/* Main row */}
        <div className="flex gap-3 p-4 sm:p-5">
          {/* Checkbox */}
          <div className="pt-1 shrink-0">
            <Checkbox checked={selected} onCheckedChange={onToggleSelect} aria-label={`Selecionar ${gift.name}`} />
          </div>

          {/* Thumbnail */}
          <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-border/50 bg-secondary/20 flex items-center justify-center">
            {gift.image_url ? (
              <img src={gift.image_url} alt={gift.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} className="text-foreground/30" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-semibold text-foreground leading-tight">{gift.name}</h3>
                <p className="text-xs text-foreground/50">{gift.category}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusClass}`}>{statusLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <span className="text-foreground/60">Total: <span className="font-semibold text-foreground">{gift.total_needed}</span></span>
              <span className="text-foreground/60">Reservados: <span className="font-semibold text-primary">{gift.reserved_count}</span></span>
              {gift.source_link && (
                <a href={gift.source_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary/70 hover:text-primary text-xs transition-colors">
                  <ExternalLink size={12} /> Ver link
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onToggleStatus} className="text-xs h-8">
              {gift.status === 'complete' ? 'Reativar' : 'Marcar Completo'}
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit} className="text-xs h-8">
              Editar
            </Button>
            {gift.reserved_count > 0 && (
              <button
                onClick={handleExpand}
                className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/30"
              >
                <Users size={13} />
                <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Expanded reservations */}
        {expanded && (
          <div className="border-t border-border/50 bg-secondary/5 px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Quem reservou</p>
            {loadingRes ? (
              <p className="text-sm text-foreground/50">Carregando...</p>
            ) : reservations.length === 0 ? (
              <p className="text-sm text-foreground/50">Nenhuma reserva encontrada.</p>
            ) : (
              <div className="space-y-2">
                {reservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl bg-background border border-border/50 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {r.guest_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{r.guest_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/60">
                      <span>{r.quantity}x</span>
                      <span className="text-xs">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                      <button
                        onClick={() => setConfirmRes(r)}
                        disabled={deletingResId === r.id}
                        className="text-destructive/50 hover:text-destructive transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <DeleteReservationDialog
        isOpen={confirmRes !== null}
        guestName={confirmRes?.guest_name ?? ''}
        maxQuantity={confirmRes?.quantity ?? 1}
        loading={deletingResId !== null}
        onConfirm={(qty) => confirmRes && handleDeleteReservation(confirmRes.id, qty)}
        onCancel={() => setConfirmRes(null)}
      />
    </Card>
  )
}

export default function AdminGiftsSection() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const [editGift, setEditGift] = useState<Gift | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'almost_complete'>('all')

  const [excelImportPreview, setExcelImportPreview] = useState<
    Array<{
      tempId: string
      name: string
      category: string
      description: string | null
      image_url: string | null
      source_link: string | null
      total_needed: number
    }>
  >([])
  const [excelImporting, setExcelImporting] = useState(false)
  const [excelImportError, setExcelImportError] = useState('')
  const [excelImportSaving, setExcelImportSaving] = useState(false)

  useEffect(() => {
    fetchGifts()
  }, [])

  const fetchGifts = async () => {
    try {
      const response = await fetch('/api/gifts')
      const data = await response.json()
      setGifts(data)
    } catch (error) {
      console.error('Error fetching gifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuccess = () => {
    setShowAddModal(false)
    fetchGifts()
  }

  const handleToggleStatus = async (giftId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'complete' ? 'available' : 'complete'
      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        fetchGifts()
      }
    } catch (error) {
      console.error('Error updating gift:', error)
    }
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setEditGift(null)
    fetchGifts()
  }

  const handleExcelFile = async (file: File | null) => {
    if (!file) return
    setExcelImportError('')
    setExcelImportPreview([])
    setExcelImporting(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const XLSX = await import('xlsx')

      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // As colunas do template são (exemplo): nome, quantidade_total, cores, link, categoria, descricao
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null })

      const mapped = rows
        .map((r, idx) => {
          const nome = typeof r?.nome === 'string' ? r.nome.trim() : ''
          if (!nome) return null

          const quantidade_total = Number(r?.quantidade_total)
          const total_needed = Number.isFinite(quantidade_total)
            ? Math.max(1, Math.floor(quantidade_total))
            : 1

          const categoria = typeof r?.categoria === 'string' ? r.categoria.trim() : ''
          const descricao = r?.descricao != null ? String(r.descricao).trim() : ''
          const cores = r?.cores != null ? String(r.cores).trim() : ''
          const link = r?.link != null ? String(r.link).trim() : ''
          const fotoRaw =
            r?.foto ?? r?.imagem ?? r?.image_url ?? r?.image ?? null
          const foto = fotoRaw != null ? String(fotoRaw).trim() : ''

          const isDirectImageLink = (value: string) => {
            if (!value) return false
            if (value.startsWith('data:image/')) return true
            return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(value)
          }

          const descriptionWithColors =
            cores && descricao
              ? `${descricao}\nCores: ${cores}`
              : cores
                ? `Cores: ${cores}\n${descricao}`.trim()
                : descricao || null

          return {
            tempId: `${Date.now()}-${idx}`,
            name: nome,
            category: categoria || 'Diversos',
            description: descriptionWithColors,
            // Se tiver coluna de foto, usa ela.
            // Se não tiver, só usa o `link` como image_url quando for URL de imagem direta.
            image_url: foto
              ? isDirectImageLink(foto)
                ? foto
                : null
              : isDirectImageLink(link)
                ? link
                : null,
            source_link: foto
              ? foto && !isDirectImageLink(foto)
                ? foto
                : null
              : link && !isDirectImageLink(link)
                ? link
                : null,
            total_needed,
          }
        })
        .filter(Boolean) as any[]

      if (mapped.length === 0) {
        setExcelImportError('Nenhuma linha válida encontrada no Excel.')
        return
      }

      setExcelImportPreview(mapped)
    } catch (e) {
      setExcelImportError(e instanceof Error ? e.message : 'Falha ao importar Excel')
    } finally {
      setExcelImporting(false)
    }
  }

  const adjustPreviewQuantity = (tempId: string, delta: number) => {
    setExcelImportPreview((prev) =>
      prev.map((p) =>
        p.tempId === tempId
          ? { ...p, total_needed: Math.max(1, p.total_needed + delta) }
          : p,
      ),
    )
  }

  const handleExcelImportSave = async () => {
    if (excelImportPreview.length === 0) return
    setExcelImportSaving(true)
    setExcelImportError('')

    try {
      const res = await fetch('/api/gifts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gifts: excelImportPreview.map((p) => ({
            name: p.name,
            category: p.category,
            description: p.description,
            image_url: p.image_url,
            source_link: p.source_link,
            total_needed: p.total_needed,
          })),
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Falha ao inserir presentes em massa')
      }

      setExcelImportPreview([])
      fetchGifts()
    } catch (e) {
      setExcelImportError(e instanceof Error ? e.message : 'Falha ao inserir presentes em massa')
    } finally {
      setExcelImportSaving(false)
    }
  }

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const categoryOptions = Array.from(new Set(gifts.map((g) => g.category))).sort()
  const filteredGifts = gifts.filter((g) => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false
    if (statusFilter !== 'all' && g.status !== statusFilter) return false
    if (!normalizedSearch) return true

    return (
      g.name.toLowerCase().includes(normalizedSearch) ||
      g.category.toLowerCase().includes(normalizedSearch) ||
      (g.description || '').toLowerCase().includes(normalizedSearch)
    )
  })

  const sectionCategories = Array.from(new Set(filteredGifts.map((g) => g.category))).sort()

  const visibleGiftIds = filteredGifts.map((g) => g.id)
  const selectedSet = new Set(selectedGiftIds)
  const allVisibleSelected =
    visibleGiftIds.length > 0 && visibleGiftIds.every((id) => selectedSet.has(id))

  const toggleGiftSelected = (giftId: string) => {
    setSelectedGiftIds((prev) => {
      const s = new Set(prev)
      if (s.has(giftId)) s.delete(giftId)
      else s.add(giftId)
      return Array.from(s)
    })
  }

  const setSelectAllVisible = (checked: boolean) => {
    setSelectedGiftIds((prev) => {
      const s = new Set(prev)
      if (checked) {
        for (const id of visibleGiftIds) s.add(id)
      } else {
        for (const id of visibleGiftIds) s.delete(id)
      }
      return Array.from(s)
    })
  }

  const handleBulkDelete = async () => {
    if (selectedGiftIds.length === 0) return
    setShowBulkConfirm(false)
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/gifts/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: selectedGiftIds }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Falha ao excluir presentes')
      }

      setSelectedGiftIds([])
      fetchGifts()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Falha ao excluir presentes')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-foreground/60">Carregando presentes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
        <h2 className="font-serif text-2xl font-bold text-primary">Presentes Cadastrados</h2>
        <Button onClick={() => setShowAddModal(true)} className="font-serif">
          + Adicionar Presente
        </Button>
      </div>

        <Card className="border-border/50">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Adicionar em massa via Excel</p>
              <p className="text-sm text-foreground/60">
                Use o template com colunas: <span className="font-mono">nome</span>,{' '}
                <span className="font-mono">quantidade_total</span>, <span className="font-mono">cores</span>,{' '}
                <span className="font-mono">link</span>, <span className="font-mono">foto</span>,{' '}
                <span className="font-mono">categoria</span>, <span className="font-mono">descricao</span>.
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <Button asChild type="button" variant="outline" className="font-serif">
                <a href="/api/template-lista-presentes">Baixar template (foto)</a>
              </Button>
            </div>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => handleExcelFile(e.target.files?.[0] ?? null)}
              disabled={excelImporting || excelImportSaving}
              className="block w-full text-sm text-foreground/70"
            />

            {excelImporting && <p className="text-sm text-foreground/60">Lendo Excel...</p>}

            {excelImportError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{excelImportError}</p>
              </div>
            )}

            {excelImportPreview.length > 0 && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="font-semibold p-2">Nome</th>
                        <th className="font-semibold p-2">Categoria</th>
                        <th className="font-semibold p-2">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelImportPreview.map((p) => (
                        <tr key={p.tempId} className="border-t border-border/50">
                          <td className="p-2">
                            <div className="font-medium">{p.name}</div>
                          </td>
                          <td className="p-2 text-foreground/70">{p.category}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustPreviewQuantity(p.tempId, -1)}
                                disabled={excelImportSaving}
                              >
                                -
                              </Button>
                              <span className="font-semibold w-12 text-center">{p.total_needed}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustPreviewQuantity(p.tempId, 1)}
                                disabled={excelImportSaving}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleExcelImportSave}
                    disabled={excelImportSaving}
                    className="font-serif"
                  >
                    {excelImportSaving ? 'Inserindo...' : 'Adicionar em massa'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setExcelImportPreview([])}
                    disabled={excelImportSaving}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm font-semibold text-foreground/80">Busca</label>
              <input
                className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-secondary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: pratos, cozinha..."
              />
            </div>

            <div className="w-full sm:w-56">
              <label className="text-sm font-semibold text-foreground/80">Categoria</label>
              <select
                className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-secondary/20"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value || 'all')}
              >
                <option value="all">Todas</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-56">
              <label className="text-sm font-semibold text-foreground/80">Status</label>
              <select
                className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-secondary/20"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Todos</option>
                <option value="available">Disponível</option>
                <option value="almost_complete">Quase completo</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-foreground/60">{filteredGifts.length} presente(s) encontrado(s)</div>
        </div>

        <div className="mb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={(val) => setSelectAllVisible(val === true)}
                aria-label="Selecionar todos os itens filtrados"
              />
              <div className="text-sm text-foreground/80">
                Selecionados: {selectedGiftIds.length}
              </div>
            </div>

            <Button
              onClick={() => setShowBulkConfirm(true)}
              disabled={deleting || selectedGiftIds.length === 0}
              variant="destructive"
              className="w-full sm:w-auto font-serif"
            >
              {deleting ? 'Excluindo...' : 'Excluir selecionados'}
            </Button>
          </div>

          {deleteError && (
            <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{deleteError}</p>
            </div>
          )}
        </div>

      {gifts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/60">Nenhum presente cadastrado</p>
          </CardContent>
        </Card>
      ) : filteredGifts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/60">Nenhum presente com esses filtros</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {sectionCategories.map((cat) => {
            const giftsInSection = filteredGifts.filter((g) => g.category === cat)
            if (giftsInSection.length === 0) return null

            return (
              <section key={cat} className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-primary">{cat}</h3>
                <div className="space-y-3">
                  {giftsInSection.map((gift) => (
                    <GiftAdminCard
                      key={gift.id}
                      gift={gift}
                      selected={selectedSet.has(gift.id)}
                      onToggleSelect={() => toggleGiftSelected(gift.id)}
                      onToggleStatus={() => handleToggleStatus(gift.id, gift.status)}
                      onEdit={() => { setEditGift(gift); setShowEditModal(true) }}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {showAddModal && (
        <AddGiftModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showEditModal && editGift && (
        <EditGiftModal
          gift={{
            id: editGift.id,
            name: editGift.name,
            category: editGift.category,
            description: editGift.description,
            total_needed: editGift.total_needed,
            image_url: editGift.image_url,
          }}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditGift(null)
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={showBulkConfirm}
        title={`Excluir ${selectedGiftIds.length} presente(s)?`}
        description="Todos os presentes selecionados serão removidos permanentemente."
        confirmLabel="Excluir todos"
        loading={deleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </div>
  )
}
