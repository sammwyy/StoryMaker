import { TextElement, BackgroundSettings, ImageElement } from './types';

// Default canvas dimensions
export const DEFAULT_CANVAS_WIDTH = 1080;
export const DEFAULT_CANVAS_HEIGHT = 1920;

// Cache types
export interface BlurCache {
    key: string | null;
    canvas: HTMLCanvasElement | null;
}

export interface ImageCache {
    baseImages: Map<string, HTMLImageElement>;
    processedImages: Map<string, HTMLCanvasElement>;
}

// Canvas dimensions interface
export interface CanvasDimensions {
    width: number;
    height: number;
}

// Main renderer class
export class CanvasRenderer {
    private imageCache: ImageCache;
    private blurCache: BlurCache;
    private canvasDimensions: CanvasDimensions;

    constructor(width: number = DEFAULT_CANVAS_WIDTH, height: number = DEFAULT_CANVAS_HEIGHT) {
        this.imageCache = {
            baseImages: new Map(),
            processedImages: new Map(),
        };
        this.blurCache = {
            key: null,
            canvas: null,
        };
        this.canvasDimensions = { width, height };
    }

    // Main render function
    render(
        canvas: HTMLCanvasElement,
        image: HTMLImageElement | null,
        backgroundSettings: BackgroundSettings,
        textElements: TextElement[],
        imageElements: ImageElement[],
        onImageLoad?: () => void
    ): void {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Set canvas size
        if (canvas.width !== this.canvasDimensions.width || canvas.height !== this.canvasDimensions.height) {
            canvas.width = this.canvasDimensions.width;
            canvas.height = this.canvasDimensions.height;
        }

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);

        // Draw background
        if (image) {
            this.drawBackground(ctx, image, backgroundSettings);
        }

        // Draw image elements
        for (const el of imageElements) {
            const baseImg = this.imageCache.baseImages.get(el.src);
            if (baseImg) {
                const processed = this.getProcessedImageCanvas(el, baseImg);
                this.drawImageElement(ctx, el, processed);
            } else {
                const img = new Image();
                img.onload = () => {
                    this.imageCache.baseImages.set(el.src, img);
                    // Trigger re-render by calling the callback
                    if (onImageLoad) {
                        onImageLoad();
                    }
                };
                img.src = el.src;
            }
        }

        // Draw text elements
        textElements.forEach(textEl => {
            this.drawText(ctx, textEl);
        });
    }

    // Background drawing
    private drawBackground(
        ctx: CanvasRenderingContext2D,
        image: HTMLImageElement,
        settings: BackgroundSettings
    ): void {
        const canvasAspect = this.canvasDimensions.width / this.canvasDimensions.height;
        const imageAspect = image.width / image.height;

        switch (settings.type) {
            case 'fit': {
                let drawWidth, drawHeight, x, y;
                if (imageAspect > canvasAspect) {
                    drawHeight = this.canvasDimensions.height;
                    drawWidth = image.width * (this.canvasDimensions.height / image.height);
                    x = (this.canvasDimensions.width - drawWidth) / 2;
                    y = 0;
                } else {
                    drawWidth = this.canvasDimensions.width;
                    drawHeight = image.height * (this.canvasDimensions.width / image.width);
                    x = 0;
                    y = (this.canvasDimensions.height - drawHeight) / 2;
                }
                ctx.drawImage(image, x, y, drawWidth, drawHeight);
                break;
            }

            case 'stretch': {
                ctx.drawImage(image, 0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
                break;
            }

            case 'solid': {
                ctx.fillStyle = settings.solidColor;
                ctx.fillRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);

                let drawWidth, drawHeight, x, y;
                if (imageAspect > canvasAspect) {
                    drawWidth = this.canvasDimensions.width;
                    drawHeight = image.height * (this.canvasDimensions.width / image.width);
                    x = 0;
                    y = (this.canvasDimensions.height - drawHeight) / 2;
                } else {
                    drawHeight = this.canvasDimensions.height;
                    drawWidth = image.width * (this.canvasDimensions.height / image.height);
                    x = (this.canvasDimensions.width - drawWidth) / 2;
                    y = 0;
                }
                ctx.drawImage(image, x, y, drawWidth, drawHeight);
                break;
            }

            case 'gradient': {
                const angle = (settings.gradientAngle * Math.PI) / 180;
                const x1 = this.canvasDimensions.width / 2 + (Math.cos(angle) * this.canvasDimensions.width) / 2;
                const y1 = this.canvasDimensions.height / 2 + (Math.sin(angle) * this.canvasDimensions.height) / 2;
                const x2 = this.canvasDimensions.width / 2 - (Math.cos(angle) * this.canvasDimensions.width) / 2;
                const y2 = this.canvasDimensions.height / 2 - (Math.sin(angle) * this.canvasDimensions.height) / 2;

                const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                gradient.addColorStop(0, settings.gradientStart);
                gradient.addColorStop(1, settings.gradientEnd);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);

                let drawWidth, drawHeight, x, y;
                if (imageAspect > canvasAspect) {
                    drawWidth = this.canvasDimensions.width;
                    drawHeight = image.height * (this.canvasDimensions.width / image.width);
                    x = 0;
                    y = (this.canvasDimensions.height - drawHeight) / 2;
                } else {
                    drawHeight = this.canvasDimensions.height;
                    drawWidth = image.width * (this.canvasDimensions.height / image.height);
                    x = (this.canvasDimensions.width - drawWidth) / 2;
                    y = 0;
                }
                ctx.drawImage(image, x, y, drawWidth, drawHeight);
                break;
            }

            case 'blur': {
                this.drawBlurBackground(ctx, image, settings, canvasAspect, imageAspect);
                break;
            }

            case 'repeat': {
                // Calculate how many tiles we need to fill the canvas
                const tileWidth = image.width;
                const tileHeight = image.height;

                const tilesX = Math.ceil(this.canvasDimensions.width / tileWidth);
                const tilesY = Math.ceil(this.canvasDimensions.height / tileHeight);

                // Draw repeated tiles
                for (let x = 0; x < tilesX; x++) {
                    for (let y = 0; y < tilesY; y++) {
                        ctx.drawImage(
                            image,
                            x * tileWidth,
                            y * tileHeight,
                            tileWidth,
                            tileHeight
                        );
                    }
                }
                break;
            }
        }
    }

    // Blur background drawing
    private drawBlurBackground(
        ctx: CanvasRenderingContext2D,
        image: HTMLImageElement,
        settings: BackgroundSettings,
        canvasAspect: number,
        imageAspect: number
    ): void {
        const cacheKey = JSON.stringify({
            type: settings.type,
            blurMode: settings.blurMode,
            iw: image.width,
            ih: image.height,
            cw: this.canvasDimensions.width,
            ch: this.canvasDimensions.height,
        });

        if (!this.blurCache.canvas || this.blurCache.key !== cacheKey) {
            const off = document.createElement('canvas');
            off.width = this.canvasDimensions.width;
            off.height = this.canvasDimensions.height;
            const octx = off.getContext('2d');
            if (octx) {
                // Blurred background layer
                octx.save();
                octx.filter = 'blur(40px)';
                octx.imageSmoothingEnabled = true;
                octx.imageSmoothingQuality = 'low';

                if (settings.blurMode === 'stretch') {
                    octx.drawImage(image, 0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
                } else {
                    let bgWidth, bgHeight, bgX, bgY;
                    if (imageAspect > canvasAspect) {
                        bgHeight = this.canvasDimensions.height;
                        bgWidth = image.width * (this.canvasDimensions.height / image.height);
                        bgX = (this.canvasDimensions.width - bgWidth) / 2;
                        bgY = 0;
                    } else {
                        bgWidth = this.canvasDimensions.width;
                        bgHeight = image.height * (this.canvasDimensions.width / image.width);
                        bgX = 0;
                        bgY = (this.canvasDimensions.height - bgHeight) / 2;
                    }
                    octx.drawImage(image, bgX, bgY, bgWidth, bgHeight);
                }
                octx.restore();

                // Main image on top (contain)
                let drawWidth, drawHeight, x, y;
                if (imageAspect > canvasAspect) {
                    drawWidth = this.canvasDimensions.width;
                    drawHeight = image.height * (this.canvasDimensions.width / image.width);
                    x = 0;
                    y = (this.canvasDimensions.height - drawHeight) / 2;
                } else {
                    drawHeight = this.canvasDimensions.height;
                    drawWidth = image.width * (this.canvasDimensions.height / image.height);
                    x = (this.canvasDimensions.width - drawWidth) / 2;
                    y = 0;
                }
                octx.drawImage(image, x, y, drawWidth, drawHeight);

                this.blurCache.key = cacheKey;
                this.blurCache.canvas = off;
            }
        }

        if (this.blurCache.canvas) {
            ctx.drawImage(this.blurCache.canvas, 0, 0);
        }
    }

    // Image element drawing
    private drawImageElement(
        ctx: CanvasRenderingContext2D,
        el: ImageElement,
        img: HTMLImageElement | HTMLCanvasElement
    ): void {
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate((el.rotation * Math.PI) / 180);

        // Only apply mirror if img is a raw HTMLImageElement (not a processed canvas)
        if (img instanceof HTMLImageElement && (el.mirrorH || el.mirrorV)) {
            ctx.scale(el.mirrorH ? -1 : 1, el.mirrorV ? -1 : 1);
        }

        const halfW = el.width / 2;
        const halfH = el.height / 2;

        // Clip shape
        ctx.beginPath();
        if (el.cornerStyle === 'circle') {
            const r = Math.min(halfW, halfH);
            ctx.arc(0, 0, r, 0, Math.PI * 2);
        } else if (el.cornerStyle === 'rounded') {
            this.roundedRectPath(ctx, -halfW, -halfH, el.width, el.height, el.borderRadius || Math.min(el.width, el.height) / 10);
        } else if (el.cornerStyle === 'custom') {
            this.roundedRectPath(ctx, -halfW, -halfH, el.width, el.height, el.borderRadius);
        } else {
            ctx.rect(-halfW, -halfH, el.width, el.height);
        }
        ctx.clip();

        // Apply effects
        if (img instanceof HTMLImageElement) {
            const parts: string[] = [`brightness(${el.brightness})`, `contrast(${el.contrast})`];
            if (el.blur > 0) parts.push(`blur(${el.blur}px)`);
            if (el.filter === 'grayscale') parts.push('grayscale(1)');
            if (el.filter === 'sepia') parts.push('sepia(1)');
            if (el.filter === 'negative') parts.push('invert(1)');
            ctx.filter = parts.join(' ');
        }

        ctx.drawImage(img, -halfW, -halfH, el.width, el.height);
        ctx.restore();

        // Outline
        if (el.outlineWidth > 0) {
            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.rotate((el.rotation * Math.PI) / 180);

            // Only apply mirror if img is a raw HTMLImageElement (not a processed canvas)
            if (img instanceof HTMLImageElement && (el.mirrorH || el.mirrorV)) {
                ctx.scale(el.mirrorH ? -1 : 1, el.mirrorV ? -1 : 1);
            }

            ctx.lineWidth = el.outlineWidth;
            ctx.strokeStyle = el.outlineColor;
            ctx.beginPath();
            if (el.cornerStyle === 'circle') {
                const r = Math.min(el.width, el.height) / 2;
                ctx.arc(0, 0, r, 0, Math.PI * 2);
            } else if (el.cornerStyle === 'rounded') {
                this.roundedRectPath(ctx, -el.width / 2, -el.height / 2, el.width, el.height, el.borderRadius || Math.min(el.width, el.height) / 10);
            } else if (el.cornerStyle === 'custom') {
                this.roundedRectPath(ctx, -el.width / 2, -el.height / 2, el.width, el.height, el.borderRadius);
            } else {
                ctx.rect(-el.width / 2, -el.height / 2, el.width, el.height);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    // Text drawing
    private drawText(ctx: CanvasRenderingContext2D, textEl: TextElement): void {
        if (!textEl.text) return;

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
        const lines = textEl.breakWords ? this.wrapByChars(ctx, textEl.text, maxWidth) : this.wrapByWords(ctx, textEl.text, maxWidth);
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

    // Image processing
    private getProcessedImageCanvas(el: ImageElement, img: HTMLImageElement): HTMLCanvasElement {
        const key = this.effectKey(el);
        const cached = this.imageCache.processedImages.get(key);
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

        this.imageCache.processedImages.set(key, off);
        return off;
    }

    // Utility functions
    private effectKey(el: ImageElement): string {
        return JSON.stringify({
            s: el.src,
            w: el.width,
            h: el.height,
            b: el.brightness,
            c: el.contrast,
            bl: el.blur,
            fh: el.mirrorH,
            fv: el.mirrorV,
            f: el.filter,
        });
    }

    private roundedRectPath(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
    ): void {
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

    private wrapByWords(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

    private wrapByChars(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

    // Public methods for external use
    public setCanvasDimensions(width: number, height: number): void {
        this.canvasDimensions = { width, height };
        this.clearCache(); // Clear cache when dimensions change
    }

    public getCanvasDimensions(): CanvasDimensions {
        return { ...this.canvasDimensions };
    }

    public clearCache(): void {
        this.imageCache.baseImages.clear();
        this.imageCache.processedImages.clear();
        this.blurCache.key = null;
        this.blurCache.canvas = null;
    }

    public getImageCache(): ImageCache {
        return this.imageCache;
    }
}

// Export a singleton instance
export const canvasRenderer = new CanvasRenderer();
