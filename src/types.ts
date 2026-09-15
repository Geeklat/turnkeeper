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
