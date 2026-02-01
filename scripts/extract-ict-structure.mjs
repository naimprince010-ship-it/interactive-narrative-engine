/**
 * ICT Book Structure Extractor (ESM)
 * Run: node scripts/extract-ict-structure.mjs
 * Prerequisites: npm install pdf-parse
 * Place PDF at: data/ict/আইসিটি-nctbbook.com.pdf
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const PDF_PATH = path.join(root, 'data', 'ict', 'আইসিটি-nctbbook.com.pdf')
const OUTPUT_PATH = path.join(root, 'data', 'ict', 'book_structure.json')

async function extractPdfText() {
  try {
    const pdfParse = (await import('pdf-parse')).default
    const dataBuffer = fs.readFileSync(PDF_PATH)
    const data = await pdfParse(dataBuffer)
    return data.text
  } catch (e) {
    console.error('pdf-parse not found. Run: npm install pdf-parse')
    throw e
  }
}

function getFallbackStructure() {
  return {
    title: 'নবম-দশম শ্রেণি তথ্য ও যোগাযোগ প্রযুক্তি',
    chapters: [
      { id: 'ch1', title: 'তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি', topics: [] },
      { id: 'ch2', title: 'কম্পিউটার ও এর ব্যবহার', topics: [] },
      { id: 'ch4', title: 'স্প্রেডশিট', topics: [] },
    ],
  }
}

async function main() {
  if (!fs.existsSync(PDF_PATH)) {
    console.log('PDF not found at', PDF_PATH)
    console.log('Create data/ict/ and place আইসিটি-nctbbook.com.pdf there.')
    const outDir = path.dirname(OUTPUT_PATH)
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(getFallbackStructure(), null, 2))
    console.log('Wrote fallback structure to', OUTPUT_PATH)
    return
  }

  console.log('Extracting text from PDF...')
  const text = await extractPdfText()
  console.log('Extracted', text.length, 'characters')

  const structure = getFallbackStructure()
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(structure, null, 2))
  console.log('Wrote', OUTPUT_PATH)
  console.log('Tip: Add OPENAI_API_KEY and extend this script to structure with AI.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
