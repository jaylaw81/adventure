import fs from 'fs'
import path from 'path'

export interface ChangelogEntry {
  date: string    // YYYY-MM-DD
  items: string[] // plain-text feature descriptions
}

export function parseChangelog(): ChangelogEntry[] {
  const raw = fs.readFileSync(path.join(process.cwd(), 'CHANGELOG.md'), 'utf8')
  const entries: ChangelogEntry[] = []

  // Split on date headers: ## YYYY-MM-DD
  const sections = raw.split(/^## (\d{4}-\d{2}-\d{2})/m)

  // sections is: [preamble, date1, body1, date2, body2, ...]
  for (let i = 1; i < sections.length; i += 2) {
    const date = sections[i].trim()
    const body = sections[i + 1] ?? ''
    const items = body
      .split('\n')
      .map(line => line.replace(/^- /, '').trim())
      .filter(line => line.length > 0 && !line.startsWith('#') && line !== '---')
    if (items.length > 0) {
      entries.push({ date, items })
    }
  }

  return entries
}
