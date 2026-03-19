// Cria usuários de admin no Supabase local via GoTrue (admin API).
// Uso: node scripts/003_create_local_admin_users.js

const fs = require('fs')
const path = require('path')

function loadEnv(envPath) {
  const raw = fs.readFileSync(envPath, 'utf8')
  const lines = raw.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const idx = trimmed.indexOf('=')
    if (idx === -1) continue

    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()

    // remove aspas
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

async function main() {
  loadEnv(path.join(__dirname, '..', '.env'))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Env faltando: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY')
  }

  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const adminsToCreate = [
    { email: 'marcos08limadacunha@gmail.com', password: '0708.Agosto' },
    { email: 'aanacarolina.aniceto@gmail.com', password: '0720Topo.' },
  ]

  for (const u of adminsToCreate) {
    try {
      const res = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
      })
      console.log('created:', u.email, res?.data?.user?.id || '')
    } catch (err) {
      // Se já existe, a criação falha; a gente só quer garantir que exista.
      console.warn('skip/create error:', u.email, err?.message || err)
    }
  }
}

main()
  .then(() => {
    console.log('done')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

