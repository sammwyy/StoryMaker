export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number; // maximum container width for wrapping
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  outlineWidth: number;
  outlineColor: string;
  breakWords?: boolean; // toggle: wrap by characters when needed
}

export interface BackgroundSettings {
  type: 'fit' | 'stretch' | 'solid' | 'gradient' | 'blur' | 'repeat';
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  blurMode: 'fit' | 'stretch';
  // Effects reused with image editor
  effects?: {
    brightness?: number; // 0..2 (1 default)
    contrast?: number;   // 0..2 (1 default)
    blur?: number;       // px
    mirrorH?: boolean;
    mirrorV?: boolean;
    filter?: 'normal' | 'grayscale' | 'sepia' | 'negative';
  };
}

export interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  cornerStyle: 'square' | 'rounded' | 'circle' | 'custom';
  borderRadius: number; // px (used when cornerStyle is 'custom' or as default for 'rounded')
  outlineWidth: number;
  outlineColor: string;
  // Effects
  brightness: number; // 0..2
  contrast: number;   // 0..2
  blur: number;       // px
  mirrorH: boolean;
  mirrorV: boolean;
  filter: 'normal' | 'grayscale' | 'sepia' | 'negative';
}

export type Tab = 'background' | 'text' | 'images' | 'export';
export type ExportFormat = 'jpg' | 'png' | 'webp';

export interface AspectRatio {
  id: string;
  name: string;
  width: number;
  height: number;
  ratio: string;
  icon: string;
  category: 'social' | 'video' | 'photo' | 'custom';
}
