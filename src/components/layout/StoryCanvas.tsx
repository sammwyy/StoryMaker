import { useRef, useEffect, useMemo, useState } from 'react';

import { TextElement, BackgroundSettings, ImageElement } from '../../lib/types';

interface StoryCanvasProps {
  image: HTMLImageElement | null;
  backgroundSettings: BackgroundSettings;
  textElements: TextElement[];
  imageElements?: ImageElement[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

export function StoryCanvas({ image, backgroundSettings, textElements, imageElements = [], canvasRef }: StoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const blurCacheRef = useRef<{ key: string | null; canvas: HTMLCanvasElement | null }>({ key: null, canvas: null });
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const imageEffectCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const [imagesVersion, setImagesVersion] = useState(0);

  // Memoize background serialization to avoid unnecessary recalculations
  const backgroundKey = useMemo(() => JSON.stringify(backgroundSettings), [backgroundSettings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Cancel any pending animation
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }

    // Use requestAnimationFrame to batch redraws
    animationFrameId.current = requestAnimationFrame(() => {
      // Only set canvas size if necessary
      if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (image) {
        drawBackground(ctx, image, backgroundSettings, blurCacheRef);
      }

      // Draw embedded images
      for (const el of imageElements) {
        const baseImg = imageCacheRef.current.get(el.src);
        if (baseImg) {
          const processed = getProcessedImageCanvas(el, baseImg, imageEffectCacheRef);
          drawImageElement(ctx, el, processed);
        } else {
          const img = new Image();
          img.onload = () => {
            imageCacheRef.current.set(el.src, img);
            setImagesVersion((v: number) => v + 1);
          };
          img.src = el.src;
        }
      }

      // Draw texts
      textElements.forEach(textEl => {
        drawText(ctx, textEl);
      });
    });

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, backgroundKey, textElements, imageElements, imagesVersion]);

  return (
    <div ref={containerRef} className="flex items-center justify-center h-full p-8">
      <div className="relative" style={{ aspectRatio: '9/16', height: '100%', maxHeight: '85vh' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg shadow-2xl"
          style={{ imageRendering: 'auto' }}
        />
      </div>
    </div>
  );
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  settings: BackgroundSettings,
  blurCacheRef?: React.RefObject<{ key: string | null; canvas: HTMLCanvasElement | null }>
) {
  const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
  const imageAspect = image.width / image.height;

  switch (settings.type) {
    case 'fit': {
      // Cover mode: scale to cover the entire canvas
      let drawWidth, drawHeight, x, y;
      if (imageAspect > canvasAspect) {
        // Wider image: fit by height
        drawHeight = CANVAS_HEIGHT;
        drawWidth = image.width * (CANVAS_HEIGHT / image.height);
        x = (CANVAS_WIDTH - drawWidth) / 2;
        y = 0;
      } else {
        // Taller image: fit by width
        drawWidth = CANVAS_WIDTH;
        drawHeight = image.height * (CANVAS_WIDTH / image.width);
        x = 0;
        y = (CANVAS_HEIGHT - drawHeight) / 2;
      }
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
      break;
    }

    case 'stretch': {
      ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      break;
    }

    case 'solid': {
      ctx.fillStyle = settings.solidColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      let drawWidth, drawHeight, x, y;
      if (imageAspect > canvasAspect) {
        drawWidth = CANVAS_WIDTH;
        drawHeight = image.height * (CANVAS_WIDTH / image.width);
        x = 0;
        y = (CANVAS_HEIGHT - drawHeight) / 2;
      } else {
        drawHeight = CANVAS_HEIGHT;
        drawWidth = image.width * (CANVAS_HEIGHT / image.height);
        x = (CANVAS_WIDTH - drawWidth) / 2;
        y = 0;
      }
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
      break;
    }

    case 'gradient': {
      const angle = (settings.gradientAngle * Math.PI) / 180;
      const x1 = CANVAS_WIDTH / 2 + (Math.cos(angle) * CANVAS_WIDTH) / 2;
      const y1 = CANVAS_HEIGHT / 2 + (Math.sin(angle) * CANVAS_HEIGHT) / 2;
      const x2 = CANVAS_WIDTH / 2 - (Math.cos(angle) * CANVAS_WIDTH) / 2;
      const y2 = CANVAS_HEIGHT / 2 - (Math.sin(angle) * CANVAS_HEIGHT) / 2;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, settings.gradientStart);
      gradient.addColorStop(1, settings.gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      let drawWidth, drawHeight, x, y;
      if (imageAspect > canvasAspect) {
        drawWidth = CANVAS_WIDTH;
        drawHeight = image.height * (CANVAS_WIDTH / image.width);
        x = 0;
        y = (CANVAS_HEIGHT - drawHeight) / 2;
      } else {
        drawHeight = CANVAS_HEIGHT;
        drawWidth = image.width * (CANVAS_HEIGHT / image.height);
        x = (CANVAS_WIDTH - drawWidth) / 2;
        y = 0;
      }
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
      break;
    }

    case 'blur': {
      // Cache blurred background + main image in an offscreen canvas
      const cacheKey = JSON.stringify({
        type: settings.type,
        blurMode: settings.blurMode,
        iw: image.width,
        ih: image.height,
        cw: CANVAS_WIDTH,
        ch: CANVAS_HEIGHT,
      });

      if (!blurCacheRef || !blurCacheRef.current || !blurCacheRef.current.canvas || blurCacheRef.current.key !== cacheKey) {
        const off = document.createElement('canvas');
        off.width = CANVAS_WIDTH;
        off.height = CANVAS_HEIGHT;
        const octx = off.getContext('2d');
        if (octx) {
          // Blurred background layer
          octx.save();
          octx.filter = 'blur(40px)';
          octx.imageSmoothingEnabled = true;
          octx.imageSmoothingQuality = 'low';

          if (settings.blurMode === 'stretch') {
            octx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          } else {
            let bgWidth, bgHeight, bgX, bgY;
            if (imageAspect > canvasAspect) {
              bgHeight = CANVAS_HEIGHT;
              bgWidth = image.width * (CANVAS_HEIGHT / image.height);
              bgX = (CANVAS_WIDTH - bgWidth) / 2;
              bgY = 0;
            } else {
              bgWidth = CANVAS_WIDTH;
              bgHeight = image.height * (CANVAS_WIDTH / image.width);
              bgX = 0;
              bgY = (CANVAS_HEIGHT - bgHeight) / 2;
            }
            octx.drawImage(image, bgX, bgY, bgWidth, bgHeight);
          }
          octx.restore();

          // Main image on top (contain)
          let drawWidth, drawHeight, x, y;
          if (imageAspect > canvasAspect) {
            drawWidth = CANVAS_WIDTH;
            drawHeight = image.height * (CANVAS_WIDTH / image.width);
            x = 0;
            y = (CANVAS_HEIGHT - drawHeight) / 2;
          } else {
            drawHeight = CANVAS_HEIGHT;
            drawWidth = image.width * (CANVAS_HEIGHT / image.height);
            x = (CANVAS_WIDTH - drawWidth) / 2;
            y = 0;
          }
          octx.drawImage(image, x, y, drawWidth, drawHeight);

          if (blurCacheRef && blurCacheRef.current) {
            blurCacheRef.current.key = cacheKey;
            blurCacheRef.current.canvas = off;
          }
        }
      }

      if (blurCacheRef && blurCacheRef.current && blurCacheRef.current.canvas) {
        ctx.drawImage(blurCacheRef.current.canvas, 0, 0);
      }
      break;
    }
  }
}

function drawImageElement(ctx: CanvasRenderingContext2D, el: ImageElement, img: HTMLImageElement | HTMLCanvasElement) {
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.rotate((el.rotation * Math.PI) / 180);
  if (el.mirrorH || el.mirrorV) ctx.scale(el.mirrorH ? -1 : 1, el.mirrorV ? -1 : 1);

  const halfW = el.width / 2;
  const halfH = el.height / 2;

  // Clip shape
  ctx.beginPath();
  if (el.cornerStyle === 'circle') {
    const r = Math.min(halfW, halfH);
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  } else if (el.cornerStyle === 'rounded') {
    roundedRectPath(ctx, -halfW, -halfH, el.width, el.height, el.borderRadius || Math.min(el.width, el.height) / 10);
  } else if (el.cornerStyle === 'custom') {
    roundedRectPath(ctx, -halfW, -halfH, el.width, el.height, el.borderRadius);
  } else {
    ctx.rect(-halfW, -halfH, el.width, el.height);
  }
  ctx.clip();

  // Effects
  const parts: string[] = [`brightness(${el.brightness})`, `contrast(${el.contrast})`];
  if (el.blur > 0) parts.push(`blur(${el.blur}px)`);
  if (el.filter === 'grayscale') parts.push('grayscale(1)');
  if (el.filter === 'sepia') parts.push('sepia(1)');
  if (el.filter === 'negative') parts.push('invert(1)');
  ctx.filter = parts.join(' ');

  ctx.drawImage(img, -halfW, -halfH, el.width, el.height);

  ctx.restore();

  // Outline
  if (el.outlineWidth > 0) {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate((el.rotation * Math.PI) / 180);
    if (el.mirrorH || el.mirrorV) ctx.scale(el.mirrorH ? -1 : 1, el.mirrorV ? -1 : 1);
    ctx.lineWidth = el.outlineWidth;
    ctx.strokeStyle = el.outlineColor;
    ctx.beginPath();
    if (el.cornerStyle === 'circle') {
      const r = Math.min(el.width, el.height) / 2;
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    } else if (el.cornerStyle === 'rounded') {
      roundedRectPath(ctx, -el.width / 2, -el.height / 2, el.width, el.height, el.borderRadius || Math.min(el.width, el.height) / 10);
    } else if (el.cornerStyle === 'custom') {
      roundedRectPath(ctx, -el.width / 2, -el.height / 2, el.width, el.height, el.borderRadius);
    } else {
      ctx.rect(-el.width / 2, -el.height / 2, el.width, el.height);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function effectKey(el: ImageElement) {
  return JSON.stringify({ s: el.src, w: el.width, h: el.height, b: el.brightness, c: el.contrast, bl: el.blur, fh: el.mirrorH, fv: el.mirrorV, f: el.filter });
}

function getProcessedImageCanvas(el: ImageElement, img: HTMLImageElement, cacheRef: React.RefObject<Map<string, HTMLCanvasElement>>) {
  const key = effectKey(el);
  const cached = cacheRef.current?.get(key);
  if (cached) return cached;
  const off = document.createElement('canvas');
  off.width = el.width;
  off.height = el.height;
  const octx = off.getContext('2d');
  if (!octx) return off;
  octx.save();
  const parts: string[] = [`brightness(${el.brightness})`, `contrast(${el.contrast})`];
  if (el.blur > 0) parts.push(`blur(${el.blur}px)`);
  if (el.filter === 'grayscale') parts.push('grayscale(1)');
  if (el.filter === 'sepia') parts.push('sepia(1)');
  if (el.filter === 'negative') parts.push('invert(1)');
  octx.filter = parts.join(' ');
  if (el.mirrorH || el.mirrorV) {
    octx.translate(off.width / 2, off.height / 2);
    octx.scale(el.mirrorH ? -1 : 1, el.mirrorV ? -1 : 1);
    octx.drawImage(img, -off.width / 2, -off.height / 2, off.width, off.height);
  } else {
    octx.drawImage(img, 0, 0, off.width, off.height);
  }
  octx.restore();
  cacheRef.current?.set(key, off);
  return off;
}

function wrapByWords(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const candidate = current ? current + ' ' + words[i] : words[i];
    const width = ctx.measureText(candidate).width;
    if (width > maxWidth && current) {
      lines.push(current);
      current = words[i];
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrapByChars(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const candidate = current + text[i];
    const width = ctx.measureText(candidate).width;
    if (width > maxWidth && current) {
      lines.push(current);
      current = text[i];
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawText(ctx: CanvasRenderingContext2D, textEl: TextElement) {
  if (!textEl.text) return; // Skip empty texts

  ctx.save();

  ctx.translate(textEl.x, textEl.y);
  ctx.rotate((textEl.rotation * Math.PI) / 180);

  ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Improve text rendering quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const maxWidth = Math.max(100, textEl.size || 700);
  const lineHeight = textEl.fontSize * 1.2;
  const lines = (textEl.breakWords ? wrapByChars : wrapByWords)(ctx, textEl.text, maxWidth);
  const blockHeight = lines.length * lineHeight;
  let y = -blockHeight / 2 + lineHeight / 2;

  ctx.fillStyle = textEl.color;
  if (textEl.outlineWidth > 0) {
    ctx.strokeStyle = textEl.outlineColor;
    ctx.lineWidth = textEl.outlineWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
  }

  for (const line of lines) {
    if (textEl.outlineWidth > 0) {
      ctx.strokeText(line, 0, y);
    }
    ctx.fillText(line, 0, y);
    y += lineHeight;
  }

  ctx.restore();
}
