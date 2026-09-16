import { useState } from 'react'
import {
  applySuggestionSelection,
  createDefaultSelection,
  type EntrySuggestions,
  type SuggestionSelection,
} from './suggestions'
import type { Context, Entry, Intent, Resolution } from './types'

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

function parseTags(value: string) {
  const seen = new Set<string>()
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLocaleLowerCase('en-US')
      if (!tag || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function ReviewChecks<T extends string>({
  legend,
  values,
  selected,
  onChange,
}: {
  legend: string
  values: T[]
  selected: T[]
  onChange: (values: T[]) => void
}) {
  if (!values.length) return null
  return (
    <fieldset className="review-checks">
      <legend>{legend}</legend>
      {values.map((value) => (
        <label key={value}>
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onChange(toggleValue(selected, value))}
          />{' '}
          {value}
        </label>
      ))}
    </fieldset>
  )
}

export function SuggestionReview({
  entry,
  suggestions,
  onSave,
  onBack,
  onCancel,
}: {
  entry: Entry
  suggestions: EntrySuggestions
  onSave: (entry: Entry) => void
  onBack: () => void
  onCancel: () => void
}) {
  const [selection, setSelection] = useState<SuggestionSelection>(() =>
    createDefaultSelection(entry, suggestions),
  )
  const [tagText, setTagText] = useState(entry.customTags?.join(', ') ?? '')
  const detected = suggestions.detected
  const detectedCount =
    Number(Boolean(detected.range && !entry.range)) +
    detected.resolutions.filter(
      (value) => !(entry.resolutions ?? []).includes(value),
    ).length +
    Number(Boolean(detected.saveType && !entry.saveType)) +
    detected.targets.filter((value) => !(entry.targets ?? []).includes(value))
      .length +
    detected.requirements.filter(
      (value) => !(entry.requirements ?? []).includes(value),
    ).length +
    Number(Boolean(detected.usage && !entry.usage)) +
    Number(Boolean(detected.duration && !entry.duration))
  const suggestedContexts = suggestions.suggested.contexts.filter(
    (value) => !entry.contexts.includes(value),
  )
  const suggestedIntents = suggestions.suggested.intents.filter(
    (value) => !entry.intents.includes(value),
  )
  const existingValues = [
    entry.range && ['Range', entry.range],
    entry.resolutions?.length && ['Resolution', entry.resolutions.join(', ')],
    entry.saveType && ['Save type', entry.saveType],
    entry.targets?.length && ['Target', entry.targets.join(', ')],
    entry.requirements?.length && [
      'Requirements / limitations',
      entry.requirements.join(', '),
    ],
    entry.usage && ['Usage', entry.usage],
    entry.duration && ['Duration', entry.duration],
    entry.contexts.length && ['Context', entry.contexts.join(', ')],
    entry.intents.length && ['Intent', entry.intents.join(', ')],
  ].filter(Boolean) as [string, string][]

  const update = <K extends keyof SuggestionSelection>(
    field: K,
    value: SuggestionSelection[K],
  ) => setSelection((current) => ({ ...current, [field]: value }))

  function save() {
    const customTags = parseTags(tagText)
    onSave({
      ...applySuggestionSelection(entry, suggestions, selection),
      customTags: customTags.length ? customTags : undefined,
    })
  }

  return (
    <div className="entry-form suggestion-review">
      <div className="editor-heading">
        <div>
          <p className="eyebrow">Review suggested tags</p>
          <h2>{entry.name}</h2>
        </div>
        <button type="button" className="text-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="form-help">
        Concrete metadata is selected by default. Context and Intent suggestions
        require your approval. Existing values are preserved.
      </p>

      {existingValues.length > 0 && (
        <section className="form-section" aria-labelledby="existing-heading">
          <h3 id="existing-heading">Already on this entry</h3>
          <dl>
            {existingValues.map(([label, value]) => (
              <div className="review-existing" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="form-section" aria-labelledby="detected-heading">
        <h3 id="detected-heading">Detected metadata</h3>
        {detectedCount === 0 ? (
          <p className="review-empty">No new concrete metadata was detected.</p>
        ) : (
          <div className="review-grid">
            {detected.range && !entry.range && (
              <label>
                <input
                  type="checkbox"
                  checked={selection.range}
                  onChange={(event) => update('range', event.target.checked)}
                />{' '}
                Range: {detected.range}
              </label>
            )}
            <ReviewChecks<Resolution>
              legend="Resolution"
              values={detected.resolutions.filter(
                (value) => !(entry.resolutions ?? []).includes(value),
              )}
              selected={selection.resolutions}
              onChange={(value) => update('resolutions', value)}
            />
            {detected.saveType && !entry.saveType && (
              <label>
                <input
                  type="checkbox"
                  checked={selection.saveType}
                  onChange={(event) => update('saveType', event.target.checked)}
                />{' '}
                Save type: {detected.saveType}
              </label>
            )}
            <ReviewChecks
              legend="Target"
              values={detected.targets.filter(
                (value) => !(entry.targets ?? []).includes(value),
              )}
              selected={selection.targets}
              onChange={(value) => update('targets', value)}
            />
            <ReviewChecks
              legend="Requirements / limitations"
              values={detected.requirements.filter(
                (value) => !(entry.requirements ?? []).includes(value),
              )}
              selected={selection.requirements}
              onChange={(value) => update('requirements', value)}
            />
            {detected.usage && !entry.usage && (
              <label>
                <input
                  type="checkbox"
                  checked={selection.usage}
                  onChange={(event) => update('usage', event.target.checked)}
                />{' '}
                Usage: {detected.usage}
              </label>
            )}
            {detected.duration && !entry.duration && (
              <label>
                <input
                  type="checkbox"
                  checked={selection.duration}
                  onChange={(event) => update('duration', event.target.checked)}
                />{' '}
                Duration: {detected.duration}
              </label>
            )}
          </div>
        )}
      </section>

      <section className="form-section" aria-labelledby="suggested-heading">
        <h3 id="suggested-heading">Suggested classification</h3>
        {!suggestedContexts.length && !suggestedIntents.length ? (
          <p className="review-empty">No new Context or Intent tags were suggested.</p>
        ) : (
          <div className="review-grid">
            <ReviewChecks<Context>
              legend="Context"
              values={suggestedContexts}
              selected={selection.contexts}
              onChange={(value) => update('contexts', value)}
            />
            <ReviewChecks<Intent>
              legend="Intent"
              values={suggestedIntents}
              selected={selection.intents}
              onChange={(value) => update('intents', value)}
            />
          </div>
        )}
      </section>

      <section className="form-section" aria-labelledby="custom-tags-heading">
        <h3 id="custom-tags-heading">Custom tags</h3>
        <label>
          Custom tags <span className="label-note">Comma-separated</span>
          <input value={tagText} onChange={(event) => setTagText(event.target.value)} />
        </label>
      </section>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onBack}>
          Back to edit
        </button>
        <button type="button" className="primary-button" onClick={save}>
          Save reviewed entry
        </button>
      </div>
    </div>
  )
}
