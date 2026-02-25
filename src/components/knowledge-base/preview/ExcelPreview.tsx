import { useState, useEffect } from 'react'
import ExcelJS from 'exceljs'
import { cn } from '@/lib/utils'

interface ExcelPreviewProps {
  blob: Blob
  docType: string
}

interface SheetData {
  name: string
  rows: string[][]
}

/** 简易 CSV 解析，处理引号包裹和换行 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuote = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuote) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuote = false
      } else {
        cell += ch
      }
    } else {
      if (ch === '"') {
        inQuote = true
      } else if (ch === ',') {
        row.push(cell)
        cell = ''
      } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        if (ch === '\r') i++
        row.push(cell)
        cell = ''
        rows.push(row)
        row = []
      } else {
        cell += ch
      }
    }
  }
  // 末尾
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

export function ExcelPreview({ blob, docType }: ExcelPreviewProps) {
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [activeSheet, setActiveSheet] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function parse() {
      try {
        if (docType.toUpperCase() === 'CSV') {
          const text = await blob.text()
          const rows = parseCsv(text)
          if (!cancelled) {
            setSheets([{ name: 'Sheet1', rows }])
            setActiveSheet(0)
          }
          return
        }

        const wb = new ExcelJS.Workbook()
        const buffer = await blob.arrayBuffer()
        await wb.xlsx.load(buffer)

        if (cancelled) return

        const result: SheetData[] = []
        wb.eachSheet((ws) => {
          const rows: string[][] = []
          ws.eachRow((row) => {
            const cells: string[] = []
            row.eachCell({ includeEmpty: true }, (cell) => {
              cells.push(cell.text ?? '')
            })
            rows.push(cells)
          })
          result.push({ name: ws.name, rows })
        })

        setSheets(result)
        setActiveSheet(0)
      } catch {
        if (!cancelled) setError('表格解析失败')
      }
    }

    parse()
    return () => { cancelled = true }
  }, [blob, docType])

  if (error) return <p className="p-4 text-sm text-destructive">{error}</p>
  if (!sheets.length) return <p className="p-4 text-sm text-muted-foreground">加载表格中…</p>

  const current = sheets[activeSheet]

  return (
    <div className="flex h-full flex-col">
      {sheets.length > 1 && (
        <div className="flex gap-1 border-b px-2 py-1.5">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveSheet(i)}
              className={cn(
                'rounded px-2 py-0.5 text-xs transition-colors',
                i === activeSheet
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {current?.rows.map((row, ri) => (
              <tr key={ri} className="border-b">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="whitespace-nowrap border-r px-2 py-1 text-sm"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
