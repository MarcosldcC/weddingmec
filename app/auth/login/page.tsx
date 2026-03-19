'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [redirect, setRedirect] = useState('/admin')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get('redirect') || '/admin')
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      router.push(redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Login</h1>
          <p className="text-sm text-foreground/60 mt-1">Acesse o painel administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="seuemail@exemplo.com"
              required
              className="bg-secondary/20 border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Senha</label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Sua senha"
              required
              className="bg-secondary/20 border-border"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading || !email || !password} className="w-full font-serif">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  )
}

