# Motion Studio

Motion Studio is a browser-based motion design system for browsing, tweaking, and exporting React animation effects. It includes parametric effects across text reveals, gesture interactions, 3D effects, particle systems, carousels, loaders, overlays, and image treatments.

It started as a personal library to avoid rebuilding the same animations from scratch across projects, and is open source so others can fork it, simplify it, extend it, or adapt it to their own stack.

The project is built with React 19, Vite, Motion, Tailwind CSS, and Radix UI. It runs entirely in the browser through the Vite web build.

## What You Can Do

- Browse a library of production-style motion effects.
- Adjust each effect with live controls.
- Preview motion in a focused stage.
- Copy or export effect code from the web UI.
- Test image treatments with sample or custom images.

## Requirements

- Node.js `24` or newer
- npm

You can check your versions with:

```bash
node -v
npm -v
```

## Quick Start

Clone the repository, install dependencies, and run the web version:

```bash
npm install
npm run dev:web
```

Then open:

```text
http://localhost:5173/
```

## Useful Commands

```bash
npm run dev:web
```

Starts the Vite web app for local development.

```bash
npm run build:web
```

Builds the web app into `dist-web/`.

```bash
npm run dev
```

Starts the Glaze desktop/dev host. This requires the Glaze SDK to be available locally.

```bash
npm run build
```

Builds the Glaze app. This also requires the Glaze SDK.

```bash
npm run lint
npm run type-check
npm run format
```

Runs the Glaze-managed quality commands. These require the Glaze CLI.

## About Glaze

The web app can run with `npm run dev:web` without a local Glaze SDK because the Vite config maps Glaze imports to browser shims where needed.

The desktop/host commands use `glaze.ts`, which looks for the Glaze CLI in local SDK paths such as:

```text
../glaze-core/cli/glaze.js
../../../sdk/current/@glaze/core/cli/glaze.js
```

If `npm run dev`, `npm run build`, `npm run lint`, or `npm run type-check` fails with `CLI not found`, install or link the Glaze SDK in one of those expected locations, or update `glaze.ts` to point to your local SDK.

## Project Structure

```text
renderer/main/              Main React app shell and routes
renderer/components/        UI panels, preview stages, and controls
renderer/components/effects Motion effect implementations
renderer/components/treatments Image treatment implementations
renderer/lib/               Export, animation, canvas, and source image helpers
renderer/shims/             Browser-friendly Glaze shims for the web build
main/                       Glaze/Electron host entry points and handlers
vite.web.config.ts          Vite config for the web version
glaze.ts                    Wrapper for the Glaze CLI
```

## For Non-Developers

If you are not used to terminals, Git, or local development, you can still ask your favorite AI assistant to guide you step by step.

Copy and paste this prompt:

```text
I want to run a React/Vite project called Motion Studio on my computer.
Please guide me step by step like I am not a developer.

The project requires Node.js 24 or newer and npm.
The basic commands are:

npm install
npm run dev:web

After the server starts, I should open http://localhost:5173/

Before giving me commands, help me check whether Node.js and npm are installed.
If something fails, explain what the error means and what I should try next.
```

## Current Local Development Note

For most contributors, start with the web version:

```bash
npm run dev:web
```

Use the Glaze commands only if you have the Glaze SDK available locally.
