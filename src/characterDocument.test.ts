import { describe, expect, it } from 'vitest'
import { loadCharacterEntries, type CharacterDocument } from './characterDocument'
import { exampleCharacter } from './data/example-character'
import { contexts, entryTypes, intents, kinds } from './types'

describe('character documents', () => {
  it('loads a JSON round-trip without changing entry metadata', () => {
    const document: CharacterDocument = JSON.parse(JSON.stringify(exampleCharacter))
    expect(loadCharacterEntries(document)).toEqual(exampleCharacter.entries)
  })

  it('keeps edits in one session separate from the document and other sessions', () => {
    const first = loadCharacterEntries(exampleCharacter)
    const second = loadCharacterEntries(exampleCharacter)
    first[0].name = 'Edited locally'
    first[0].contexts.length = 0
    first[0].customTags?.push('session-only')
    expect(second).toEqual(exampleCharacter.entries)
    expect(first).not.toEqual(second)
  })

  it('provides public examples for every primary classification and spell presentation', () => {
    const entries = loadCharacterEntries(exampleCharacter)
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length)
    for (const context of contexts) expect(entries.some((entry) => entry.contexts.includes(context))).toBe(true)
    for (const intent of intents) expect(entries.some((entry) => entry.intents.includes(intent))).toBe(true)
    for (const kind of kinds) expect(entries.some((entry) => entry.kind === kind)).toBe(true)
    for (const type of entryTypes) expect(entries.some((entry) => entry.entryType === type)).toBe(true)
    const spells = entries.filter((entry) => entry.kind === 'Spell')
    expect(new Set(spells.map((entry) => entry.tier)).size).toBeGreaterThan(1)
    for (const availability of ['Available', 'Unprepared']) {
      expect(spells.some((entry) => entry.spellAvailability === availability && entry.ritual)).toBe(true)
    }
  })
})
