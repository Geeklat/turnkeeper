import type { Context, Entry, EntryType, Intent, Kind } from './types'

export const activeKindOrder: Kind[] = ['Spell', 'Feature', 'Skill', 'Item Action', 'Basic / System Action']

export const entryTypeSections: Array<{ type: Exclude<EntryType, 'Active Option'>; heading: string }> = [
  { type: 'Triggered Option', heading: 'When Something Happens' },
  { type: 'Passive Reminder', heading: 'Remember' },
  { type: 'Entry Modifier', heading: 'Modifies Other Options' },
]

export function filterEntries(entries: Entry[], context: Context | '', intent: Intent | '') {
  if (!context) return []
  return entries.filter((entry) =>
    entry.contexts.includes(context) && (!intent || entry.intents.includes(intent)),
  )
}

export function alphabetical(entries: Entry[]) {
  return [...entries].sort((a, b) => a.name.localeCompare(b.name))
}

export function groupSpellsByTier(entries: Entry[]) {
  const tiers = new Map<number, Entry[]>()
  alphabetical(entries).forEach((entry) => {
    if (entry.kind !== 'Spell' || entry.tier === undefined) return
    tiers.set(entry.tier, [...(tiers.get(entry.tier) ?? []), entry])
  })
  return [...tiers.entries()].sort(([a], [b]) => a - b)
}

export function innateSpells(entries: Entry[]) {
  return alphabetical(entries.filter((entry) => entry.kind === 'Spell' && entry.spellGroup === 'Innate Spellcasting'))
}

export function tierLabel(tier: number) {
  if (tier === 0) return 'Cantrips'
  const suffix = tier === 1 ? 'st' : tier === 2 ? 'nd' : tier === 3 ? 'rd' : 'th'
  return `${tier}${suffix} Level`
}
