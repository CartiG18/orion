# ◆ ORION — Planetary Monitoring Dashboard

> Retro-futurist orbital monitoring terminal with a CRT phosphor aesthetic.
> Real-time rotating planets, live satellite tracking, and system telemetry —
> rendered in the style of a sci-fi terminal from the Alien/Star Wars universe.

---

## Features

- **Immersive Retro UI** — Full-screen CRT scanline overlays, screen curvature effects, phosphor glow, and CSS-based UI flicker.
- **Boot Sequence** — Typewriter-style terminal initialization sequence on startup (can be skipped via click).
- **Mathematical Solar System Model** — Calculates real-time planet positions and orientations based on Keplerian orbital elements and the J2000 epoch.
- **Interactive 3D Engine** — Built with Three.js and React Three Fiber.
  - **Overview Mode**: A zoomed-out view of the entire solar system featuring orbital elliptical paths.
  - **Focus Mode**: Click any planet to smoothly fly in and lock onto it.
  - **Click-and-Drag**: Smooth orbital camera controls.
- **Live Telemetry & Tracking** — Calculates Right Ascension and Declination for celestial bodies, updating seamlessly in the UI.
- **Configuration Hub** — Persistent settings menu (saved via Zustand and LocalStorage).
  - **Themes**: Phosphor Green, Phosphor Amber, Cyanotype, and High-Contrast Monochrome.
  - **Time Synchronization**: Toggle between Universal Coordinated Time (UTC) and Local System Time.

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
play, then transition into the dashboard.

---

## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Framework   | Next.js 16 (App Router)             |
| Engine      | Three.js + React Three Fiber        |
| Language    | TypeScript (strict)                 |
| Styling     | Tailwind CSS v4 + custom CSS        |
| State       | Zustand (with persist middleware)   |
| Deployment  | Vercel                              |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home — renders BootGate
│   └── globals.css         # CRT theme system (CSS vars + effects)
├── components/
│   ├── BootSequence.tsx    # Typewriter boot animation
│   ├── BootGate.tsx        # Boot vs dashboard orchestrator
│   ├── DashboardShell.tsx  # Main 3-column UI grid
│   ├── SettingsModal.tsx   # Overlay for persistent configuration
│   └── scene/              # All Three.js / R3F components
│       ├── CelestialViewport.tsx
│       ├── SolarSystem.tsx
│       ├── CelestialBody.tsx
│       └── CameraController.tsx
├── lib/
│   └── astronomy.ts        # Core math & Keplerian orbital calculations
├── data/
│   └── celestialBodies.ts  # Planet configurations (radius, axial tilt, colors)
└── stores/
    ├── useBootStore.ts       # Boot sequence state
    ├── useCelestialStore.ts  # Camera and focus state
    └── useSettingsStore.ts   # Persistent settings (theme, timezone)
```

---

## License

Private — not yet licensed for distribution.
