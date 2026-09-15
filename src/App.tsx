import { useId, useState } from 'react'
import { valskaraEntries } from './data/valskara'
import { activeKindOrder, alphabetical, entryTypeSections, filterEntries, groupSpellsByTier, innateSpells, tierLabel } from './filtering'
import { contexts, intents, type Context, type Entry, type Intent } from './types'
import './styles.css'

function resolutionLabel(entry: Entry) {
  const values = entry.resolutions?.filter((value) => value !== 'Not Applicable') ?? []
  return values.map((value) => value === 'Save' && entry.saveType ? `${entry.saveType} Save` : value).join(' / ')
}

function EntryRow({ entry }: { entry: Entry }) {
  const [expanded, setExpanded] = useState(false)
  const detailId = useId()
  const activation = entry.activation !== 'Not Applicable' ? entry.activation : ''
  const range = entry.range && entry.range !== 'Not Applicable' ? entry.range : ''
  const resolution = resolutionLabel(entry)

  return (
    <article className="entry">
      <button className="entry-toggle" type="button" aria-expanded={expanded} aria-controls={detailId} onClick={() => setExpanded((value) => !value)}>
        <span className="entry-summary">
          <span className="entry-name">{entry.name}{entry.ritual && <span className="ritual-tag">Ritual</span>}</span>
          <span className="entry-fact" data-label="Activation">{activation}</span>
          <span className="entry-fact" data-label="Range">{range}</span>
          <span className="entry-fact" data-label="Resolution">{resolution}</span>
        </span>
        <span className="chevron" aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="entry-detail" id={detailId}>
          <p>{entry.description}</p>
          <dl>
            {entry.activationDetail && <><dt>Activation detail</dt><dd>{entry.activationDetail}</dd></>}
            {entry.rangeDetail && <><dt>Range detail</dt><dd>{entry.rangeDetail}</dd></>}
            {entry.resolutions?.length && <><dt>Resolution</dt><dd>{resolutionLabel(entry)}</dd></>}
            {entry.intents.length > 0 && <><dt>Intent</dt><dd>{entry.intents.join(', ')}</dd></>}
            {entry.targets?.length && <><dt>Target</dt><dd>{entry.targets.join(', ')}</dd></>}
            {entry.requirements?.length && <><dt>Requirements / limitations</dt><dd>{entry.requirements.join(', ')}{entry.requirementDetails ? `. ${entry.requirementDetails}` : ''}</dd></>}
            {entry.usage && <><dt>Usage / frequency</dt><dd>{entry.usage}{entry.usageDetail ? ` — ${entry.usageDetail}` : ''}</dd></>}
            {entry.duration && <><dt>Duration</dt><dd>{entry.duration}</dd></>}
            {entry.kind === 'Spell' && <><dt>Availability</dt><dd>{entry.spellAvailability}{entry.ritual ? ' · Ritual' : ''}</dd></>}
            <dt>Source</dt><dd>{entry.source}{entry.sourceName ? ` — ${entry.sourceName}` : ''}</dd>
            {entry.notes && <><dt>Notes</dt><dd>{entry.notes}</dd></>}
            {entry.customTags?.length && <><dt>Tags</dt><dd>{entry.customTags.join(', ')}</dd></>}
          </dl>
        </div>
      )}
    </article>
  )
}

function SpellTiers({ entries }: { entries: Entry[] }) {
  const innate = innateSpells(entries)
  return <>{innate.length > 0 && <section className="tier"><h4>Innate Spellcasting</h4>{innate.map((entry) => <EntryRow key={entry.id} entry={entry} />)}</section>}{groupSpellsByTier(entries).map(([tier, spells]) => <section className="tier" key={tier}><h4>{tierLabel(tier)}</h4>{spells.map((entry) => <EntryRow key={entry.id} entry={entry} />)}</section>)}</>
}

function ActiveGroup({ kind, entries }: { kind: Entry['kind']; entries: Entry[] }) {
  const heading = kind === 'Spell' ? 'Available Now' : kind === 'Feature' ? 'Features' : kind === 'Skill' ? 'Skills' : kind === 'Item Action' ? 'Item Actions' : 'Basic / System Actions'
  return (
    <section className="result-group" aria-labelledby={`kind-${kind.replaceAll(' ', '-').replaceAll('/', '-')}`}>
      <h3 id={`kind-${kind.replaceAll(' ', '-').replaceAll('/', '-')}`}>{heading}</h3>
      {kind === 'Spell' && <p className="section-note">Available spells</p>}
      {kind === 'Spell'
        ? <SpellTiers entries={entries} />
        : alphabetical(entries).map((entry) => <EntryRow key={entry.id} entry={entry} />)}
    </section>
  )
}

export default function App() {
  const [context, setContext] = useState<Context | ''>('')
  const [intent, setIntent] = useState<Intent | ''>('')
  const [showAvailable, setShowAvailable] = useState(true)
  const [showUnprepared, setShowUnprepared] = useState(true)
  const [ritualOnly, setRitualOnly] = useState(false)
  const matches = filterEntries(valskaraEntries, context, intent)
  const active = matches.filter((entry) => entry.entryType === 'Active Option')
  const matchingSpells = active.filter((entry) => entry.kind === 'Spell' && (!ritualOnly || entry.ritual))
  const availableSpells = showAvailable ? matchingSpells.filter((entry) => entry.spellAvailability === 'Available') : []
  const unpreparedSpells = showUnprepared ? matchingSpells.filter((entry) => entry.spellAvailability === 'Unprepared') : []
  const heading = context ? `${context}${intent ? ` · ${intent}` : ''}` : 'Choose a context to begin'

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">Turnkeeper</p>
        <h1>What is Valskara trying to do?</h1>
        <p>Choose the situation first. Add an intent only when it helps narrow the options.</p>
      </header>

      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <fieldset>
          <legend><span>1</span> Context <small>Required</small></legend>
          <div className="choice-grid">
            {contexts.map((value) => <label key={value}><input type="radio" name="context" value={value} checked={context === value} onChange={() => { setContext(value); setIntent('') }} /><span>{value}</span></label>)}
          </div>
        </fieldset>
        <div className="intent-field">
          <label htmlFor="intent"><span>2</span> Intent <small>Optional</small></label>
          <select id="intent" value={intent} onChange={(event) => setIntent(event.target.value as Intent | '')} disabled={!context}>
            <option value="">All intents</option>
            {intents.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <p>No intent shows everything worth remembering in this context.</p>
        </div>
      </form>

      <fieldset className="spell-filters" disabled={!context}>
        <legend>Spell availability</legend>
        <label><input type="checkbox" checked={showAvailable} onChange={(event) => setShowAvailable(event.target.checked)} /> Available</label>
        <label><input type="checkbox" checked={showUnprepared} onChange={(event) => setShowUnprepared(event.target.checked)} /> Unprepared</label>
        <label><input type="checkbox" checked={ritualOnly} onChange={(event) => setRitualOnly(event.target.checked)} /> Ritual only</label>
      </fieldset>

      <section className="results" aria-labelledby="results-heading" aria-live="polite">
        <div className="results-heading">
          <div><p className="eyebrow">Valskara’s options</p><h2 id="results-heading">{heading}</h2></div>
          {context && <p className="count">{matches.length} {matches.length === 1 ? 'entry' : 'entries'}</p>}
        </div>
        {!context && <p className="empty">Select one of the four contexts above to surface relevant options.</p>}
        {context && matches.length === 0 && <p className="empty">No entries match this context and intent.</p>}
        {activeKindOrder.map((kind) => {
          const entries = kind === 'Spell' ? availableSpells : active.filter((entry) => entry.kind === kind)
          return entries.length ? <ActiveGroup key={kind} kind={kind} entries={entries} /> : null
        })}
        {unpreparedSpells.length > 0 && <section className="result-group later" aria-labelledby="unprepared-heading"><h3 id="unprepared-heading">Might Be Available Later</h3><p className="section-note">Unprepared spells</p><SpellTiers entries={unpreparedSpells} /></section>}
        {entryTypeSections.map(({ type, heading: sectionHeading }) => {
          const entries = alphabetical(matches.filter((entry) => entry.entryType === type))
          return entries.length ? <section className="result-group reminder" key={type}><h3>{sectionHeading}</h3><p className="section-note">{type}</p>{entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)}</section> : null
        })}
      </section>
    </main>
  )
}
