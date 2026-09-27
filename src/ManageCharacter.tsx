import { useState } from 'react'
import { EntryForm } from './EntryForm'
import { alphabetical, activeKindOrder, tierLabel } from './filtering'
import type { Entry } from './types'

type EditorState = { mode: 'create' } | { mode: 'edit'; entry: Entry } | null

export function ManageCharacter({ entries, characterName, onSave }: { entries: Entry[]; characterName: string; onSave: (entry: Entry) => void }) {
  const [editor, setEditor] = useState<EditorState>(null)

  if (editor) {
    return <EntryForm entry={editor.mode === 'edit' ? editor.entry : undefined} onSave={(entry) => { onSave(entry); setEditor(null) }} onCancel={() => setEditor(null)} />
  }

  return (
    <main className="manage" aria-labelledby="manage-heading">
      <div className="manage-heading">
        <div><p className="eyebrow">{characterName}</p><h1 id="manage-heading">Manage Character</h1><p>Changes last until this page is refreshed.</p></div>
        <button type="button" className="primary-button" onClick={() => setEditor({ mode: 'create' })}>Add Entry</button>
      </div>
      <div className="manage-groups">
        {activeKindOrder.map((kind) => {
          const grouped = alphabetical(entries.filter((entry) => entry.kind === kind))
          if (!grouped.length) return null
          return <section className="manage-group" key={kind}><h2>{kind === 'Basic / System Action' ? 'Basic / System Actions' : `${kind}s`}</h2><ul>{grouped.map((entry) => <li key={entry.id}><div><strong>{entry.name}</strong><span>{entry.kind === 'Spell' && entry.tier !== undefined ? `${tierLabel(entry.tier)} · ` : ''}{entry.entryType} · {entry.source}{entry.sourceName ? ` — ${entry.sourceName}` : ''}</span></div><button type="button" className="text-button" onClick={() => setEditor({ mode: 'edit', entry })}>Edit <span className="sr-only">{entry.name}</span></button></li>)}</ul></section>
        })}
      </div>
    </main>
  )
}
