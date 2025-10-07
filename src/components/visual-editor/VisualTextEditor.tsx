import { useEffect, useRef, useState } from 'react';

import { TextElement } from '../../lib/types';
import { useTextTransform } from '../../hooks/useTextTransform';
import { TextElementOverlay } from './TextElementOverlay';

interface VisualTextEditorProps {
    textElements: TextElement[];
    selectedTextId: string | null;
    onSelectText: (id: string | null) => void;
    onUpdateText: (id: string, updates: Partial<TextElement>) => void;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    canvasWidth: number;
    canvasHeight: number;
}

export function VisualTextEditor({
    textElements,
    selectedTextId,
    onSelectText,
    onUpdateText,
    canvasRef,
    canvasWidth,
    canvasHeight,
}: VisualTextEditorProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

    const {
        activeTransform,
        isDragging,
        selectedText,
        handlers,
    } = useTextTransform({
        textElements,
        selectedTextId,
        onUpdateText,
        canvasWidth,
        canvasHeight,
    });

    // Keep canvas bounding rect in sync with viewport
    useEffect(() => {
        const updateRect = () => {
            if (canvasRef.current) {
                setCanvasRect(canvasRef.current.getBoundingClientRect());
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);

        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [canvasRef]);

    // Global mouse events during transforms
    useEffect(() => {
        if (!isDragging) {
            document.body.classList.remove('dragging');
            return;
        }

        document.body.classList.add('dragging');

        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRect) return;

            if (activeTransform === 'move') {
                handlers.move.onMove(e, canvasRect);
            } else if (activeTransform === 'resize') {
                handlers.resize.onMove(e, canvasRect);
            } else if (activeTransform === 'rotate' && selectedText) {
                const centerX = canvasRect.left + (selectedText.x * canvasRect.width) / canvasWidth;
                const centerY = canvasRect.top + (selectedText.y * canvasRect.height) / canvasHeight;
                handlers.rotate.onMove(e, centerX, centerY);
            }
        };

        const handleMouseUp = () => {
            if (activeTransform === 'move') {
                handlers.move.onEnd();
            } else if (activeTransform === 'resize') {
                handlers.resize.onEnd();
            } else if (activeTransform === 'rotate') {
                handlers.rotate.onEnd();
            }
            document.body.classList.remove('dragging');
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.classList.remove('dragging');
        };
    }, [isDragging, activeTransform, handlers, canvasRect, selectedText, canvasWidth, canvasHeight]);

    if (!canvasRect) return null;

    return (
        <>
            {/* Overlay sobre el canvas */}
            <div
                ref={overlayRef}
                className="fixed pointer-events-none"
                style={{
                    left: `${canvasRect.left}px`,
                    top: `${canvasRect.top}px`,
                    width: `${canvasRect.width}px`,
                    height: `${canvasRect.height}px`,
                }}
                onClick={() => onSelectText(null)}
            >
                {textElements.map((element) => (
                    <TextElementOverlay
                        key={element.id}
                        element={element}
                        isSelected={selectedTextId === element.id}
                        canvasRect={canvasRect}
                        canvasWidth={canvasWidth}
                        canvasHeight={canvasHeight}
                        onSelect={() => onSelectText(element.id)}
                        onMoveStart={(e) => handlers.move.onStart(e, element)}
                        onResizeStart={(e, dirX, dirY) => handlers.resize.onStart(e, element, dirX, dirY)}
                        onRotateStart={(e, cx, cy) => handlers.rotate.onStart(e, element, cx, cy)}
                    />
                ))}
            </div>
        </>
    );
}

