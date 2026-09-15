# Turnkeeper — Project Steering

## Purpose

Turnkeeper is a system-agnostic TTRPG decision-support application intended to reduce decision paralysis during play.

The initial product direction is a **Filtering Assistant** rather than a full rules engine or a complete digital character-sheet replacement.

A player records the actions, spells, abilities, features, and similar options available to their character. During play, the player selects the broad **Context** they are in and may optionally select an **Intent**. Turnkeeper then surfaces the entries that are worth remembering in that situation and presents the most useful mechanical information in a compact, scannable form.

Turnkeeper should help answer:

> “What options on my character are worth thinking about right now?”

It should not initially attempt to answer:

> “Which options are definitely legal or optimal right now?”

---

## Relationship to Global Steering

This file supplements the repository-wide `GITHUB_CODING_PROJECTS_STEERING` guidance.

The global steering document remains authoritative for:

- inspect → decide → implement → verify → review
- Human Decision Gates
- avoiding speculative architecture and agent-driven overengineering
- accessibility
- testing
- debugging
- documentation
- Git behavior
- release discipline
- repository hygiene
- public-repository review

This Turnkeeper file exists to preserve **project-specific product, UX, taxonomy, and architecture decisions**.

Do not duplicate global steering rules here unless Turnkeeper needs a stricter or more specific constraint.

---

# 1. Approved Technical Baseline

The initial application foundation is:

- React
- TypeScript
- Vite
- semantic HTML
- accessible frontend behavior from the beginning

The following are explicitly **not required yet** and should not be added without a concrete product need and Human Decision Gate:

- router
- backend
- database
- authentication
- global state library
- UI framework
- generalized plugin or integration architecture
- LLM integration

The project should remain as small as the approved product behavior allows.

---

# 2. v1 Product Boundary

## v1 is a filtering-focused character profile

Turnkeeper v1 does **not** need to maintain every field found on a traditional character sheet.

The first meaningful version focuses on the information needed to surface relevant character options.

The core flow is:

1. The character has a set of entries.
2. The player selects a required **Context**.
3. The player may optionally select an **Intent**.
4. Turnkeeper surfaces entries worth remembering in that situation.
5. The player may use secondary filters or search to narrow the result set.
6. Entries remain compact until expanded for more detail.

## v1 does not attempt to enforce rules legality

Turnkeeper should surface options that are **worth remembering**, even if the player must first change position, satisfy a target requirement, spend a resource, or create the circumstances needed to use the option.

Do not hide an otherwise relevant option simply because it may not be usable in the exact current moment.

---

# 3. Primary Filtering Vocabulary

## Context

Context is required when filtering.

Approved v1 Context values:

- Combat
- Exploration
- Social / Roleplay
- Downtime

Context means:

> A situation in which remembering this entry may be useful.

It does not mean:

> A situation in which this entry is guaranteed to be immediately usable.

An entry may belong to multiple Contexts.

## Intent

Intent is optional.

Approved v1 Intent values:

- Attack / Harm
- Protect / Defend
- Heal / Recover
- Support / Empower
- Control / Disrupt
- Move / Escape
- Investigate / Learn
- Influence / Communicate
- Interact / Manipulate

Selecting no Intent means:

> Show all entries relevant to the selected Context.

An entry may belong to multiple Intents.

---

# 4. Entry Type

Entry Type describes **how an entry behaves in play and how Turnkeeper should present it**.

Approved values:

- Active Option
- Triggered Option
- Passive Reminder
- Entry Modifier

Definitions:

### Active Option

Something the player can independently choose to do.

Examples:
- cast a spell
- use a skill
- take Dodge
- activate an item ability

### Triggered Option

Something the player may choose when a particular event or trigger occurs.

Examples:
- reactions
- opportunity attacks
- abilities that become available after a specific event

### Passive Reminder

Something worth remembering that does not normally require its own independent action.

Examples:
- passive bonuses
- automatic effects
- conditional reminders

### Entry Modifier

Something whose primary purpose is to change how another Turnkeeper entry is used or resolved rather than accomplishing an Intent independently.

Examples:
- Embodiment of the Law
- Sorcerer Metamagic options

An Entry Modifier is distinct from an Active Option such as Guidance or Bless. An ability is not an Entry Modifier merely because it improves a roll or another character.

---

# 5. Kind and Source

## Kind

Kind answers:

> What sort of capability is this?

Approved v1 values:

- Spell
- Feature
- Skill
- Item Action
- Basic / System Action

## Source

Source answers:

> Where does the character get this capability from?

Approved v1 values:

- Class
- Species / Ancestry / Race
- Feat
- Item
- Background
- System / Core Rules
- Custom

`Source` is required.

`Source Name` is optional.

Examples:

- Source: Class
- Source Name: Cleric

or:

- Source: Item
- Source Name: Staff of Whatever

Kind and Source are separate because a Spell may come from a Class, Species, Feat, Item, or another source.

---

# 6. Target Vocabulary

Target is descriptive metadata in v1.

It does **not** participate in the primary Context + Intent filtering flow.

Approved values:

- Self
- Creature
- Object
- Location / Area
- Effect / Phenomenon
- No Target

An entry may have more than one Target value when appropriate.

Target should describe **what kind of thing the entry acts on**.

Do not use Target to encode restrictions such as:

- ally
- enemy
- willing
- injured
- visible

Those belong under Requirements / Limitations.

---

# 7. Requirements / Limitations

Requirements / Limitations are descriptive metadata in v1.

They are intended to help a player quickly understand the circumstances that matter for an entry.

Approved v1 values:

- Visibility required
- Hearing / communication required
- Touch required
- Range applies
- Willing target required
- Specific target condition
- Environmental requirement
- Resource required
- Concentration / sustained effect
- Timing / trigger requirement

Exact rule text should remain descriptive detail rather than becoming a new taxonomy value.

Examples:

- `Specific target condition` with detail: “Target must have died within the last minute.”
- `Environmental requirement` with detail: “Must be cast on a surface.”
- `Timing / trigger requirement` with detail: “When a creature you can see attacks an ally.”

Use tags for recurring concepts that help scanning. Use descriptive text for exceptional or highly specific rules.

---

# 8. Activation

Activation is a structured field and may be used as a secondary filter.

Approved v1 values:

- Action
- Bonus Action
- Reaction
- Movement
- Free / No Action
- Extended
- Other / Special
- Not Applicable

`Extended` means the entry takes longer than the immediate action/turn cycle to activate or use.

Do not use Activation to represent effect duration.

Examples:

- Activation: Action
- Duration: 1 minute

or:

- Activation: Extended
- Activation detail: 10 minutes

Activation is required for every entry.

---

# 9. Usage / Frequency

Usage / Frequency is descriptive metadata in v1.

Approved values:

- At Will / Unlimited
- Per Turn
- Per Encounter
- Per Short Rest
- Per Long Rest
- Per Day
- Charges / Limited Uses
- Resource-Based
- Other / Special
- Not Applicable

Exact quantities or refresh rules remain descriptive detail.

Examples:

- Usage / Frequency: Charges / Limited Uses
- Detail: 3 uses

or:

- Usage / Frequency: Per Long Rest
- Detail: Once per Long Rest

Usage / Frequency is not a primary filter in v1.

---

# 10. Duration

Duration is an optional descriptive text field in v1.

Do not create a controlled Duration taxonomy yet.

Examples:

- Instantaneous
- Until the end of your next turn
- Concentration, up to 1 minute
- 1 hour
- Until dispelled

Structure Duration further only if a concrete product need appears.

---

# 11. Spell Tier

Spell Tier is a system-neutral numeric grouping and sorting field.

`Tier` is required whenever `Kind = Spell`.

For the initial D&D-oriented test case:

| Tier | D&D Display |
| ---: | --- |
| 0 | Cantrip |
| 1 | 1st Level |
| 2 | 2nd Level |
| 3 | 3rd Level |
| 4 | 4th Level |
| 5 | 5th Level |
| 6 | 6th Level |
| 7 | 7th Level |
| 8 | 8th Level |
| 9 | 9th Level |

Turnkeeper should sort Spells:

1. by Tier ascending
2. alphabetically within each Tier

Do not build a generalized game-system definition framework solely to translate Tier labels yet.

---

# 12. Range

Range is an optional structured/selectable field.

The initial D&D-oriented values are:

- Self
- Touch
- 5 ft
- 10 ft
- 15 ft
- 30 ft
- 60 ft
- 90 ft
- 120 ft
- 150 ft
- 300 ft
- 500 ft
- Sight
- Unlimited
- Special / Custom
- Not Applicable

If `Special / Custom` is selected, allow a freeform Range detail.

Example:

- Range: Special / Custom
- Detail: “Within the same plane of existence”

Range is displayed prominently in collapsed result rows.

Do not build a generalized per-system Range framework yet.

---

# 13. Resolution and Save Type

Resolution describes **how an entry determines whether/how its effect applies**.

Approved v1 Resolution values:

- Save
- Attack Roll
- Automatic Effect
- Other / Special
- Not Applicable

An entry may have more than one Resolution value when genuinely necessary.

If `Save` is selected, Save Type may be:

- STR
- DEX
- CON
- INT
- WIS
- CHA
- Other / Special

Save Type is descriptive metadata, not a primary filter.

Do not add attack bonuses, spell-save DC calculations, enemy defenses, predicted hit chance, advantage/disadvantage calculations, or other encounter-state logic in v1.

---

# 14. Required Entry Fields

Every Turnkeeper entry requires:

- Name
- Description
- Kind
- Source
- Entry Type
- Activation

Conditionally required:

- Tier when Kind = Spell

Everything else may be absent.

A valid entry may have no Context, Intent, Target, Requirements, Usage/Frequency, Duration, Notes, Resolution, Range, or Custom Tags.

This is necessary to support **Save without tags**.

---

# 15. Entry Creation UX

The initial creation form should require the minimum validated information and avoid presenting the full taxonomy as a large mandatory questionnaire.

Required initial fields:

- Name
- Description
- Kind
- Source
- Entry Type
- Activation

Conditionally required:

- Tier when Kind = Spell

Optional initial fields may include:

- Source Name
- Range
- Resolution / Save Type
- Usage / Frequency
- Duration
- Notes

After completing the entry, the user chooses one of three explicit submission paths:

### Save with suggested tags

- run the suggestion engine once
- apply both Detected and Suggested metadata
- save

### Save without tags

- save immediately
- do not run the suggestion engine

### Review suggested tags

This is the primary/default path.

- run the suggestion engine once
- Detected values are preselected
- Suggested values are displayed but not preselected
- user may toggle any value
- user may add Custom Tags
- save after review

User choices are authoritative.

Do not silently overwrite reviewed metadata.

---

# 16. Deterministic Suggestion Engine

Turnkeeper v1 does not depend on an LLM.

The suggestion engine is deterministic and runs only after explicit user submission through a suggestion-based path.

It analyzes:

- Name
- Description

It may also use the required structured fields as context:

- Kind
- Source
- Entry Type
- Activation

It does not rewrite those required fields.

The engine may produce suggestions for optional enrichment metadata such as:

- Context
- Intent
- Target
- Requirements / Limitations
- Range
- Resolution
- Save Type
- Usage / Frequency
- Duration when reliably extractable

## Detected

`Detected` means the value has direct textual or structured evidence.

Examples:

- “bonus action” → Bonus Action
- “within 60 feet” → Range: 60 ft
- “creature you can see” → Target: Creature + Visibility required
- “Wisdom saving throw” → Resolution: Save + Save Type: WIS
- “touch” → Touch required
- “concentration” → Concentration / sustained effect

Detected values are preselected on the Review screen.

## Suggested

`Suggested` means Turnkeeper is interpreting what an entry appears useful for.

This primarily applies to:

- Context
- Intent

Examples:

- damage wording → Attack / Harm
- healing wording → Heal / Recover
- frightened/restrained/control wording → Control / Disrupt
- advantage/buff wording → Support / Empower

Suggested values are visible but unselected on the Review screen.

Do not expose fake precision or numeric confidence scores in v1.

---

# 17. Custom Tags

Custom Tags are freeform strings only in v1.

They may be:

- searched
- optionally filtered

Behavior:

- match existing tags case-insensitively
- autocomplete/reuse existing tags
- preserve the existing display spelling/casing
- prevent exact duplicate tags on the same entry
- allow genuinely new tags
- do not perform semantic normalization
- do not merge synonyms automatically

Examples that remain distinct unless the user deliberately reuses them:

- boss
- boss fight
- major encounter

Do not create user-defined tag categories or hierarchies in v1.

---

# 18. Search Behavior

Search is an additional narrowing layer, not a separate search mode.

Search applies after the active filtering state.

Conceptually:

1. character entries
2. Context
3. optional Intent
4. optional secondary filters
5. optional search
6. grouped/sorted presentation

Search matches:

- Name
- Description
- Custom Tags

v1 search behavior:

- case-insensitive substring matching
- no fuzzy matching
- no stemming
- no synonym expansion
- no ranking/relevance scoring

---

# 19. Secondary Filters

Primary filtering remains:

- Context
- optional Intent

Approved secondary filtering/organization concepts include:

- Kind
- Source
- Activation
- Custom Tags

Range, Resolution, Save Type, Target, Requirements, Usage/Frequency, and Duration are initially descriptive unless a concrete user need later justifies filtering.

Do not turn every structured field into a filter automatically.

---

# 20. Result Presentation

The result screen should prioritize fast scanning and progressive disclosure.

## General result behavior

- hide empty groups completely
- do not display headings with no matching entries
- keep entries collapsed by default
- allow individual entries to expand in place for more detail
- avoid reproducing a full character sheet inside the filtered results

## Active Options

Active Options are primarily grouped by **Kind**.

Only show a Kind heading if at least one matching entry exists.

Examples:

- Spells
- Features
- Skills
- Item Actions
- Basic / System Actions

### Spell organization

Within `Spells`:

1. group by Tier
2. hide empty Tiers
3. sort Tiers ascending
4. sort entries alphabetically within each Tier

Example:

```text
COMBAT
Heal / Recover

────────────────────────────────

SPELLS

Cantrips
  Spare the Dying — Action — Touch — Automatic >

1st Level
  Cure Wounds — Action — Touch — Automatic >
  Healing Word — Bonus Action — 60 ft — Automatic >

2nd Level
  ...
```

## Collapsed result row

The initial collapsed row should present:

> Name — Activation — Range — Resolution >

When Resolution is a Save, show the Save Type:

- Command — Action — 60 ft — WIS Save >
- Sacred Flame — Action — 60 ft — DEX Save >

Other examples:

- Guiding Bolt — Action — 120 ft — Attack Roll >
- Bless — Action — 30 ft — Automatic >
- Cure Wounds — Action — Touch — Automatic >

If a value does not apply, omit it cleanly rather than displaying empty punctuation or placeholder noise.

## Expanded result

Expanding an entry should reveal relevant details such as:

- Intent
- Target
- Requirements / Limitations
- Resolution details
- Usage / Frequency
- Duration
- Description
- Notes
- Source / Source Name
- Custom Tags

The exact visual arrangement is not yet settled.

## Other Entry Types

After the primary Kind-grouped Active Options, present reminder-oriented sections for the remaining Entry Types.

Conceptual headings:

### When Something Happens
Triggered Options

### Remember
Passive Reminders

### Modifies Other Options
Entry Modifiers

These sections may also group by Kind where useful, but avoid unnecessary nested hierarchy.

---

# 21. Accessibility and Cognitive Load

Turnkeeper’s core product problem is cognitive load.

The UI should therefore:

- make the most relevant information easy to scan
- use progressive disclosure
- avoid requiring the player to fully describe the encounter before receiving help
- avoid large walls of rules text in initial results
- keep Context required but Intent optional
- keep secondary filters optional
- not rely on color alone for state or suggestion confidence
- use semantic controls
- support keyboard interaction
- maintain visible focus
- keep collapsed/expanded state understandable to assistive technology

Accessibility behavior that materially changes navigation, activation, focus movement, or content consumption remains a Human Decision Gate.

---

# 22. Initial Test Case

Valskara is the first taxonomy and UX stress-test character.

Valskara uses a blended D&D 5e / 2024 rules context with this precedence:

> If a D&D 2024 / 5.5e rule exists, use that rule ahead of the older 2014 5e rule.

The current Turnkeeper work does not need to model the full mechanical differences between those rulesets yet.

Valskara is used primarily to test:

- whether Context + Intent produces useful narrowing
- whether Target and Requirement metadata are understandable
- whether Entry Types reflect real character abilities
- whether collapsed rows expose useful tactical information
- whether the deterministic suggestion engine can extract obvious structured details

Do not turn Valskara-specific rules into universal Turnkeeper assumptions.

---

# 23. Explicitly Deferred

The following ideas are intentionally deferred until the core single-character filtering experience is validated.

## Full character-sheet replacement

Turnkeeper may eventually maintain more traditional character-sheet data, but v1 does not need to do so.

## Rules legality engine

Do not initially calculate whether an option is definitely usable based on:

- remaining actions
- current spell slots
- concentration state
- target distance
- line of sight
- current conditions
- enemy statistics
- exact action economy
- other encounter state

## LLM integration

LLM-based interpretation could be useful later, but v1 uses deterministic local suggestions.

## Import / bulk entry

Manual one-by-one entry is acceptable for the first pass.

Import is an important future usability need.

Potential future sources may include:

- pasted text
- JSON/CSV
- character-sheet exports
- Foundry data
- Roll20-related sources
- browser extraction
- other system-specific importers

Do not create a generalized importer/plugin framework yet.

## Party awareness

A future Turnkeeper direction may track party-member abilities so the player can identify:

- combinations
- interactions
- complementary actions
- abilities another party member could use instead
- condition/effect synergies

v1 remains single-character focused.

Do not create party data structures or cross-character interaction systems yet.

## Generalized game-system architecture

The product should remain capable of becoming system-agnostic, but do not build a generalized rules-package, plugin, adapter, or system-definition framework before a second real game requires it.

---

# 24. Current Information Model Summary

## Required

- Name
- Description
- Kind
- Source
- Entry Type
- Activation

## Conditionally Required

- Tier when Kind = Spell

## Optional Structured / Controlled

- Source Name
- Context
- Intent
- Target
- Requirements / Limitations
- Range
- Resolution
- Save Type
- Usage / Frequency
- Custom Tags

## Optional Descriptive

- Activation detail
- Range detail
- Requirement details
- Usage / Frequency detail
- Duration
- Notes

---

# 25. Current Product Principles

1. **Worth remembering is more important than currently usable.**
2. **Context + optional Intent is the core filtering interaction.**
3. **Do not make the player model the whole encounter before receiving help.**
4. **Tags and structured metadata should support scanning, not become a rules engine.**
5. **Use controlled vocabularies for recurring concepts and descriptive text for exceptional rules.**
6. **Keep user-reviewed classifications authoritative.**
7. **Automate concrete extraction more aggressively than subjective interpretation.**
8. **Hide empty organizational sections.**
9. **Use progressive disclosure rather than walls of character-sheet text.**
10. **Do not generalize for hypothetical systems before a second real use case requires it.**

---

# 26. Known Future Questions

These are not approved implementation requirements yet.

- What persistence approach should Turnkeeper use?
- How should multiple characters be managed?
- How should editing and re-running suggestions reconcile with existing user changes?
- What exact deterministic phrase/pattern rules belong in the first suggestion engine?
- What should the full expanded-entry visual hierarchy be?
- Should Target, Resolution, Range, Usage/Frequency, or other metadata become secondary filters after usability testing?
- What import format should be implemented first?
- When does party awareness become useful enough to justify cross-character data?
- What second TTRPG system should be used to test whether the current neutral vocabulary actually generalizes?

These should be handled one meaningful decision at a time under the global Human Decision Gate process.
