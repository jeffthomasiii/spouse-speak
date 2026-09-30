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
