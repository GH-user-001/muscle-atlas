# Muscle Atlas

An interactive 3D exercise studio with real BodyParts3D muscle and skeletal geometry, illustrative exercise motion, and rep playback. Public site available here https://muscle-atlas-motion.r4krz.chatgpt.site

## Included

- **Biceps:** dumbbell curl, hammer curl.
- **Triceps:** overhead extension, kickback.
- **Shoulders:** shoulder press, lateral raise.
- **Back:** bent-over row, lat pulldown.
- **Legs:** bodyweight squat, Romanian deadlift, standing calf raise.
- Primary and assisting muscle highlights, movement explanations and form cues.
- 1–30 target reps; play, pause, resume, reset, automatic completion, rep scrubbing, and 0.5×/1×/1.5× speeds.
- Orbit and zoom; front, side and back camera presets; responsive layout and keyboard-accessible controls.
- Build-muscle and lean-up guidance with ACE and CDC sources.
- Optional WebMCP `configure_exercise` tool, feature-detected and input validated.

## Run

Requires Node.js 22.13+ and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by the server (normally http://localhost:3000).

```sh
npm run check
npm run build
```

The Vinext/Vite build emits a Cloudflare-compatible Worker in `dist/server` and browser assets in `dist/client`. Sites hosting configuration is in `.openai/hosting.json`. It identifies this site's deployment; when deploying an independent copy, register your own site rather than reusing the ID. No API keys or application-owned accounts are required.

## Code map

- `app/page.tsx`: exercise selection, playback, goal modes and WebMCP.
- `app/scene.tsx`: Three.js model loading, camera and procedural motion shaders.
- `app/exercises.ts`: all exercise definitions and muscle matching.
- `app/globals.css`: theme and responsive layout.
- `public/models`: 668 reference muscle and skeletal meshes plus 2 schematic lat surfaces, packed into a ~15 MB gzip asset.
- `scripts/validate-model.mjs`: binary bounds, alignment, indices and anatomy coverage checks.

## Model and motion

The adult male anatomy is from **BodyParts3D 4.0**, © The Database Center for Life Science, licensed **CC BY 4.0**. It was simplified and packaged by Human Atlas; this project selects and repacks muscle and skeletal geometry, preserving mesh names and IDs. See [full attribution](public/ATTRIBUTION.md).

The source atlas omits the latissimus dorsi. Two original schematic lat surfaces supplement the reference and are labeled as schematic in the interface. They are illustrative approximations, not source anatomy meshes.

Movement is a procedural illustration, not a professionally rigged motion-capture model or validated biomechanical simulation. Highlights identify muscles involved; they do not report measured activation percentages. Muscle belly thickening is schematic. Equipment is omitted, and the pulldown illustrates upper-body movement without the full seated-machine setup. Anatomical variation and individual movement needs are not represented.

## Verification

TypeScript and production build checks; structural validation of every included anatomy mesh. WebMCP valid selection and rep updates were checked with visible state read-back; invalid input was rejected without changing the selected exercise. No broad browser interaction, responsive screenshot, or physical-device performance testing was performed.

## License

Application code: MIT. Anatomy assets: CC BY 4.0. Third-party packages retain their licenses. Preserve model attribution in redistributions.
