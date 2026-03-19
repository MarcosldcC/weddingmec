'use client'

export default function PIXQRCode({ qrUrl }: { qrUrl?: string | null }) {
  if (qrUrl) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="w-40 h-40 sm:w-64 sm:h-64 border border-border/50 rounded-lg overflow-hidden bg-foreground/5 flex items-center justify-center">
          {/* `qrUrl` pode ser uma URL (imagem) ou um data URL */}
          <img src={qrUrl} alt="QR Code PIX" className="w-full h-full object-contain" />
        </div>
        <p className="text-sm text-foreground/60 text-center max-w-xs">
          QR Code PIX carregado
        </p>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-40 h-40 sm:w-64 sm:h-64 bg-foreground/5 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-4xl">📱</div>
          <p className="text-sm text-foreground/60 font-medium">
            QR Code PIX
          </p>
          <p className="text-xs text-foreground/40">
            Escaneie com seu banco
          </p>
        </div>
      </div>
      
      <p className="text-sm text-foreground/60 text-center max-w-xs">
        O QR Code para fazer uma transferência PIX será gerado aqui
      </p>
    </div>
  )
}
