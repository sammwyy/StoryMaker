import { useState, useCallback, useRef } from 'react';

import { TextElement } from '../lib/types';

export type TransformType = 'move' | 'resize' | 'rotate';

interface UseTextTransformProps {
    textElements: TextElement[];
    selectedTextId: string | null;
    onUpdateText: (id: string, updates: Partial<TextElement>) => void;
    canvasWidth: number;
    canvasHeight: number;
}

export function useTextTransform({
    textElements,
    selectedTextId,
    onUpdateText,
    canvasWidth,
    canvasHeight,
}: UseTextTransformProps) {
    const [activeTransform, setActiveTransform] = useState<TransformType | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number; elementX: number; elementY: number } | null>(null);
    const resizeStartRef = useRef<{
        x: number;
        y: number;
        fontSize: number;
        elementX: number;
        elementY: number;
        direction: { x: number; y: number };
    } | null>(null);
    const rotateStartRef = useRef<{ angle: number; rotation: number } | null>(null);

    const selectedText = textElements.find((t) => t.id === selectedTextId);

    // Move
    const handleMoveStart = useCallback((e: React.MouseEvent, element: TextElement) => {
        setActiveTransform('move');
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            elementX: element.x,
            elementY: element.y,
        };
    }, []);

    const handleMoveMove = useCallback((e: MouseEvent, canvasRect: DOMRect) => {
        if (!isDragging || !dragStartRef.current || !selectedText) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        // Scale deltas from screen space into canvas space
        const scaleX = canvasWidth / canvasRect.width;
        const scaleY = canvasHeight / canvasRect.height;

        const newX = Math.max(0, Math.min(canvasWidth, dragStartRef.current.elementX + dx * scaleX));
        const newY = Math.max(0, Math.min(canvasHeight, dragStartRef.current.elementY + dy * scaleY));

        onUpdateText(selectedText.id, { x: newX, y: newY });
    }, [isDragging, selectedText, onUpdateText, canvasWidth, canvasHeight]);

    const handleMoveEnd = useCallback(() => {
        setIsDragging(false);
        setActiveTransform(null);
        dragStartRef.current = null;
    }, []);

    // Resize (directional)
    const handleResizeStart = useCallback((e: React.MouseEvent, element: TextElement, directionX: number, directionY: number) => {
        e.stopPropagation();
        setActiveTransform('resize');
        setIsDragging(true);
        resizeStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            fontSize: element.fontSize,
            elementX: element.x,
            elementY: element.y,
            direction: { x: directionX, y: directionY },
        };
    }, []);

    const handleResizeMove = useCallback((e: MouseEvent, canvasRect: DOMRect) => {
        if (!isDragging || !resizeStartRef.current || !selectedText) return;

        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;

        const scaleX = canvasWidth / canvasRect.width;
        const scaleY = canvasHeight / canvasRect.height;

        const dirX = resizeStartRef.current.direction.x;
        const dirY = resizeStartRef.current.direction.y;

        const updates: Partial<TextElement> = {};

        if (dirX !== 0 && dirY === 0) {
            // Horizontal resize: change container size (width)
            const deltaCanvas = dx * dirX * scaleX;
            const currentSize = (selectedText.size ?? 700);
            const newSize = Math.max(100, Math.min(1080, currentSize + deltaCanvas * 2));
            updates.size = Math.round(newSize);
        } else if (dirY !== 0 && dirX === 0) {
            // Vertical resize: change font size
            const deltaFont = dy * dirY * 0.5 * (scaleY);
            const newFontSize = Math.max(20, Math.min(200, resizeStartRef.current.fontSize + deltaFont));
            updates.fontSize = Math.round(newFontSize);
        } else {
            // Diagonal resize: adjust both
            const deltaCanvasW = dx * dirX * scaleX;
            const deltaCanvasH = dy * dirY * scaleY;
            const currentSize = (selectedText.size ?? 700);
            const newSize = Math.max(100, Math.min(1080, currentSize + deltaCanvasW * 2));
            const newFontSize = Math.max(20, Math.min(200, resizeStartRef.current.fontSize + deltaCanvasH * 0.5));
            updates.size = Math.round(newSize);
            updates.fontSize = Math.round(newFontSize);
        }

        // Keep the element centered (do not change x/y)
        onUpdateText(selectedText.id, updates);
    }, [isDragging, selectedText, onUpdateText, canvasWidth, canvasHeight]);

    // Rotate
    const handleResizeEnd = useCallback(() => {
        setIsDragging(false);
        setActiveTransform(null);
        resizeStartRef.current = null;
    }, []);

    const handleRotateStart = useCallback((e: React.MouseEvent, element: TextElement, centerX: number, centerY: number) => {
        e.stopPropagation();
        setActiveTransform('rotate');
        setIsDragging(true);

        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        rotateStartRef.current = {
            angle,
            rotation: element.rotation,
        };
    }, []);

    const handleRotateMove = useCallback((e: MouseEvent, centerX: number, centerY: number) => {
        if (!isDragging || !rotateStartRef.current || !selectedText) return;

        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = angle - rotateStartRef.current.angle;
        let newRotation = (rotateStartRef.current.rotation + deltaAngle) % 360;

        if (newRotation < 0) newRotation += 360;

        onUpdateText(selectedText.id, { rotation: Math.round(newRotation) });
    }, [isDragging, selectedText, onUpdateText]);

    const handleRotateEnd = useCallback(() => {
        setIsDragging(false);
        setActiveTransform(null);
        rotateStartRef.current = null;
    }, []);

    return {
        activeTransform,
        isDragging,
        selectedText,
        handlers: {
            move: { onStart: handleMoveStart, onMove: handleMoveMove, onEnd: handleMoveEnd },
            resize: { onStart: handleResizeStart, onMove: handleResizeMove, onEnd: handleResizeEnd },
            rotate: { onStart: handleRotateStart, onMove: handleRotateMove, onEnd: handleRotateEnd },
        },
    };
}

