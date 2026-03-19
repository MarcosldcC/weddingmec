import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  // Somente server-side: usamos a service role para consultar/grantir permissões de forma confiável.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Evita tentativa de refresh/persistência de sessão no backend.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

