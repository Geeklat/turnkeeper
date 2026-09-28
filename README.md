# Turnkeeper

Turnkeeper is a TTRPG tool I'm building to help with a problem I run into pretty often at the table: having a character sheet full of useful abilities, but blanking on what I should actually be considering in the moment.

A character sheet is great at telling me what my character has. It isn't always great at answering:

> **What options are worth thinking about right now?**

Turnkeeper tries to answer that question without becoming another full character sheet or rules engine.

## How it works

Abilities are tagged with the kinds of situations where they're worth remembering.

The main filter is **Context**:

- Combat
- Exploration
- Social / Roleplay
- Downtime

You can optionally narrow that further with an **Intent**, such as attacking, protecting someone, healing, investigating, influencing someone, or interacting with the environment.

The important part is that Turnkeeper isn't trying to decide whether something is technically legal at this exact second. If an ability is something I might reasonably want to remember in the current situation, I want it to show up.

## Current state

The prototype currently has two main views.

**Use Character** is where I filter a character's options by Context and Intent and scan the results during play.

**Manage Character** is where I can add and edit abilities and review Turnkeeper's suggested classifications.

Suggestions are deterministic rather than AI-generated. Turnkeeper can pick up concrete details from an entry, such as range, saves, targets, or concentration, and can also suggest broader Context and Intent tags. Those suggestions are reviewable rather than silently changing the character data.

The app currently supports spells, features, skills, items, and basic actions, along with details such as activation, range, duration, resolution, saves, spell tiers, availability, rituals, and requirements.

Changes are still session-only, so refreshing the page resets the character.

## Character data

Eventually I want players to bring their own character data into Turnkeeper rather than have the app ship with a library of game rules and abilities.

For now the public version starts with **Mira Embertrail**, a small sample character I use to demonstrate and test the UI.

Behind the scenes, Turnkeeper has its own simple character-document format. The idea is that future importers can take data from a supported character source, turn it into that format, and then let the rest of the app treat every character the same way.

## What Turnkeeper isn't trying to do

Turnkeeper isn't currently trying to replace a character sheet, enforce every game rule, track encounter state, or calculate the mathematically best move.

The focus is much narrower: help me remember the options I already have when I'm deciding what to do.

## Tech

Turnkeeper is currently built with React, TypeScript, Vite, semantic HTML, and plain CSS.

There is no backend, database, authentication, router, global state library, or UI framework yet. I'll add infrastructure when the product gives me a reason to need it.

## Running locally

I've verified the current project with Node 24.14.0. That's a tested environment, not a minimum supported version.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Run tests and TypeScript checks:

```bash
npm test
npm run typecheck
```

## What's next

The biggest missing piece is getting character data into and out of Turnkeeper without manually rebuilding a character every session.

I'm working toward a flow where a player can load character data, use and edit it in Turnkeeper, and save those changes for later. After that, I want to explore importing from real character sources rather than requiring Turnkeeper's own format.

I also want to try the model against other game systems before deciding how much needs to be generalized. I'd rather discover the abstraction from real examples than build a plugin system for hypothetical ones.

There are some longer-term ideas I'm interested in too, especially party-aware suggestions and interactions between characters, but they're well beyond the current prototype.

## Development

I'm using coding agents during implementation, investigation, and review, while keeping product, UX, scope, and architecture decisions human-directed.

Part of the point of this project for me is practicing restraint: build the thing I need now, see where it fails, and only add more architecture when there's a concrete reason for it.

## Status

Early prototype / active development.

Right now I'm mainly trying to prove that filtering a character by **what's happening** and **what I'm trying to do** is actually useful at the table.
