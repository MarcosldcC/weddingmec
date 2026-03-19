import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const baseDir = process.cwd()
  const inputPath = path.join(baseDir, 'template_lista_presentes_casamento.xlsx')
  const filePath = path.join(baseDir, 'template_lista_presentes_casamento_com_foto.xlsx')
  const fileName = 'template_lista_presentes_casamento_com_foto.xlsx'
  const contentType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  if (!fs.existsSync(inputPath)) {
    return NextResponse.json(
      { error: 'Template não encontrado no projeto' },
      { status: 404 },
    )
  }

  // Gera a versão com coluna `foto` caso ainda não exista.
  if (!fs.existsSync(filePath)) {
    const XLSX = require('xlsx')
    const wb = XLSX.readFile(inputPath)
    const sheetName = wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]

    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    if (!aoa || aoa.length === 0) {
      return NextResponse.json({ error: 'Template inválido' }, { status: 500 })
    }

    const header = aoa[0].map((v) => String(v || '').trim())

    if (!header.some((h) => h.toLowerCase() === 'foto')) {
      const linkIndex = header.findIndex((h) => h.toLowerCase() === 'link')
      const insertAt = linkIndex >= 0 ? linkIndex + 1 : 4
      const newHeader = [...header]
      newHeader.splice(insertAt, 0, 'foto')

      const newAoa = aoa.map((row, rowIdx) => {
        const r = row.slice()
        if (rowIdx === 0) {
          // Cabeçalho exatamente com "foto".
          return newHeader
        }

        while (r.length < header.length) r.push('')
        r.splice(insertAt, 0, '')
        return r
      })

      wb.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(newAoa)
    }

    const outBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    fs.writeFileSync(filePath, outBuf)
  }

  const stream = fs.createReadStream(filePath)

  return new Response(stream as any, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}

