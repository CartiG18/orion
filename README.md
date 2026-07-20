# ◆ ORION — Planetary Monitoring Dashboard

> Retro-futurist orbital monitoring terminal with a CRT phosphor aesthetic.
> Real-time rotating planets, live satellite tracking, and system telemetry —
> rendered in the style of a sci-fi terminal from the Alien/Star Wars universe.

---

## Current Status: Phase 0 — Shell + Theme + Boot Sequence

This phase establishes:

- **Project scaffolding** — Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **CRT theme system** — CSS custom properties for phosphor-green / amber palettes,
  scanline overlay, vignette, glow/flicker utility classes
- **Boot sequence** — Full-screen typewriter terminal animation with skip support
- **Dashboard shell** — Placeholder 3-column layout proving the grid + theme work

### Upcoming Phases

- **Phase 1** — 3D planet rendering (Three.js / React Three Fiber)
- **Phase 2** — Live satellite tracking + orbital data overlays
- **Phase 3** — Telemetry panels, comms log, interactive controls

---

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm 9+

### Setup

```bash
# Clone the repository
git clone <repo-url> orion
cd orion

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the boot sequence
play, then transition into the placeholder dashboard.

### Switching Phosphor Palette

The theme supports green (default) and amber palettes. To test amber, open your
browser DevTools and change the attribute on `<html>`:

```
data-phosphor="amber"
```

A toggle UI will be added in a future phase.

---

## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Framework   | Next.js 16 (App Router)             |
| Language    | TypeScript (strict)                 |
| Styling     | Tailwind CSS v4 + custom CSS        |
| State       | Zustand                             |
| Deployment  | Vercel                              |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — data-phosphor attr, font, metadata
│   ├── page.tsx            # Home — renders BootGate
│   └── globals.css         # CRT theme system (all CSS vars + effects)
├── components/
│   ├── BootSequence.tsx    # Typewriter boot animation
│   ├── BootGate.tsx        # Boot vs dashboard orchestrator
│   └── DashboardShell.tsx  # Placeholder 3-column layout
└── stores/
    └── useBootStore.ts     # Zustand — boot state
```

---

## License

Private — not yet licensed for distribution.
