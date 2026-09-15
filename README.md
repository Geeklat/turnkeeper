# Turnkeeper

Turnkeeper is an experimental TTRPG decision-support app for a problem I run into at the table pretty often: having a character sheet full of useful abilities, but still blanking on what is worth considering in the moment.

The goal is not to build another complete digital character sheet or a rules engine. I want Turnkeeper to help answer a smaller question:

> **What options on my character are worth thinking about right now?**

The current prototype does that by filtering a character's abilities by **Context** and, optionally, **Intent**, then presenting the remaining options in a compact format that is easier to scan during play.

## The idea

A traditional character sheet is good at storing information, but not always great at helping with decisions under time pressure.

Turnkeeper treats character abilities as a set of options that can be surfaced based on what is happening.

Current contexts are:

- Combat
- Exploration
- Social / Roleplay
- Downtime

A player can then narrow those results by intent, such as:

- Attack / Harm
- Protect / Defend
- Heal / Recover
- Support / Empower
- Control / Disrupt
- Move / Escape
- Investigate / Learn
- Influence / Communicate
- Interact / Manipulate

The important distinction is that an option does not have to be immediately legal or usable to appear. If it is something I would reasonably want to remember in that situation, it belongs in the result set.

## Current prototype

The first vertical slice uses **Valskara**, one of my D&D characters, as a stress-test character.

At the moment the app supports:

- Context + optional Intent filtering
- Spells and other character option types
- Spell tiers and spell availability
- Available vs. unprepared spell presentation
- Ritual filtering
- Compact, aligned result rows for quick scanning
- Expandable detail views
- Range, activation, duration, resolution, saves, concentration, and related spell metadata
- Responsive layouts for desktop and narrow screens
- Keyboard-accessible expand/collapse controls

The Valskara fixture is intentionally doing more work than a tiny demo character would. I want enough real abilities in the app to expose whether the filtering model actually helps once the character has a large number of options.

## What this is not

At least for now, Turnkeeper is **not** trying to:

- replace a full character sheet
- enforce whether an ability is legal at this exact moment
- track spell slots, actions, positioning, enemy defenses, or encounter state
- recommend the mathematically optimal action
- become tied permanently to D&D-specific rules

The current focus is decision support, not rules automation.

## Tech

The project is deliberately small right now:

- React
- TypeScript
- Vite
- Semantic HTML
- Plain CSS

I am avoiding extra infrastructure until the product actually needs it. There is no backend, router, database, authentication layer, global state library, or UI framework at this stage.

## Running locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL reported by Vite.

Build the production bundle:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Where I am going next

The current filtering prototype is mainly about validating whether the core idea works with a real character.

The next areas I expect to work through are:

1. **Manual entry creation and editing**  
   Prove that the data model is reasonable to author, not just reasonable to render.

2. **Tag suggestions**  
   Add a deterministic suggestion pass that can extract obvious facts from an ability description and suggest likely Context / Intent metadata for review.

3. **Persistence**  
   Decide how character data should be stored only after the create/edit workflow is clear.

4. **Import / bulk entry**  
   Manually entering a large character is not a great long-term experience. Importing from pasted text, structured files, or existing character tools is an important future direction.

5. **Other game systems**  
   The data model is intended to remain system-agnostic, but I do not want to build a plugin architecture for hypothetical games before a second real system actually needs one.

There are also some longer-term ideas I am interested in, such as party-aware suggestions and noticing useful interactions between characters, but those are intentionally outside the current scope.

## Development approach

I am using coding agents as part of the development workflow for implementation, investigation, and review, but I am keeping product, UX, architecture, and scope decisions deliberate.

One of the things I am explicitly trying to practice with this project is **not** turning a straightforward idea into a framework before there is evidence that the extra complexity is useful.

## Status

Early prototype / active development.

The current goal is to prove the filtering experience before investing in persistence, integrations, or broader architecture.
