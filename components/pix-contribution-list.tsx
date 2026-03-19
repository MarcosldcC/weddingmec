'use client'

interface Contribution {
  id: string
  contributor_name: string
  amount: number
  created_at: string
}

interface PIXContributionListProps {
  contributions: Contribution[]
}

export default function PIXContributionList({ contributions }: PIXContributionListProps) {
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

  return (
    <div className="space-y-3">
      {contributions.map((contribution) => (
        <div
          key={contribution.id}
          className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50 hover:border-border transition-colors"
        >
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {contribution.contributor_name}
            </p>
            <p className="text-xs text-foreground/50">
              {formatDate(contribution.created_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-serif font-bold text-primary text-lg">
              R$ {(contribution.amount / 100).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
