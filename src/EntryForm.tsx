import { useState, type FormEvent } from 'react'
import { SuggestionReview } from './SuggestionReview'
import {
  applyAllSuggestions,
  suggestEntryMetadata,
  type EntrySuggestions,
} from './suggestions'
import {
  activations, contexts, entryTypes, intents, kinds, ranges, requirementOptions,
  resolutions, saveTypes, sources, targets, usages, type Entry,
} from './types'

type Draft = Omit<Entry, 'kind' | 'source' | 'entryType' | 'activation'> & {
  kind: Entry['kind'] | ''
  source: Entry['source'] | ''
  entryType: Entry['entryType'] | ''
  activation: Entry['activation'] | ''
}

type RequiredField = 'name' | 'description' | 'kind' | 'source' | 'entryType' | 'activation' | 'tier'
type Errors = Partial<Record<RequiredField, string>>
type ReviewState = { entry: Entry; suggestions: EntrySuggestions }

const blankEntry: Draft = {
  id: '', name: '', description: '', kind: '', source: '', entryType: '', activation: '', contexts: [], intents: [],
}

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

function CheckboxGroup<T extends string>({ legend, options, values, onChange }: { legend: string; options: readonly T[]; values: T[]; onChange: (values: T[]) => void }) {
  return <fieldset className="checkbox-group"><legend>{legend}</legend><div>{options.map((option) => <label key={option}><input type="checkbox" checked={values.includes(option)} onChange={() => onChange(toggleValue(values, option))} /> {option}</label>)}</div></fieldset>
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p className="field-error" id={id}>{message}</p> : null
}

export function EntryForm({ entry, onSave, onCancel }: { entry?: Entry; onSave: (entry: Entry) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Draft>(() => entry ? {
    ...entry,
    contexts: [...entry.contexts], intents: [...entry.intents], resolutions: [...(entry.resolutions ?? [])],
    targets: [...(entry.targets ?? [])], requirements: [...(entry.requirements ?? [])], customTags: [...(entry.customTags ?? [])],
  } : blankEntry)
  const [tagText, setTagText] = useState(entry?.customTags?.join(', ') ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const [review, setReview] = useState<ReviewState | null>(null)

  const update = <K extends keyof Draft>(field: K, value: Draft[K]) => setDraft((current) => ({ ...current, [field]: value }))

  function buildEntry() {
    const nextErrors: Errors = {}
    if (!draft.name.trim()) nextErrors.name = 'Enter a name.'
    if (!draft.description.trim()) nextErrors.description = 'Enter a description.'
    if (!draft.kind) nextErrors.kind = 'Choose a kind.'
    if (!draft.source) nextErrors.source = 'Choose a source.'
    if (!draft.entryType) nextErrors.entryType = 'Choose an entry type.'
    if (!draft.activation) nextErrors.activation = 'Choose an activation.'
    if (draft.kind === 'Spell' && draft.tier === undefined) nextErrors.tier = 'Choose a spell tier.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return null

    const seenTags = new Set<string>()
    const customTags = tagText.split(',').map((tag) => tag.trim()).filter((tag) => {
      if (!tag || seenTags.has(tag.toLocaleLowerCase())) return false
      seenTags.add(tag.toLocaleLowerCase())
      return true
    })
    const isSpell = draft.kind === 'Spell'
    return {
      ...draft,
      id: draft.id || crypto.randomUUID(),
      name: draft.name.trim(), description: draft.description.trim(),
      kind: draft.kind as Entry['kind'], source: draft.source as Entry['source'],
      entryType: draft.entryType as Entry['entryType'], activation: draft.activation as Entry['activation'],
      sourceName: draft.sourceName?.trim() || undefined,
      activationDetail: draft.activationDetail?.trim() || undefined,
      tier: isSpell ? draft.tier : undefined,
      spellGroup: isSpell ? draft.spellGroup : undefined,
      spellAvailability: isSpell ? (draft.spellAvailability ?? 'Available') : undefined,
      ritual: isSpell ? Boolean(draft.ritual) : undefined,
      range: draft.range || undefined, rangeDetail: draft.rangeDetail?.trim() || undefined,
      resolutions: draft.resolutions?.length ? draft.resolutions : undefined,
      saveType: draft.resolutions?.includes('Save') ? draft.saveType : undefined,
      targets: draft.targets?.length ? draft.targets : undefined,
      requirements: draft.requirements?.length ? draft.requirements : undefined,
      requirementDetails: draft.requirementDetails?.trim() || undefined,
      usage: draft.usage || undefined, usageDetail: draft.usageDetail?.trim() || undefined,
      duration: draft.duration?.trim() || undefined, notes: draft.notes?.trim() || undefined,
      customTags: customTags.length ? customTags : undefined,
    } as Entry
  }

  function getSuggestions(nextEntry: Entry) {
    return suggestEntryMetadata({
      name: nextEntry.name,
      description: nextEntry.description,
      activation: nextEntry.activation,
    })
  }

  function reviewSuggestions(event: FormEvent) {
    event.preventDefault()
    const nextEntry = buildEntry()
    if (!nextEntry) return
    setReview({ entry: nextEntry, suggestions: getSuggestions(nextEntry) })
  }

  function saveWithSuggestions() {
    const nextEntry = buildEntry()
    if (!nextEntry) return
    onSave(applyAllSuggestions(nextEntry, getSuggestions(nextEntry)))
  }

  function saveWithoutSuggestions() {
    const nextEntry = buildEntry()
    if (nextEntry) onSave(nextEntry)
  }

  if (review) {
    return (
      <SuggestionReview
        entry={review.entry}
        suggestions={review.suggestions}
        onSave={onSave}
        onBack={() => setReview(null)}
        onCancel={onCancel}
      />
    )
  }

  return (
    <form className="entry-form" onSubmit={reviewSuggestions} noValidate>
      <div className="editor-heading"><div><p className="eyebrow">{entry ? 'Edit entry' : 'New entry'}</p><h2>{entry?.name ?? 'Add an entry'}</h2></div><button type="button" className="text-button" onClick={onCancel}>Cancel</button></div>
      <p className="form-help">Required fields are marked with <span aria-hidden="true">*</span><span className="sr-only">an asterisk</span>.</p>

      <section className="form-section" aria-labelledby="basic-heading">
        <h3 id="basic-heading">Basic information</h3>
        <div className="form-grid">
          <label className="wide"><span>Name <span aria-hidden="true">*</span></span><input value={draft.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} /><FieldError id="name-error" message={errors.name} /></label>
          <label className="wide"><span>Description <span aria-hidden="true">*</span></span><textarea rows={4} value={draft.description} onChange={(event) => update('description', event.target.value)} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} /><FieldError id="description-error" message={errors.description} /></label>
          <label><span>Kind <span aria-hidden="true">*</span></span><select value={draft.kind} onChange={(event) => update('kind', event.target.value as Draft['kind'])} aria-invalid={Boolean(errors.kind)} aria-describedby={errors.kind ? 'kind-error' : undefined}><option value="">Choose kind</option>{kinds.map((value) => <option key={value}>{value}</option>)}</select><FieldError id="kind-error" message={errors.kind} /></label>
          <label><span>Entry type <span aria-hidden="true">*</span></span><select value={draft.entryType} onChange={(event) => update('entryType', event.target.value as Draft['entryType'])} aria-invalid={Boolean(errors.entryType)} aria-describedby={errors.entryType ? 'entry-type-error' : undefined}><option value="">Choose entry type</option>{entryTypes.map((value) => <option key={value}>{value}</option>)}</select><FieldError id="entry-type-error" message={errors.entryType} /></label>
          <label><span>Source <span aria-hidden="true">*</span></span><select value={draft.source} onChange={(event) => update('source', event.target.value as Draft['source'])} aria-invalid={Boolean(errors.source)} aria-describedby={errors.source ? 'source-error' : undefined}><option value="">Choose source</option>{sources.map((value) => <option key={value}>{value}</option>)}</select><FieldError id="source-error" message={errors.source} /></label>
          <label>Source name<input value={draft.sourceName ?? ''} onChange={(event) => update('sourceName', event.target.value)} /></label>
          <label><span>Activation <span aria-hidden="true">*</span></span><select value={draft.activation} onChange={(event) => update('activation', event.target.value as Draft['activation'])} aria-invalid={Boolean(errors.activation)} aria-describedby={errors.activation ? 'activation-error' : undefined}><option value="">Choose activation</option>{activations.map((value) => <option key={value}>{value}</option>)}</select><FieldError id="activation-error" message={errors.activation} /></label>
          <label>Activation detail<input value={draft.activationDetail ?? ''} onChange={(event) => update('activationDetail', event.target.value)} /></label>
        </div>
      </section>

      {draft.kind === 'Spell' && <section className="form-section spell-section" aria-labelledby="spell-heading"><h3 id="spell-heading">Spell details</h3><div className="form-grid">
        <label><span>Tier <span aria-hidden="true">*</span></span><select value={draft.tier ?? ''} onChange={(event) => update('tier', event.target.value === '' ? undefined : Number(event.target.value))} aria-invalid={Boolean(errors.tier)} aria-describedby={errors.tier ? 'tier-error' : undefined}><option value="">Choose tier</option>{Array.from({ length: 10 }, (_, tier) => <option key={tier} value={tier}>{tier}</option>)}</select><FieldError id="tier-error" message={errors.tier} /></label>
        <label>Availability<select value={draft.spellAvailability ?? 'Available'} onChange={(event) => update('spellAvailability', event.target.value as Entry['spellAvailability'])}><option>Available</option><option>Unprepared</option></select></label>
        <label className="inline-check"><input type="checkbox" checked={Boolean(draft.ritual)} onChange={(event) => update('ritual', event.target.checked)} /> Ritual</label>
      </div></section>}

      <details className="form-section"><summary>Mechanical details</summary><div className="form-grid details-grid">
        <label>Range<select value={draft.range ?? ''} onChange={(event) => update('range', event.target.value)}><option value="">Not recorded</option>{ranges.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Range detail<input value={draft.rangeDetail ?? ''} onChange={(event) => update('rangeDetail', event.target.value)} /></label>
        <CheckboxGroup legend="Resolution" options={resolutions} values={draft.resolutions ?? []} onChange={(values) => update('resolutions', values)} />
        {draft.resolutions?.includes('Save') && <label>Save type<select value={draft.saveType ?? ''} onChange={(event) => update('saveType', event.target.value as Entry['saveType'])}><option value="">Not recorded</option>{saveTypes.map((value) => <option key={value}>{value}</option>)}</select></label>}
        <label>Usage / frequency<select value={draft.usage ?? ''} onChange={(event) => update('usage', event.target.value)}><option value="">Not recorded</option>{usages.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Usage detail<input value={draft.usageDetail ?? ''} onChange={(event) => update('usageDetail', event.target.value)} /></label>
        <label>Duration<input value={draft.duration ?? ''} onChange={(event) => update('duration', event.target.value)} /></label>
      </div></details>

      <details className="form-section"><summary>Classification and discoverability</summary><div className="details-grid">
        <CheckboxGroup legend="Context" options={contexts} values={draft.contexts} onChange={(values) => update('contexts', values)} />
        <CheckboxGroup legend="Intent" options={intents} values={draft.intents} onChange={(values) => update('intents', values)} />
        <CheckboxGroup legend="Target" options={targets} values={draft.targets ?? []} onChange={(values) => update('targets', values)} />
        <CheckboxGroup legend="Requirements / limitations" options={requirementOptions} values={draft.requirements ?? []} onChange={(values) => update('requirements', values)} />
        <label>Requirement details<textarea rows={2} value={draft.requirementDetails ?? ''} onChange={(event) => update('requirementDetails', event.target.value)} /></label>
        <label>Custom tags <span className="label-note">Comma-separated</span><input value={tagText} onChange={(event) => setTagText(event.target.value)} /></label>
      </div></details>

      <details className="form-section"><summary>Notes</summary><label>Notes<textarea rows={4} value={draft.notes ?? ''} onChange={(event) => update('notes', event.target.value)} /></label></details>
      <div className="form-actions suggestion-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
        <button type="button" className="secondary-button" onClick={saveWithoutSuggestions}>Save without tags</button>
        <button type="button" className="secondary-button" onClick={saveWithSuggestions}>Save with suggested tags</button>
        <button type="submit" className="primary-button">Review suggested tags</button>
      </div>
    </form>
  )
}
