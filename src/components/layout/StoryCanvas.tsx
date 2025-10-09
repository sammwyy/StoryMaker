import { useRef, useEffect, useMemo, useState, useCallback } from 'react';

import { TextElement, BackgroundSettings, ImageElement } from '../../lib/types';
import { canvasRenderer } from '../../lib/renderer';

interface StoryCanvasProps {
  image: HTMLImageElement | null;
  backgroundSettings: BackgroundSettings;
  textElements: TextElement[];
  imageElements?: ImageElement[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onAddImage?: (file: File) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export function StoryCanvas({ image, backgroundSettings, textElements, imageElements = [], canvasRef, onAddImage, canvasWidth, canvasHeight }: StoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagesVersion, setImagesVersion] = useState(0);

  // Memoize background serialization to avoid unnecessary recalculations
  const backgroundKey = useMemo(() => JSON.stringify(backgroundSettings), [backgroundSettings]);

  // Callback for when images are loaded
  const handleImageLoad = useCallback(() => {
    setImagesVersion(prev => prev + 1);
  }, []);

  // Function to update canvas display size
  const updateCanvasDisplaySize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Update canvas internal dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Calculate responsive display size to fill container while maintaining aspect ratio
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Account for padding (p-8 = 32px on each side)
    const padding = 32;
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - (padding * 2);

    // Limit to viewport height to prevent page scroll (more conservative)
    const viewportHeight = window.innerHeight;
    const maxHeight = Math.min(availableHeight, viewportHeight - 150); // 150px buffer for header/nav/sidebar

    const aspectRatio = canvasWidth / canvasHeight;

    let displayWidth = maxHeight * aspectRatio;
    let displayHeight = maxHeight;

    // If width exceeds available space, scale down
    if (displayWidth > availableWidth) {
      displayWidth = availableWidth;
      displayHeight = availableWidth / aspectRatio;
    }

    // Final safety check - ensure it doesn't exceed viewport
    if (displayHeight > viewportHeight - 150) {
      displayHeight = viewportHeight - 150;
      displayWidth = displayHeight * aspectRatio;
    }

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
  }, [canvasWidth, canvasHeight, canvasRef]);

  // Update canvas dimensions when they change
  useEffect(() => {
    updateCanvasDisplaySize();
  }, [updateCanvasDisplaySize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updateCanvasDisplaySize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCanvasDisplaySize]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the container entirely
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!onAddImage) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      onAddImage(imageFile);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cancel any pending animation
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }

    // Use requestAnimationFrame to batch redraws
    animationFrameId.current = requestAnimationFrame(() => {
      canvasRenderer.render(canvas, image, backgroundSettings, textElements, imageElements, handleImageLoad);
    });

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, backgroundKey, textElements, imageElements, imagesVersion, canvasWidth, canvasHeight]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center h-full p-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className={`rounded-lg shadow-2xl transition-all duration-200 ${isDragOver ? 'ring-4 ring-sky-500 ring-opacity-50' : ''
            }`}
          style={{ imageRendering: 'auto' }}
        />

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-sky-500/20 border-4 border-dashed border-sky-500 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-dark-900 px-6 py-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-lg font-semibold text-sky-600 dark:text-sky-400">
                Drop image here
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Add as image element
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
