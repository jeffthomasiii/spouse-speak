# Spouse Speak

**Same words. Happier marriages.**

Spouse Speak is a humorous, installable PWA for two people who love each other and somehow communicate in entirely different dialects.

A sender writes a natural message. Spouse Speak preserves the meaning and translates the delivery into the recipient's preferred communication style: short and direct, full-detail, romantic, or humor-forward.

## Phase 1

- Installable PWA shell and offline cache
- Responsive mobile-first interface
- Individual communication preferences for each spouse
- Adjustable parody level
- Two-way conversation model
- Original and translated message views
- Playful translation animation
- Local deterministic translation engine
- Built-in tea incident demo
- Local persistence
- No external services or API keys required

## Product principle

**Translate style, not truth.** Spouse Speak can shorten, expand, warm up, or playfully dramatize a message, but important plans, requests, times, and facts should not be intentionally changed.

## Run locally

Serve the repository over HTTP (for example, with a simple local web server) and open it in a browser. The service worker requires an HTTP origin.

## Architecture

Phase 1 intentionally uses plain HTML, CSS, and JavaScript. This keeps the PWA deployable on GitHub Pages with no build step. Translation logic lives separately in src/translator.js so a future AI-backed translator can replace or augment the local parody engine without rewriting the interface.

## Next phases

Phase 2 will focus on real couple pairing, authentication/data sync, a production translation service, message safety and meaning preservation, notifications, and a richer preference model.

> Spouse Speak is a parody communication tool, not relationship counseling, emergency communication, or evidence that your spouse can actually read your mind.


## Phase 2 pairing preview

Phase 2 introduces named spouse profiles and a six-digit pairing workflow. The current GitHub Pages implementation uses a local demo adapter so the UX and domain model can be tested without pretending that static hosting provides realtime cross-device messaging.

The backend contract is isolated in src/backend.js. Production work should replace that adapter with authenticated hosted storage while keeping the UI contract stable.

### Production backend responsibilities

- Authenticate each spouse as a distinct user.
- Redeem pairing codes exactly once and bind two users to a couple.
- Store original messages and recipient-specific translations.
- Synchronize conversations in realtime across devices.
- Keep AI/provider credentials server-side.
- Enforce authorization so only the paired couple can read its conversation.
- Support push notification subscriptions without exposing message data unnecessarily.


## Phase 3: real two-device backend

Phase 3 adds an optional Supabase adapter while preserving the local demo fallback. Create a Supabase project, run supabase/schema.sql in its SQL editor, copy config.example.js to config.js, and provide the project URL and browser-safe publishable key.

The database schema uses authenticated users and row-level security. Only members of a couple can select that couple's messages, and message inserts must come from an authenticated member.

Realtime subscriptions update the chat when the paired spouse inserts a message. The app also supports a server-side translateEndpoint. If no endpoint is configured or it is unavailable, Spouse Speak falls back to the built-in parody translator.

**Never put a Supabase service_role key or AI provider API key in config.js.** AI credentials belong behind the server-side translation endpoint.


## Phase 4: connected sign-in and pairing

When Supabase configuration is present, Spouse Speak switches from Demo mode to Connected mode. Each spouse signs in independently using a passwordless email magic link before creating or joining a six-digit couple code.

### Supabase dashboard setup

1. Create a free Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. In the project Connect dialog, copy the project URL and **publishable key** into a local `config.js` based on `config.example.js`. Do not use a secret/service-role key in the PWA.
4. Under Authentication URL Configuration, set the Site URL to the deployed Spouse Speak URL and add `https://jeffthomasiii.github.io/spouse-speak/` as an allowed Redirect URL.
5. Ensure email authentication is enabled.
6. Deploy `config.js` with the static site. The publishable key is designed for public clients; the database is protected by the RLS policies in `supabase/schema.sql`.

The two spouses should use different email accounts. After both are authenticated, one creates the pairing code and the other joins it.
