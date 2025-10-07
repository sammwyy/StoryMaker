import { useCallback, useRef, useState } from 'react';

import { ImageElement } from '../lib/types';

export type TransformType = 'move' | 'resize' | 'rotate';

interface UseImageTransformProps {
    imageElements: ImageElement[];
    selectedImageId: string | null;
    onUpdateImage: (id: string, updates: Partial<ImageElement>) => void;
    canvasWidth: number;
    canvasHeight: number;
}

export function useImageTransform({ imageElements, selectedImageId, onUpdateImage, canvasWidth, canvasHeight }: UseImageTransformProps) {
    const [activeTransform, setActiveTransform] = useState<TransformType | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number; elementX: number; elementY: number } | null>(null);
    const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number; elementX: number; elementY: number; direction: { x: number; y: number } } | null>(null);
    const rotateStartRef = useRef<{ angle: number; rotation: number } | null>(null);

    const selectedImage = imageElements.find(i => i.id === selectedImageId) || null;

    const handleMoveStart = useCallback((e: React.MouseEvent, el: ImageElement) => {
        setActiveTransform('move');
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY, elementX: el.x, elementY: el.y };
    }, []);

    const handleMoveMove = useCallback((e: MouseEvent, canvasRect: DOMRect) => {
        if (!isDragging || !dragStartRef.current || !selectedImage) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const scaleX = canvasWidth / canvasRect.width;
        const scaleY = canvasHeight / canvasRect.height;
        const newX = Math.max(0, Math.min(canvasWidth, dragStartRef.current.elementX + dx * scaleX));
        const newY = Math.max(0, Math.min(canvasHeight, dragStartRef.current.elementY + dy * scaleY));
        onUpdateImage(selectedImage.id, { x: newX, y: newY });
    }, [isDragging, selectedImage, onUpdateImage, canvasWidth, canvasHeight]);

    const handleMoveEnd = useCallback(() => {
        setIsDragging(false);
        setActiveTransform(null);
        dragStartRef.current = null;
    }, []);

    const handleResizeStart = useCallback((e: React.MouseEvent, el: ImageElement, directionX: number, directionY: number) => {
        e.stopPropagation();
        setActiveTransform('resize');
        setIsDragging(true);
        resizeStartRef.current = { x: e.clientX, y: e.clientY, width: el.width, height: el.height, elementX: el.x, elementY: el.y, direction: { x: directionX, y: directionY } };
    }, []);

    const handleResizeMove = useCallback((e: MouseEvent, canvasRect: DOMRect) => {
        if (!isDragging || !resizeStartRef.current || !selectedImage) return;
        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;
        const scaleX = canvasWidth / canvasRect.width;
        const scaleY = canvasHeight / canvasRect.height;

        const dirX = resizeStartRef.current.direction.x;
        const dirY = resizeStartRef.current.direction.y;

        const updates: Partial<ImageElement> = {};
        if (dirX !== 0 && dirY === 0) {
            const deltaW = dx * dirX * scaleX;
            updates.width = Math.max(10, Math.round(resizeStartRef.current.width + deltaW * 2));
        } else if (dirY !== 0 && dirX === 0) {
            const deltaH = dy * dirY * scaleY;
            updates.height = Math.max(10, Math.round(resizeStartRef.current.height + deltaH * 2));
        } else {
            const deltaW = dx * dirX * scaleX;
            const deltaH = dy * dirY * scaleY;
            updates.width = Math.max(10, Math.round(resizeStartRef.current.width + deltaW * 2));
            updates.height = Math.max(10, Math.round(resizeStartRef.current.height + deltaH * 2));
        }

        onUpdateImage(selectedImage.id, updates);
    }, [isDragging, selectedImage, onUpdateImage, canvasWidth, canvasHeight]);

    const handleResizeEnd = useCallback(() => {
        setIsDragging(false);
        setActiveTransform(null);
        resizeStartRef.current = null;
    }, []);

    const handleRotateStart = useCallback((e: React.MouseEvent, el: ImageElement, centerX: number, centerY: number) => {
        e.stopPropagation();
        setActiveTransform('rotate');
        setIsDragging(true);
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        rotateStartRef.current = { angle, rotation: el.rotation };
    }, []);

    const handleRotateMove = useCallback((e: MouseEvent, centerX: number, centerY: number) => {
        if (!isDragging || !rotateStartRef.current || !selectedImage) return;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = angle - rotateStartRef.current.angle;
        let newRotation = (rotateStartRef.current.rotation + deltaAngle) % 360;
        if (newRotation < 0) newRotation += 360;
        onUpdateImage(selectedImage.id, { rotation: Math.round(newRotation) });
    }, [isDragging, selectedImage, onUpdateImage]);

    const handleRotateEnd = useCallback(() => {
        setIsDragging(false);
        setActiveTransform(null);
        rotateStartRef.current = null;
    }, []);

    return {
        activeTransform,
        isDragging,
        selectedImage,
        handlers: {
            move: { onStart: handleMoveStart, onMove: handleMoveMove, onEnd: handleMoveEnd },
            resize: { onStart: handleResizeStart, onMove: handleResizeMove, onEnd: handleResizeEnd },
            rotate: { onStart: handleRotateStart, onMove: handleRotateMove, onEnd: handleRotateEnd },
        },
    };
}


