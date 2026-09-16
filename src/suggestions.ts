import type {
  Context,
  Entry,
  Intent,
  Resolution,
} from './types'

type SaveType = NonNullable<Entry['saveType']>

export interface SuggestionInput {
  name: string
  description: string
  activation: Entry['activation']
}

export interface DetectedMetadata {
  range?: string
  resolutions: Resolution[]
  saveType?: SaveType
  targets: string[]
  requirements: string[]
  usage?: string
  duration?: string
}

export interface EntrySuggestions {
  detected: DetectedMetadata
  suggested: {
    contexts: Context[]
    intents: Intent[]
  }
}

export interface SuggestionSelection {
  range: boolean
  resolutions: Resolution[]
  saveType: boolean
  targets: string[]
  requirements: string[]
  usage: boolean
  duration: boolean
  contexts: Context[]
  intents: Intent[]
}

const distanceRanges = [5, 10, 15, 30, 60, 90, 120, 150, 300, 500]

const unique = <T,>(values: T[]) => [...new Set(values)]

const has = (text: string, patterns: RegExp[]) =>
  patterns.some((pattern) => pattern.test(text))

function detectRange(text: string) {
  if (
    has(text, [
      /\brange(?: is|:) self\b/,
      /\b(?:target|cast)(?:s|ing)? (?:only )?yourself\b/,
      /\bon yourself\b/,
      /\bcentered on you\b/,
    ])
  ) {
    return 'Self'
  }

  if (
    has(text, [
      /\brange(?: is|:) touch\b/,
      /\b(?:creature|object) you touch\b/,
      /\byou touch (?:a|one|the) (?:creature|object)\b/,
      /\btouched (?:creature|object)\b/,
    ])
  ) {
    return 'Touch'
  }

  const distances = distanceRanges.join('|')
  const match = text.match(
    new RegExp(`\\b(?:within|range of) (${distances})[ -](?:foot|feet|ft)\\b`),
  )

  return match ? `${Number(match[1]).toLocaleString('en-US')} ft` : undefined
}

function detectSaveType(text: string): SaveType | undefined {
  const saves: Array<[SaveType, RegExp]> = [
    ['STR', /\b(?:strength|str) (?:saving throw|save)\b/],
    ['DEX', /\b(?:dexterity|dex) (?:saving throw|save)\b/],
    ['CON', /\b(?:constitution|con) (?:saving throw|save)\b/],
    ['INT', /\b(?:intelligence|int) (?:saving throw|save)\b/],
    ['WIS', /\b(?:wisdom|wis) (?:saving throw|save)\b/],
    ['CHA', /\b(?:charisma|cha) (?:saving throw|save)\b/],
  ]

  return saves.find(([, pattern]) => pattern.test(text))?.[0]
}

function detectDuration(text: string) {
  const concentration = text.match(
    /\bconcentration,? (?:up to )?(1|10) (minute|hour)s?\b/,
  )
  if (concentration) {
    return `Concentration, up to ${concentration[1]} ${concentration[2]}${concentration[1] === '1' ? '' : 's'}`
  }

  const fixed = text.match(/\bfor (1|10) (minute|hour)s?\b/)
  if (fixed) {
    return `${fixed[1]} ${fixed[2]}${fixed[1] === '1' ? '' : 's'}`
  }

  if (/\buntil the end of your next turn\b/.test(text)) {
    return 'Until the end of your next turn'
  }
  if (/\buntil dispelled\b/.test(text)) return 'Until dispelled'

  return undefined
}

export function suggestEntryMetadata(input: SuggestionInput): EntrySuggestions {
  const text = `${input.name} ${input.description}`
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ')
    .trim()
  const range = detectRange(text)
  const saveType = detectSaveType(text)
  const resolutions: Resolution[] = []
  const targets: string[] = []
  const requirements: string[] = []
  const contexts: Context[] = []
  const intents: Intent[] = []

  if (saveType) resolutions.push('Save')
  if (/\battack roll\b|\bspell attack\b/.test(text)) {
    resolutions.push('Attack Roll')
  }
  if (/\bautomatically (?:hits|succeeds|fails|takes effect|applies)\b|\bthe effect automatically applies\b/.test(text)) {
    resolutions.push('Automatic Effect')
  }

  if (/\b(?:a|one|the|each|any|target|willing|hostile|visible) creature(?:s)?\b|\bcreature you\b/.test(text)) {
    targets.push('Creature')
  }
  if (/\b(?:a|one|the|each|any|target|unattended) object(?:s)?\b|\bobject you\b/.test(text)) {
    targets.push('Object')
  }
  if (/\b\d+[ -]foot (?:radius|cone|line|cube|sphere|area)\b|\barea centered\b/.test(text)) {
    targets.push('Location / Area')
  }
  if (range === 'Self') targets.push('Self')
  if (/\b(?:magical|spell) effect\b|\bphenomenon\b/.test(text)) {
    targets.push('Effect / Phenomenon')
  }
  if (/\bno target\b/.test(text)) targets.push('No Target')

  if (/\b(?:you can see|that can see you|visible to you|visible creature)\b/.test(text)) {
    requirements.push('Visibility required')
  }
  if (/\b(?:can hear(?: and understand)? you|you can hear|that hears you)\b/.test(text)) {
    requirements.push('Hearing / communication required')
  }
  if (range === 'Touch') requirements.push('Touch required')
  if (/\bwilling creature\b|\bcreature must be willing\b/.test(text)) {
    requirements.push('Willing target required')
  }
  if (/\bconcentration\b/.test(text)) requirements.push('Concentration / sustained effect')
  if (range && range !== 'Self' && range !== 'Touch') requirements.push('Range applies')
  if (/\b(?:expend|spend|use) (?:a|an|one|\d+) (?:spell slot|charge|point|die|use)\b/.test(text)) {
    requirements.push('Resource required')
  }

  let usage: string | undefined
  if (/\bat will\b/.test(text)) usage = 'At Will / Unlimited'
  else if (/\bonce per turn\b/.test(text)) usage = 'Per Turn'
  else if (/\b(?:once per|after a) short rest\b/.test(text)) usage = 'Per Short Rest'
  else if (/\b(?:once per|after a) long rest\b/.test(text)) usage = 'Per Long Rest'
  else if (/\bonce per day\b|\bper day\b/.test(text)) usage = 'Per Day'
  else if (/\b(?:has|have|with) \d+ charges?\b|\bexpend(?:s|ing)? (?:a|one) charge\b/.test(text)) {
    usage = 'Charges / Limited Uses'
  }

  const attackEvidence = has(text, [
    /\b(?:takes?|deals?|suffers?) (?:\w+ ){0,4}damage\b/,
    /\bdamage roll\b/,
    /\bspell attack\b/,
  ])
  const protectEvidence = has(text, [
    /\barmor class\b/,
    /\bresistance to\b/,
    /\bprevent(?:s|ed)? (?:the )?damage\b/,
    /\btemporary hit points\b/,
    /\bprotect(?:s|ed|ion)?\b/,
  ])
  const healEvidence = has(text, [
    /\bregains? (?:\w+ ){0,4}hit points?\b/,
    /\brestore(?:s|d)? (?:\w+ ){0,4}hit points?\b/,
    /\bheal(?:s|ed|ing)?\b/,
    /\bends? (?:a|the) disease\b/,
  ])
  const supportEvidence = has(text, [
    /\bgains? (?:a|an|the)? ?(?:\+\d+ )?bonus\b/,
    /\badd(?:s)? (?:a|an|one|the) d\d+\b/,
    /\badvantage on\b/,
    /\bproficiency (?:in|with)\b/,
  ])
  const controlEvidence = has(text, [
    /\b(?:blinded|charmed|deafened|frightened|grappled|incapacitated|paralyzed|poisoned|prone|restrained|stunned|unconscious)\b/,
    /\bspeed (?:is reduced|becomes 0)\b/,
    /\bcannot take (?:an )?action\b/,
    /\bdifficult terrain\b/,
  ])
  const moveEvidence = has(text, [
    /\bteleport(?:s|ed|ation)?\b/,
    /\bmovement speed\b/,
    /\bwalking speed\b/,
    /\bflying speed\b/,
    /\bmove through\b/,
    /\bwalk on (?:water|liquid)\b/,
  ])
  const investigateEvidence = has(text, [
    /\bdetect(?:s|ed|ing)?\b/,
    /\blocate(?:s|d)?\b/,
    /\bsense(?:s|d)?\b/,
    /\breveal(?:s|ed)?\b/,
    /\blearn(?:s|ed)?\b/,
    /\binformation about\b/,
    /\bask \w*(?:\s\w+){0,2} questions?\b/,
  ])
  const influenceEvidence = has(text, [
    /\bcommunicat(?:e|es|ed|ion)\b/,
    /\bmessage\b/,
    /\blanguage\b/,
    /\bcharm(?:s|ed)?\b/,
    /\bcompel(?:s|led)?\b/,
    /\bcommand(?:s|ed)?\b/,
    /\bunderstand(?:s)? (?:your|any|the) (?:words|speech|language)\b/,
  ])
  const interactEvidence = has(text, [
    /\brepair(?:s|ed)?\b/,
    /\breshape(?:s|d)?\b/,
    /\bcreate(?:s|d)? (?:food|water|materials?|an? objects?|the (?:object|material|environment))\b/,
    /\bdestroy(?:s|ed)? (?:food|water|materials?|an? objects?|the (?:object|material|environment))\b/,
    /\bmanipulate(?:s|d)?\b/,
    /\bopen(?:s|ed)? (?:an?|the) (?:door|lock|container)\b/,
  ])

  if (attackEvidence) intents.push('Attack / Harm')
  if (protectEvidence) intents.push('Protect / Defend')
  if (healEvidence) intents.push('Heal / Recover')
  if (supportEvidence) intents.push('Support / Empower')
  if (controlEvidence) intents.push('Control / Disrupt')
  if (moveEvidence) intents.push('Move / Escape')
  if (investigateEvidence) intents.push('Investigate / Learn')
  if (influenceEvidence) intents.push('Influence / Communicate')
  if (interactEvidence) intents.push('Interact / Manipulate')

  const combatMoveEvidence = /\bteleport(?:s|ed|ation)?\b|\b(?:movement|walking|flying) speed\b/.test(text)
  if (
    attackEvidence ||
    protectEvidence ||
    healEvidence ||
    controlEvidence ||
    combatMoveEvidence
  ) {
    contexts.push('Combat')
  }
  if (moveEvidence || investigateEvidence || interactEvidence) {
    contexts.push('Exploration')
  }
  if (influenceEvidence) contexts.push('Social / Roleplay')
  if (
    /\b(?:craft|repair|research|prepare|during a rest|over the course of)\b/.test(text) ||
    input.activation === 'Extended'
  ) {
    contexts.push('Downtime')
  }

  return {
    detected: {
      range,
      resolutions: unique(resolutions),
      saveType,
      targets: unique(targets),
      requirements: unique(requirements),
      usage,
      duration: detectDuration(text),
    },
    suggested: {
      contexts: unique(contexts),
      intents: unique(intents),
    },
  }
}

export function createDefaultSelection(
  entry: Entry,
  suggestions: EntrySuggestions,
): SuggestionSelection {
  return {
    range: Boolean(suggestions.detected.range && !entry.range),
    resolutions: suggestions.detected.resolutions.filter(
      (value) => !(entry.resolutions ?? []).includes(value),
    ),
    saveType: Boolean(suggestions.detected.saveType && !entry.saveType),
    targets: suggestions.detected.targets.filter(
      (value) => !(entry.targets ?? []).includes(value),
    ),
    requirements: suggestions.detected.requirements.filter(
      (value) => !(entry.requirements ?? []).includes(value),
    ),
    usage: Boolean(suggestions.detected.usage && !entry.usage),
    duration: Boolean(suggestions.detected.duration && !entry.duration),
    contexts: [],
    intents: [],
  }
}

export function applySuggestionSelection(
  entry: Entry,
  suggestions: EntrySuggestions,
  selection: SuggestionSelection,
): Entry {
  const detected = suggestions.detected

  return {
    ...entry,
    range: entry.range || (selection.range ? detected.range : undefined),
    resolutions: unique([...(entry.resolutions ?? []), ...selection.resolutions]),
    saveType:
      entry.saveType || (selection.saveType ? detected.saveType : undefined),
    targets: unique([...(entry.targets ?? []), ...selection.targets]),
    requirements: unique([...(entry.requirements ?? []), ...selection.requirements]),
    usage: entry.usage || (selection.usage ? detected.usage : undefined),
    duration:
      entry.duration || (selection.duration ? detected.duration : undefined),
    contexts: unique([...entry.contexts, ...selection.contexts]),
    intents: unique([...entry.intents, ...selection.intents]),
  }
}

export function applyAllSuggestions(
  entry: Entry,
  suggestions: EntrySuggestions,
) {
  const selection = createDefaultSelection(entry, suggestions)
  return applySuggestionSelection(entry, suggestions, {
    ...selection,
    contexts: suggestions.suggested.contexts.filter(
      (value) => !entry.contexts.includes(value),
    ),
    intents: suggestions.suggested.intents.filter(
      (value) => !entry.intents.includes(value),
    ),
  })
}
