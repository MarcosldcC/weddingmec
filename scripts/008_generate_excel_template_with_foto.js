/**
 * Gera um novo template Excel com a coluna opcional `foto`.
 * Uso: node scripts/008_generate_excel_template_with_foto.js
 */

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const projectRoot = process.cwd()
const inputPath = path.join(projectRoot, 'template_lista_presentes_casamento.xlsx')
const outputPath = path.join(projectRoot, 'template_lista_presentes_casamento_com_foto.xlsx')

if (!fs.existsSync(inputPath)) {
  throw new Error(`Arquivo de entrada não encontrado: ${inputPath}`)
}

const wb = XLSX.readFile(inputPath)
const sheetName = wb.SheetNames[0]
const ws = wb.Sheets[sheetName]

const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
if (!aoa || aoa.length === 0) {
  throw new Error('Planilha vazia ou não legível.')
}

const header = aoa[0].map((v) => String(v || '').trim())

const linkIndex = header.findIndex((h) => h.toLowerCase() === 'link')
const insertAt = linkIndex >= 0 ? linkIndex + 1 : 4

// Se a coluna `foto` já existir, não recria.
if (header.some((h) => h.toLowerCase() === 'foto')) {
  console.log('Template já possui coluna `foto`. Nada a fazer.')
  process.exit(0)
}

const newHeader = [...header]
newHeader.splice(insertAt, 0, 'foto')

const newAoa = aoa.map((row, rowIdx) => {
  const r = row.slice()

  if (rowIdx === 0) {
    // Cabeçalho: exatamente na ordem e com o texto "foto".
    return newHeader
  }

  // Linhas: insere célula vazia na coluna `foto`
  while (r.length < header.length) r.push('')
  r.splice(insertAt, 0, '')
  return r
})

const newWs = XLSX.utils.aoa_to_sheet(newAoa)
wb.Sheets[sheetName] = newWs

XLSX.writeFile(wb, outputPath)
console.log('Gerado:', outputPath)

