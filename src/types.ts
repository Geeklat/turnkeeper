export const contexts = ['Combat', 'Exploration', 'Social / Roleplay', 'Downtime'] as const
export type Context = (typeof contexts)[number]

export const intents = [
  'Attack / Harm', 'Protect / Defend', 'Heal / Recover', 'Support / Empower',
  'Control / Disrupt', 'Move / Escape', 'Investigate / Learn',
  'Influence / Communicate', 'Interact / Manipulate',
] as const
export type Intent = (typeof intents)[number]

export type EntryType = 'Active Option' | 'Triggered Option' | 'Passive Reminder' | 'Entry Modifier'
export type Kind = 'Spell' | 'Feature' | 'Skill' | 'Item Action' | 'Basic / System Action'
export type Activation = 'Action' | 'Bonus Action' | 'Reaction' | 'Movement' | 'Free / No Action' | 'Extended' | 'Other / Special' | 'Not Applicable'
export type Resolution = 'Save' | 'Attack Roll' | 'Automatic Effect' | 'Other / Special' | 'Not Applicable'
export type SpellAvailability = 'Available' | 'Unprepared'

export const kinds: Kind[] = ['Spell', 'Feature', 'Skill', 'Item Action', 'Basic / System Action']
export const sources: Entry['source'][] = ['Class', 'Species / Ancestry / Race', 'Feat', 'Item', 'Background', 'System / Core Rules', 'Custom']
export const entryTypes: EntryType[] = ['Active Option', 'Triggered Option', 'Passive Reminder', 'Entry Modifier']
export const activations: Activation[] = ['Action', 'Bonus Action', 'Reaction', 'Movement', 'Free / No Action', 'Extended', 'Other / Special', 'Not Applicable']
export const ranges = ['Self', 'Touch', '5 ft', '10 ft', '15 ft', '30 ft', '60 ft', '90 ft', '120 ft', '150 ft', '300 ft', '500 ft', 'Sight', 'Unlimited', 'Special / Custom', 'Not Applicable'] as const
export const resolutions: Resolution[] = ['Save', 'Attack Roll', 'Automatic Effect', 'Other / Special', 'Not Applicable']
export const saveTypes: NonNullable<Entry['saveType']>[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'Other / Special']
export const usages = ['At Will / Unlimited', 'Per Turn', 'Per Encounter', 'Per Short Rest', 'Per Long Rest', 'Per Day', 'Charges / Limited Uses', 'Resource-Based', 'Other / Special', 'Not Applicable'] as const
export const targets = ['Self', 'Creature', 'Object', 'Location / Area', 'Effect / Phenomenon', 'No Target'] as const
export const requirementOptions = ['Visibility required', 'Hearing / communication required', 'Touch required', 'Range applies', 'Willing target required', 'Specific target condition', 'Environmental requirement', 'Resource required', 'Concentration / sustained effect', 'Timing / trigger requirement'] as const

export interface Entry {
  id: string
  name: string
  description: string
  kind: Kind
  source: 'Class' | 'Species / Ancestry / Race' | 'Feat' | 'Item' | 'Background' | 'System / Core Rules' | 'Custom'
  sourceName?: string
  entryType: EntryType
  activation: Activation
  activationDetail?: string
  contexts: Context[]
  intents: Intent[]
  tier?: number
  spellGroup?: 'Innate Spellcasting'
  spellAvailability?: SpellAvailability
  ritual?: boolean
  range?: string
  rangeDetail?: string
  resolutions?: Resolution[]
  saveType?: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA' | 'Other / Special'
  targets?: string[]
  requirements?: string[]
  requirementDetails?: string
  usage?: string
  usageDetail?: string
  duration?: string
  notes?: string
  customTags?: string[]
}
