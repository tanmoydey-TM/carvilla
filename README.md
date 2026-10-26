# Car Villa

A local Next.js App Router showroom using JavaScript, GSAP ScrollTrigger, Lenis and FFmpeg-extracted imagery.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. The complete three-video sequence is the pinned hero: scrolling advances through 406 individually extracted video frames. The collection, philosophy and visit planner follow the hero.

## Validate

```sh
npm run lint
npm run build
npm start
```

## Media

The original `public/scene-1.mp4`, `scene-2.mp4` and `scene-3.mp4` are preserved. The generated WebP frames live in `public/media/scene-N/desktop/` and `mobile/`. Every output image contains exactly one source frame. All 158 + 124 + 124 source frames are retained in both resolutions; mobile changes only resolution, not frame count. Contact-sheet previews under ignored `.tools/previews/` are inspection-only and are never used on the site.

`npm run media:prepare` regenerates assets with FFmpeg. Set `FFMPEG_PATH` to your executable, install FFmpeg on PATH, or use the project-local imageio-ffmpeg binary under `.tools/python/imageio_ffmpeg/binaries/`. This local tool directory is ignored by Git and is not a deployment requirement. Deploy the generated media files.

The browser decodes at most 20 frames at a time, with two concurrent fetches. It releases decoded images after leaving the hero, uses smaller mobile frames, and provides static fallbacks and a motion toggle. Reduced-motion preferences disable smooth scrolling and the frame sequence.

## 3D model pipeline

The requested glTF Transform CLI is installed:

```sh
npm run model:optimize -- input.glb public/models/car.glb --compress meshopt --texture-compress webp
```

No GLB/glTF car model was supplied. The current hero uses cinematic image sequences, not an interactive WebGL model. The optimization command is ready for a real model; no substitute model or unverified vehicle specifications are fabricated.

## Scope

The collection filters and vehicle dialogs work locally. The visit planner downloads a personal text brief; it does not send personal data or confirm appointments. The page labels this explicitly. The showroom is a concept presentation; business address, contact information, real inventory, specifications and enquiry delivery need owner-provided details before a commercial launch.

No publication or deployment is configured.
