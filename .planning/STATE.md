# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** The cook arrives prepared — with a confirmed menu in Spanish, a ready-to-check shopping list, and no language barrier between her and the household.
**Current focus:** Phase 2 — Menu Planning and Shopping

## Current Position

Phase: 2 of 5 (Menu Planning and Shopping)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-22 — Roadmap created; Phase 1 complete

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (Phase 2+ not yet started)
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | complete | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-Phase 2]: Three tech debt items (INFRA-01–03) must be resolved before any new write surface ships: rename `proxy.ts` → `middleware.ts`, scope RLS policies to role, remove Supabase URL placeholder fallback
- [Architecture]: All Claude API calls go server-side via `app/api/ai/*` route handlers — never expose `CLAUDE_API_KEY` to the browser
- [Phase 3]: Use Claude Haiku for translation, Sonnet for recipe generation/adjustment; enable prompt caching from day one to control costs
- [Phase 5]: Service worker scoped to `/lista` cook route only; no Background Sync — use `window.addEventListener('online')` fallback for iOS compatibility

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 3]: Streaming Claude responses and abort handling have open Next.js GitHub issues (#61972, #56529) — requires implementation research before writing streaming code
- [Phase 4]: Supabase Realtime requires `GRANT SELECT ON messages TO supabase_realtime` in migrations; silent failure if missing
- [Phase 2]: Ingredient schema in Phase 1 recipes may be free text — evaluate against `{quantity, unit, ingredient, notes}` tuple format needed for safe consolidation before starting SHOP-01

## Session Continuity

Last session: 2026-03-22
Stopped at: Roadmap created, all files written. Phase 2 is next — start with `/gsd:plan-phase 2`
Resume file: None
