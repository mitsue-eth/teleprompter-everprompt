/**
 * Parse markdown content for headings (## and ###) for outline/structure view.
 * Returns array of { title, level, index } where index is used as section id (section-0, section-1, ...).
 */
export interface OutlineItem {
  title: string
  level: number
  index: number
}

export function parseHeadingsFromContent(content: string): OutlineItem[] {
  const items: OutlineItem[] = []
  const lines = content.split("\n")
  let index = 0
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const title = match[2].trim()
      if (title) {
        items.push({ title, level, index: index++ })
      }
    }
  }
  return items
}
