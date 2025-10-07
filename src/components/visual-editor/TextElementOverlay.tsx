import { useMemo, useRef } from 'react';

import { TextElement } from '../../lib/types';

interface TextElementOverlayProps {
    element: TextElement;
    isSelected: boolean;
    canvasRect: DOMRect;
    canvasWidth: number;
    canvasHeight: number;
    onSelect: () => void;
    onMoveStart: (e: React.MouseEvent) => void;
    onResizeStart: (e: React.MouseEvent, dirX: number, dirY: number) => void;
    onRotateStart: (e: React.MouseEvent, centerX: number, centerY: number) => void;
}

export function TextElementOverlay({
    element,
    isSelected,
    canvasRect,
    canvasWidth,
    canvasHeight,
    onSelect,
    onMoveStart,
    onResizeStart,
    onRotateStart,
}: TextElementOverlayProps) {
    const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);
    // Compute on-screen position from canvas coordinates
    const scaleX = canvasRect.width / canvasWidth;
    const scaleY = canvasRect.height / canvasHeight;

    const screenX = element.x * scaleX;
    const screenY = element.y * scaleY;
    const fontSize = element.fontSize * scaleY;

    // Measure real text width/height to align hitbox precisely
    const { textHeight, containerWidth } = useMemo<{ textHeight: number; containerWidth: number; lineHeight: number }>(() => {
        const lineHeight = fontSize * 1.2;
        const fallback = {
            textHeight: lineHeight,
            containerWidth: Math.max(100, (element.size || 700) * scaleX),
            lineHeight,
        };
        if (!element.text) return fallback;

        try {
            const canvas = measureCanvasRef.current || (measureCanvasRef.current = document.createElement('canvas'));
            const ctx = canvas.getContext('2d');
            if (!ctx) return fallback;
            ctx.font = `${fontSize}px ${element.fontFamily}`;
            const maxWidth = Math.max(100, (element.size || 700) * scaleX);
            const words = element.text.split(/\s+/);
            let current = '';
            const computedLines: string[] = [];
            for (let i = 0; i < words.length; i++) {
                const test = current ? current + ' ' + words[i] : words[i];
                const width = ctx.measureText(test).width;
                if (width > maxWidth && current) {
                    computedLines.push(current);
                    current = words[i];
                } else {
                    current = test;
                }
            }
            if (current) computedLines.push(current);
            const height = Math.max(lineHeight, computedLines.length * lineHeight);
            return { textHeight: height, lineHeight, containerWidth: maxWidth };
        } catch {
            return fallback;
        }
    }, [element.text, element.fontFamily, fontSize, element.size, scaleX]);

    // Rotation circle radius (stable, clamped based on content height and container width)
    const base = Math.max(containerWidth, textHeight);
    const circleRadius = Math.max(40, Math.min(200, base * 0.5));

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect();
    };

    const centerX = canvasRect.left + screenX;
    const centerY = canvasRect.top + screenY;

    // Compute positions for 8 resize handles (Maybe change color? idk)
    const resizeHandles = [
        { x: -1, y: -1, cursor: 'nwse-resize', color: 'bg-purple-500' }, // Top-left
        { x: 0, y: -1, cursor: 'ns-resize', color: 'bg-purple-500' },    // Top
        { x: 1, y: -1, cursor: 'nesw-resize', color: 'bg-purple-500' },  // Top-right
        { x: 1, y: 0, cursor: 'ew-resize', color: 'bg-purple-500' },     // Right
        { x: 1, y: 1, cursor: 'nwse-resize', color: 'bg-purple-500' },   // Bottom-right
        { x: 0, y: 1, cursor: 'ns-resize', color: 'bg-purple-500' },     // Bottom
        { x: -1, y: 1, cursor: 'nesw-resize', color: 'bg-purple-500' },  // Bottom-left
        { x: -1, y: 0, cursor: 'ew-resize', color: 'bg-purple-500' },    // Left
    ];

    return (
        <div
            className="absolute pointer-events-auto"
            style={{
                left: '0px',
                top: '0px',
                transform: `translate(${screenX}px, ${screenY}px)`,
            }}
            onClick={handleClick}
        >
            {/* Centered wrapper that rotates with the text */}
            <div
                className="absolute"
                style={{
                    left: '0',
                    top: '0',
                    transform: `rotate(${element.rotation}deg)`,
                    transformOrigin: '0 0'
                }}
            >
                {/* Clickable area centered on the render point */}
                <div
                    className={`cursor-move transition-all flex items-center justify-center ${isSelected
                        ? 'ring-2 ring-green-500 ring-opacity-50 bg-green-500 bg-opacity-5'
                        : 'hover:ring-2 hover:ring-green-300 hover:ring-opacity-50'
                        }`}
                    style={{
                        width: `${containerWidth}px`,
                        height: `${textHeight}px`,
                        position: 'absolute',
                        left: '0',
                        top: '0',
                        transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => {
                        if (isSelected) {
                            onMoveStart(e);
                        }
                    }}
                >
                    {/* Invisible selection area – text is drawn on canvas */}
                </div>

                {/* Transformation controls rotating with wrapper and centered to measured text */}
                {isSelected && (
                    <>
                        {/* Rotation circle (stable radius) */}
                        <div
                            className="absolute border-2 border-orange-500 rounded-full pointer-events-none opacity-80"
                            style={{
                                width: `${circleRadius * 2}px`,
                                height: `${circleRadius * 2}px`,
                                left: '0',
                                top: '0',
                                transform: 'translate(-50%, -50%)',
                            }}
                        />

                        {/* Rotation handle at the top of the circle (fixed distance) */}
                        <div
                            className="absolute w-4 h-4 bg-orange-500 border-2 border-white dark:border-dark-900 rounded-full cursor-grab hover:scale-125 transition-transform active:cursor-grabbing shadow-lg z-20"
                            style={{
                                left: '0',
                                top: '0',
                                transform: `translate(-50%, -50%) translateY(-${circleRadius}px)`,
                            }}
                            onMouseDown={(e) => {
                                onRotateStart(e, centerX, centerY);
                            }}
                            title="Rotate"
                        />

                        {/* 8 resize handles */}
                        {resizeHandles.map((handle, index) => {
                            const halfWidth = containerWidth / 2;
                            const halfHeight = textHeight / 2;

                            return (
                                <div
                                    key={index}
                                    className={`absolute w-3 h-3 ${handle.color} border-2 border-white dark:border-dark-900 rounded-full hover:scale-150 transition-transform shadow-lg z-10`}
                                    style={{
                                        left: '0',
                                        top: '0',
                                        transform: `translate(-50%, -50%) translate(${handle.x * halfWidth}px, ${handle.y * halfHeight}px)`,
                                        cursor: handle.cursor,
                                    }}
                                    onMouseDown={(e) => {
                                        onResizeStart(e, handle.x, handle.y);
                                    }}
                                    title="Resize"
                                />
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}
