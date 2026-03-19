'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface Gift {
  id: string
  name: string
  category: string
  description: string
  image_url: string | null
  total_needed: number
  reserved_count: number
  status: 'available' | 'almost_complete' | 'complete'
}

interface GiftCardProps {
  gift: Gift
  onReserve: (gift: Gift) => void
}

export default function GiftCard({ gift, onReserve }: GiftCardProps) {
  const reserved = gift.reserved_count || 0
  const total = gift.total_needed || 1
  const percentage = total > 0 ? (reserved / total) * 100 : 0
  const isFullyReserved = reserved >= total || gift.status === 'complete'

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image placeholder */}
      <div className="h-36 sm:h-48 bg-secondary/20 flex items-center justify-center overflow-hidden">
        {gift.image_url ? (
          <img 
            src={gift.image_url} 
            alt={gift.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-secondary/40 text-6xl">🎁</div>
        )}
      </div>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Category badge */}
        <div className="inline-block">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary/70 bg-secondary/30 px-3 py-1 rounded-full">
            {gift.category}
          </span>
        </div>

        {/* Name and description */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary">
            {gift.name}
          </h3>
          <p className="text-sm text-foreground/60 line-clamp-2">
            {gift.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/60">
              {reserved} de {total} reservados
            </span>
            <span className="font-semibold text-primary">
              {Math.round(percentage)}%
            </span>
          </div>
          <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4">
        {isFullyReserved ? (
          <div className="w-full text-center py-2 rounded-lg bg-muted text-muted-foreground text-sm font-semibold">
            Esgotado
          </div>
        ) : (
          <Button onClick={() => onReserve(gift)} className="w-full font-serif">
            Reservar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
