import { useEffect, useRef, useState } from 'react';

import { ImageElement } from '../../lib/types';
import { ElementOverlay, BoxElement } from './ElementOverlay';
import { useImageTransform } from '../../hooks/useImageTransform';

interface VisualImageEditorProps {
    imageElements: ImageElement[];
    selectedImageId: string | null;
    onSelectImage: (id: string | null) => void;
    onUpdateImage: (id: string, updates: Partial<ImageElement>) => void;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    canvasWidth: number;
    canvasHeight: number;
}

export function VisualImageEditor({
    imageElements,
    selectedImageId,
    onSelectImage,
    onUpdateImage,
    canvasRef,
    canvasWidth,
    canvasHeight,
}: VisualImageEditorProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

    const { activeTransform, isDragging, selectedImage, handlers } = useImageTransform({
        imageElements,
        selectedImageId,
        onUpdateImage,
        canvasWidth,
        canvasHeight,
    });

    useEffect(() => {
        const updateRect = () => {
            if (canvasRef.current) setCanvasRect(canvasRef.current.getBoundingClientRect());
        };
        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [canvasRef]);

    useEffect(() => {
        if (!isDragging) {
            document.body.classList.remove('dragging');
            return;
        }
        document.body.classList.add('dragging');
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRect) return;
            if (activeTransform === 'move') handlers.move.onMove(e, canvasRect);
            else if (activeTransform === 'resize') handlers.resize.onMove(e, canvasRect);
            else if (activeTransform === 'rotate' && selectedImage) {
                const centerX = canvasRect.left + (selectedImage.x * canvasRect.width) / canvasWidth;
                const centerY = canvasRect.top + (selectedImage.y * canvasRect.height) / canvasHeight;
                handlers.rotate.onMove(e, centerX, centerY);
            }
        };
        const handleMouseUp = () => {
            if (activeTransform === 'move') handlers.move.onEnd();
            else if (activeTransform === 'resize') handlers.resize.onEnd();
            else if (activeTransform === 'rotate') handlers.rotate.onEnd();
            document.body.classList.remove('dragging');
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.classList.remove('dragging');
        };
    }, [isDragging, activeTransform, handlers, canvasRect, selectedImage, canvasWidth, canvasHeight]);

    if (!canvasRect) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed pointer-events-none"
            style={{ left: `${canvasRect.left}px`, top: `${canvasRect.top}px`, width: `${canvasRect.width}px`, height: `${canvasRect.height}px` }}
            onClick={() => onSelectImage(null)}
        >
            {imageElements.map((el) => (
                <ElementOverlay
                    key={el.id}
                    element={{ id: el.id, x: el.x, y: el.y, width: el.width, height: el.height, rotation: el.rotation } as BoxElement}
                    isSelected={selectedImageId === el.id}
                    canvasRect={canvasRect}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onSelect={() => onSelectImage(el.id)}
                    onMoveStart={(e) => handlers.move.onStart(e, el)}
                    onResizeStart={(e, dx, dy) => handlers.resize.onStart(e, el, dx, dy)}
                    onRotateStart={(e, cx, cy) => handlers.rotate.onStart(e, el, cx, cy)}
                />
            ))}
        </div>
    );
}


