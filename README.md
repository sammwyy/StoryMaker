## StoryMaker

A modern, adaptive image editor designed for creating content across multiple social media platforms. Features an intelligent canvas that automatically adjusts to your background image dimensions, drag & drop functionality, and comprehensive editing tools for text and images.

### ✨ Key Features
- **🎯 Adaptive Canvas**: Automatically adjusts to your background image dimensions or choose from predefined social media formats
- **🖱️ Drag & Drop**: Upload images by dragging files directly onto the canvas or background area
- **🎨 Rich Backgrounds**: Multiple background types including fit, stretch, solid colors, gradients, blur effects, and repeat patterns
- **📝 Advanced Text**: Word/character wrapping, custom fonts, colors, rotation, and outline effects
- **🖼️ Image Editing**: Resize, rotate, mirror, corner styles, brightness/contrast/blur controls, and filters
- **👁️ Visual Editing**: Intuitive overlays with 8-point resize handles and rotation guides
- **📤 Export Options**: High-quality export to JPG, PNG, and WEBP formats
- **🌙 Dark Mode**: Complete dark theme support

### 🚀 Quick Start Guide
1. **Choose Canvas Size**: Select "Auto" for automatic sizing or pick a specific social media format
2. **Upload Background**: Drag & drop your image onto the upload area or click to browse
3. **Customize Background**: Choose how your image displays (fit, stretch, blur, repeat, etc.)
4. **Add Content**: Drag & drop additional images or add text elements
5. **Edit Visually**: Use the intuitive overlay controls to move, resize, and rotate elements
6. **Export**: Download your creation in JPG, PNG, or WEBP format

### 📋 Requirements
- Node.js 18+ and npm 9+

### 🛠️ Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting and type checking
npm run lint
npm run typecheck
```

### 🎯 Architecture Overview
- **Adaptive Canvas**: Main canvas renders with dimensions based on selected aspect ratio or background image
- **Visual Editing**: Fixed overlays above canvas for manipulation without bitmap repainting
- **Performance**: Caching system for blur effects and processed images to avoid expensive recomputation
- **Modular Design**: `CanvasRenderer` class handles all drawing operations with configurable dimensions

---

## 📋 Development Roadmap

For information about planned features and future development, see [roadmap.md](./roadmap.md).

## 🛠️ Development Standards
- **TypeScript**: Strict typing with comprehensive interfaces
- **ESLint**: Enforced code quality rules (hooks, no `any`, prefer `const`)
- **TailwindCSS**: Utility-first styling with dark mode support
- **Component Architecture**: Reusable components and custom hooks for transforms

## 🤝 Contributing
1. Fork the repository and create a feature branch
2. Ensure `npm run lint` and `npm run typecheck` pass
3. Add tests for new functionality
4. Submit a PR with clear description and screenshots

## 📄 License
MIT License - feel free to adapt for your projects