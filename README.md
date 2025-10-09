## StoryMaker

Online image editor with adaptive canvas support for multiple social media platforms. Compose backgrounds, text, and image elements with transforms and effects, and export the result to image formats. This document describes the current state and the plan to add: audio, image gallery/search, GIF support, video export with custom duration, and an audio visualizer.

### Current features
- **Adaptive Canvas**: Support for multiple aspect ratios including IG Story, FB Post, Tweet, custom.
- **Drag & Drop**: Upload images by dragging files directly onto the canvas or background area.
- **Backgrounds**: `fit`, `stretch`, solid color, gradient, `repeat` and `blur` with caching for performance.
- **Text**: word/character wrapping, color, size, font, rotation, and outline.
- **Images**: resize, rotate, mirror H/V, corners (square/rounded/circle/custom), brightness/contrast/blur/filters.
- **Visual editing**: overlays to move, resize (8 handles), and rotate with a guide circle.
- **Export**: image export to `jpg/png/webp` from the main canvas.
- **Dark mode**: theme toggle.

### Quick demo (usage flow)
1. Select your desired canvas size (Instagram Story, Facebook Post, etc.) from the dropdown.
2. Upload a background image by dragging & dropping onto the upload area or clicking to browse.
3. Adjust the background (fit/stretch/solid/gradient/blur/repeat).
4. Add texts and images; drag & drop additional images directly onto the canvas.
5. Use the visual overlay to move, resize, and rotate elements.
6. Export in the desired format (JPG/PNG/WEBP).

### Requirements
- Node.js 18+ and npm 9+.

### Installation and scripts
```bash
npm install
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Serve the build for verification
npm run lint     # ESLint + TypeScript rules
npm run typecheck
```

### Project structure (overview)
- `src/components/layout/StoryCanvas.tsx`: canvas rendering of background, images, and text with adaptive dimensions.
- `src/lib/renderer.ts`: `CanvasRenderer` class handling all drawing operations and canvas management.
- `src/lib/aspectRatios.ts`: predefined aspect ratio configurations for social media platforms.
- `src/components/ui/AspectRatioDropdown.tsx`: dropdown component for selecting canvas dimensions.
- `src/components/visual-editor/`: visual editors and overlays (text and image).
- `src/hooks/useTextTransform.ts`, `src/hooks/useImageTransform.ts`: move/resize/rotate overlay logic.
- `src/components/tabs/`: configuration panels (background, text, images, export).
- `src/lib/types.ts`: shared types (text, image, background, aspect ratios, etc.).

### Architecture (high level)
- The main `canvas` produces the final render with adaptive dimensions based on selected aspect ratio. Visual editors place a fixed overlay above the canvas for manipulation without repainting the bitmap until actions are confirmed.
- Painting uses caches (e.g., blur and processed images) to avoid expensive recomputation between frames.
- Canvas dimensions are configurable through the `CanvasRenderer` class, supporting multiple social media formats and custom resolutions.

---

## Roadmap for new features

> This section outlines how to add sounds, image gallery/search, GIF support, video export with custom duration, and an audio visualizer.

### 1) Add sounds (audio tracks)
- UI: new “Audio” tab with track list, file picker (`.mp3/.wav/.ogg`), volume and offset (start) controls.
- Playback: `Web Audio API` for real‑time preview and signal analysis for the visualizer.
- Timeline: introduce a project duration in seconds; each track has `start`, `end`, `volume`.

### 2) Image gallery and search
- Integration with public APIs: Unsplash or Pexels.
  - Dev env vars: `VITE_UNSPLASH_ACCESS_KEY` or `VITE_PEXELS_API_KEY`.
- UI: search with pagination, result grid, insert button to add to canvas.
- Caching: memoize queries and thumbnails.

### 3) GIF support (animated)
- Import: accept `.gif` and decode frames.
  - Options: `gifuct-js` client‑side decoding, or `<video>` when you have a prior conversion.
- Render: when exporting to video, replay GIF frames synchronized with the timeline.
- Preview: in the editor, use a lightweight frame loop in an overlay or canvas layer with `requestAnimationFrame` (with throttling for performance).

### 4) Export to video with custom duration
- Render engine: frame‑by‑frame rendering to a buffer and mux with `ffmpeg.wasm` in the browser.
  - Parameters: `fps` (e.g., 30), fixed `width/height` 1080×1920, custom `duration`.
- Audio mix: combine tracks with `ffmpeg.wasm` (PCM/WAV input from `Web Audio API` or original files) and sync with video.
- Formats: `mp4 (H.264 + AAC)` or `webm (VP9 + Opus)` depending on environment support.

### 5) Audio visualizer
- Real‑time analysis: `Web Audio API` `AnalyserNode` with `getByteFrequencyDomainData` or `getByteTimeDomainData`.
- Overlays: components that draw bars/radials on the preview canvas.
- Export: during video render, recreate analysis per frame (or use pre‑recorded spectrum data) to draw the visualizer deterministically.

---

## Suggested technical plan (iterative)

1) Common foundations
- Add project‑level state: `duration`, `fps`, `tracks` (audio/video), and a simple timeline.
- Extract shared utilities: text measurement, image caches, scaling/clamp helpers.

2) Basic audio
- Audio tab: load a track and preview with `AudioContext`.
- Persist metadata (offset, volume) in project state.

3) Visualizer
- Create an `AudioAnalyserService` and one or more overlays (bars/wave/radial) with style options.

4) Image search
- Search component + grid; insert results as `ImageElement` with sensible initial sizing.

5) GIFs
- Frame decoding pipeline + cache; low‑frequency playback in editor to save CPU.

6) Video export
- Integrate `@ffmpeg/ffmpeg` (ffmpeg.wasm). Render canvas frames to images (e.g., PNG) and multiplex to `mp4/webm` with audio tracks.
- Optimize with batching, queues, and progress feedback in the UI.

---

## Environment variables (for external search)
```bash
# .env.local
VITE_UNSPLASH_ACCESS_KEY=...
VITE_PEXELS_API_KEY=...
```

## Repository practices
- Strict TypeScript and ESLint rules (hooks, no `any`, prefer `const`).
- TailwindCSS for styling and theming.
- Reusable components and hooks for transforms and overlays.

## Contributing
1. Create a branch off `main`.
2. Make sure `npm run lint` and `npm run typecheck` pass.
3. Open a PR with a clear description and screenshots when applicable.

## License
MIT. Adapt as needed for your project.


