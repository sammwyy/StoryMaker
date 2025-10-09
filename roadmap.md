# StoryMaker - Development Roadmap

This document outlines the planned features and technical roadmap for StoryMaker, including audio support, image gallery/search, GIF support, video export, and audio visualization.

## 🎵 Audio Features

### 1) Audio Tracks Support
- **UI Components**: New "Audio" tab with track list, file picker (`.mp3/.wav/.ogg`), volume and offset (start) controls
- **Playback Engine**: `Web Audio API` for real‑time preview and signal analysis for the visualizer
- **Timeline Integration**: Introduce a project duration in seconds; each track has `start`, `end`, `volume`

### 2) Audio Visualizer
- **Real‑time Analysis**: `Web Audio API` `AnalyserNode` with `getByteFrequencyDomainData` or `getByteTimeDomainData`
- **Visual Components**: Overlays that draw bars/radials on the preview canvas
- **Export Integration**: During video render, recreate analysis per frame (or use pre‑recorded spectrum data) to draw the visualizer deterministically

## 🖼️ Image Gallery & Search

### 3) External Image Integration
- **API Integration**: Connect with public APIs like Unsplash or Pexels
  - Environment variables: `VITE_UNSPLASH_ACCESS_KEY` or `VITE_PEXELS_API_KEY`
- **UI Components**: Search with pagination, result grid, insert button to add to canvas
- **Performance**: Caching system to memoize queries and thumbnails

## 🎬 Animation & Video

### 4) GIF Support (Animated)
- **Import System**: Accept `.gif` files and decode frames
  - Options: `gifuct-js` client‑side decoding, or `<video>` when you have a prior conversion
- **Rendering**: When exporting to video, replay GIF frames synchronized with the timeline
- **Preview**: In the editor, use a lightweight frame loop in an overlay or canvas layer with `requestAnimationFrame` (with throttling for performance)

### 5) Video Export with Custom Duration
- **Render Engine**: Frame‑by‑frame rendering to a buffer and mux with `ffmpeg.wasm` in the browser
  - Parameters: `fps` (e.g., 30), adaptive `width/height` based on canvas, custom `duration`
- **Audio Mixing**: Combine tracks with `ffmpeg.wasm` (PCM/WAV input from `Web Audio API` or original files) and sync with video
- **Output Formats**: `mp4 (H.264 + AAC)` or `webm (VP9 + Opus)` depending on environment support

## 🏗️ Technical Implementation Plan

### Phase 1: Common Foundations
- Add project‑level state: `duration`, `fps`, `tracks` (audio/video), and a simple timeline
- Extract shared utilities: text measurement, image caches, scaling/clamp helpers
- Implement basic timeline UI components

### Phase 2: Basic Audio
- Audio tab: load a track and preview with `AudioContext`
- Persist metadata (offset, volume) in project state
- Basic audio controls (play/pause/seek)

### Phase 3: Audio Visualizer
- Create an `AudioAnalyserService` and one or more overlays (bars/wave/radial) with style options
- Real-time frequency analysis and visualization
- Customizable visualizer styles and colors

### Phase 4: Image Search
- Search component + grid; insert results as `ImageElement` with sensible initial sizing
- API integration with Unsplash/Pexels
- Caching and pagination system

### Phase 5: GIF Support
- Frame decoding pipeline + cache; low‑frequency playback in editor to save CPU
- GIF import and frame extraction
- Timeline synchronization for GIF animations

### Phase 6: Video Export
- Integrate `@ffmpeg/ffmpeg` (ffmpeg.wasm). Render canvas frames to images (e.g., PNG) and multiplex to `mp4/webm` with audio tracks
- Optimize with batching, queues, and progress feedback in the UI
- Support for multiple export formats and quality settings

## 🔧 Environment Variables

For external image search functionality:

```bash
# .env.local
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
VITE_PEXELS_API_KEY=your_pexels_api_key
```

## 📋 Development Priorities

1. **High Priority**: Audio tracks and basic timeline
2. **Medium Priority**: Image gallery/search integration
3. **Medium Priority**: GIF support for animations
4. **Low Priority**: Video export with custom duration
5. **Low Priority**: Advanced audio visualizer

## 🎯 Success Metrics

- **Audio**: Seamless audio track integration with visual timeline
- **Images**: Fast image search and insertion from external sources
- **Animation**: Smooth GIF playback and export
- **Video**: High-quality video export with audio synchronization
- **Performance**: Maintain 60fps during editing and export

## 🤝 Contributing to Roadmap

When implementing roadmap features:

1. Create a feature branch off `main`
2. Follow the existing code structure and patterns
3. Add comprehensive tests for new functionality
4. Update documentation for new features
5. Ensure `npm run lint` and `npm run typecheck` pass
6. Open a PR with clear description and implementation details

---

*This roadmap is subject to change based on user feedback and technical feasibility. Priority levels may be adjusted as the project evolves.*
