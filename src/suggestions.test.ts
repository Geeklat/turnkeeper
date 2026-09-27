import { describe, expect, it } from 'vitest'
import {
  applyAllSuggestions,
  applySuggestionSelection,
  createDefaultSelection,
  suggestEntryMetadata,
  type EntrySuggestions,
  type SuggestionInput,
  type SuggestionSelection,
} from './suggestions'
import type { Entry } from './types'

const suggest = (description: string, input: Partial<SuggestionInput> = {}) =>
  suggestEntryMetadata({
    name: '',
    description,
    activation: 'Action',
    ...input,
  })

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: 'test-entry',
  name: 'Test entry',
  description: 'Test description',
  kind: 'Feature',
  source: 'Custom',
  entryType: 'Active Option',
  activation: 'Action',
  contexts: [],
  intents: [],
  ...overrides,
})

describe('detected metadata', () => {
  it.each([
    ['a creature within 60 feet', '60 ft'],
    ['a creature within 30 feet', '30 ft'],
    ['an object you touch', 'Touch'],
    ['range: self', 'Self'],
  ])('maps the explicit range in %s to %s', (description, expected) => {
    expect(suggest(description).detected.range).toBe(expected)
  })

  it.each([
    'a creature somewhere nearby',
    'a creature within 20 feet',
    'move for 60 feet during your turn',
  ])('does not invent a range for %s', (description) => {
    expect(suggest(description).detected.range).toBeUndefined()
  })

  it.each([
    ['makes a Wisdom saving throw', 'WIS'],
    ['makes a Dexterity save', 'DEX'],
    ['makes a STR save', 'STR'],
  ] as const)('detects the save in %s', (description, saveType) => {
    const detected = suggest(description).detected
    expect(detected.resolutions).toContain('Save')
    expect(detected.saveType).toBe(saveType)
  })

  it.each(['make a ranged spell attack', 'make an attack roll'])(
    'detects an attack roll from %s',
    (description) => {
      expect(suggest(description).detected.resolutions).toContain('Attack Roll')
    },
  )

  it('detects an explicitly automatic effect', () => {
    expect(
      suggest('The attempt automatically succeeds.').detected.resolutions,
    ).toContain('Automatic Effect')
  })

  it.each([
    ['a creature you can see', 'Creature'],
    ['an object you touch', 'Object'],
    ['a 20-foot radius sphere', 'Location / Area'],
    ['range: self', 'Self'],
    ['a magical effect', 'Effect / Phenomenon'],
    ['there is no target', 'No Target'],
  ])('detects the target in %s', (description, target) => {
    expect(suggest(description).detected.targets).toContain(target)
  })

  it.each([
    ['a creature you can see', 'Visibility required'],
    [
      'a creature that can hear and understand you',
      'Hearing / communication required',
    ],
    ['a creature you touch', 'Touch required'],
    ['a willing creature', 'Willing target required'],
    ['concentration, up to 1 minute', 'Concentration / sustained effect'],
    ['a creature within 60 feet', 'Range applies'],
  ])('detects the requirement in %s', (description, requirement) => {
    expect(suggest(description).detected.requirements).toContain(requirement)
  })

  it('detects an explicit resource requirement', () => {
    expect(
      suggest('You must expend a spell slot.').detected.requirements,
    ).toContain('Resource required')
  })

  it.each([
    ['use this at will', 'At Will / Unlimited'],
    ['use this once per turn', 'Per Turn'],
    ['regain use after a short rest', 'Per Short Rest'],
    ['regain use after a long rest', 'Per Long Rest'],
    ['use this once per day', 'Per Day'],
    ['this item has 3 charges', 'Charges / Limited Uses'],
  ])('maps the explicit usage in %s to %s', (description, expected) => {
    expect(suggest(description).detected.usage).toBe(expected)
  })

  it.each([
    ['the effect lasts for 1 minute', '1 minute'],
    ['the effect lasts for 10 minutes', '10 minutes'],
    ['the effect lasts for 1 hour', '1 hour'],
    [
      'concentration, up to 10 minutes',
      'Concentration, up to 10 minutes',
    ],
    [
      'until the end of your next turn',
      'Until the end of your next turn',
    ],
    ['until dispelled', 'Until dispelled'],
  ])('extracts the bounded duration in %s', (description, expected) => {
    expect(suggest(description).detected.duration).toBe(expected)
  })

  it('does not turn an unrelated number into a duration', () => {
    expect(suggest('Choose one of 10 painted symbols.').detected.duration).toBeUndefined()
  })
})

describe('suggested classifications', () => {
  it.each([
    ['The target takes radiant damage.', 'Attack / Harm'],
    ['The creature gains resistance to fire.', 'Protect / Defend'],
    ['The creature regains 5 hit points.', 'Heal / Recover'],
    ['The creature gains a bonus to its next check.', 'Support / Empower'],
    ['The creature becomes frightened.', 'Control / Disrupt'],
    ['You teleport to an unoccupied space.', 'Move / Escape'],
    ['You detect nearby poison.', 'Investigate / Learn'],
    ['You communicate with a distant creature.', 'Influence / Communicate'],
    ['You repair the object.', 'Interact / Manipulate'],
  ])('suggests %s from clear generic prose', (description, intent) => {
    expect(suggest(description).suggested.intents).toContain(intent)
  })

  it.each([
    ['The target takes radiant damage.', 'Combat'],
    ['You detect nearby poison.', 'Exploration'],
    ['You communicate with a distant creature.', 'Social / Roleplay'],
    ['You repair damaged equipment.', 'Downtime'],
  ])('suggests the high-signal Context for %s', (description, context) => {
    expect(suggest(description).suggested.contexts).toContain(context)
  })

  it('uses Extended activation as Downtime evidence', () => {
    expect(
      suggest('Complete a lengthy preparation.', { activation: 'Extended' })
        .suggested.contexts,
    ).toContain('Downtime')
  })
})

describe('precision-first ambiguity handling', () => {
  it.each([
    'Create a curious possibility.',
    'Move the conversation forward.',
    'Attack the underlying problem.',
    'The story has a target audience.',
    'Save this thought for later.',
  ])('does not classify irrelevant wording: %s', (description) => {
    const result = suggest(description)
    expect(result.detected).toEqual({
      range: undefined,
      resolutions: [],
      saveType: undefined,
      targets: [],
      requirements: [],
      usage: undefined,
      duration: undefined,
    })
    expect(result.suggested).toEqual({ contexts: [], intents: [] })
  })
})

describe('user-authority merge behavior', () => {
  const suggestions: EntrySuggestions = {
    detected: {
      range: '60 ft',
      resolutions: ['Save'],
      saveType: 'WIS',
      targets: ['Creature'],
      requirements: ['Visibility required'],
      usage: 'Per Day',
      duration: '1 minute',
    },
    suggested: {
      contexts: ['Combat'],
      intents: ['Attack / Harm'],
    },
  }

  it('does not overwrite existing single-value metadata', () => {
    const merged = applyAllSuggestions(
      makeEntry({
        range: 'Touch',
        saveType: 'DEX',
        usage: 'At Will / Unlimited',
        duration: '1 hour',
      }),
      suggestions,
    )
    expect(merged).toMatchObject({
      range: 'Touch',
      saveType: 'DEX',
      usage: 'At Will / Unlimited',
      duration: '1 hour',
    })
  })

  it('preserves multi-values, adds selections, and avoids duplicates', () => {
    const merged = applyAllSuggestions(
      makeEntry({
        resolutions: ['Attack Roll'],
        targets: ['Object', 'Creature'],
        requirements: ['Touch required'],
        contexts: ['Exploration'],
        intents: ['Investigate / Learn'],
      }),
      suggestions,
    )
    expect(merged.resolutions).toEqual(['Attack Roll', 'Save'])
    expect(merged.targets).toEqual(['Object', 'Creature'])
    expect(merged.requirements).toEqual([
      'Touch required',
      'Visibility required',
    ])
    expect(merged.contexts).toEqual(['Exploration', 'Combat'])
    expect(merged.intents).toEqual(['Investigate / Learn', 'Attack / Harm'])
  })

  it('preselects detected values but not suggested classifications', () => {
    expect(createDefaultSelection(makeEntry(), suggestions)).toEqual({
      range: true,
      resolutions: ['Save'],
      saveType: true,
      targets: ['Creature'],
      requirements: ['Visibility required'],
      usage: true,
      duration: true,
      contexts: [],
      intents: [],
    })
  })

  it('applies only reviewed selections without removing existing values', () => {
    const selection: SuggestionSelection = {
      range: false,
      resolutions: [],
      saveType: false,
      targets: ['Creature'],
      requirements: [],
      usage: false,
      duration: false,
      contexts: ['Combat'],
      intents: [],
    }
    const merged = applySuggestionSelection(
      makeEntry({ contexts: ['Exploration'], targets: ['Object'] }),
      suggestions,
      selection,
    )
    expect(merged.range).toBeUndefined()
    expect(merged.targets).toEqual(['Object', 'Creature'])
    expect(merged.contexts).toEqual(['Exploration', 'Combat'])
    expect(merged.intents).toEqual([])
  })
})

describe('original adventure description regressions', () => {
  it('extracts a visible target, explicit save, and damage intent', () => {
    const result = suggest('A creature you can see makes a Dexterity save as paper shards swirl past; it takes cutting damage if struck.')
    expect(result.detected).toMatchObject({
      resolutions: ['Save'],
      saveType: 'DEX',
      targets: ['Creature'],
      requirements: ['Visibility required'],
    })
    expect(result.suggested).toEqual({
      contexts: ['Combat'],
      intents: ['Attack / Harm'],
    })
  })

  it.each([
    ['Paper loops leave the courier restrained.', 'Control / Disrupt'],
    ['The traveler regains hit points as warm moths settle on their coat.', 'Heal / Recover'],
    ['You detect fresh footprints with humming pebbles.', 'Investigate / Learn'],
    ['A brass bird repeats your command to the waiting crew.', 'Influence / Communicate'],
    ['A folded paper boat carries a message across the pond.', 'Influence / Communicate'],
  ])('retains the representative %s Intent', (description, intent) => {
    expect(suggest(description).suggested.intents).toContain(intent)
  })

  it('extracts a ranged thread attack', () => {
    expect(suggest('Flick a copper thread at a creature within 60 feet using a ranged spell attack.')).toMatchObject({
      detected: {
        range: '60 ft',
        resolutions: ['Attack Roll'],
        targets: ['Creature'],
        requirements: ['Range applies'],
      },
      suggested: {
        contexts: ['Combat'],
        intents: ['Attack / Harm'],
      },
    })
  })

  it('leaves a compact atmospheric description unclassified', () => {
    expect(suggest('A velvet hush settles between the hanging lanterns.')).toEqual({
      detected: {
        range: undefined,
        resolutions: [],
        saveType: undefined,
        targets: [],
        requirements: [],
        usage: undefined,
        duration: undefined,
      },
      suggested: { contexts: [], intents: [] },
    })
  })
})
