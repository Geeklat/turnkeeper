import type { Entry } from './types'

export interface CharacterDocument {
  formatVersion: 1
  character: { name: string }
  entries: Entry[]
}

// Trusted, already-processed documents only. Future uploads need validation first.
export function loadCharacterEntries(document: CharacterDocument): Entry[] {
  return structuredClone(document.entries)
}
