import { useMemo } from 'react';

export interface BoxElement {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

interface ElementOverlayProps<T extends BoxElement> {
    element: T;
    isSelected: boolean;
    canvasRect: DOMRect;
    canvasWidth: number;
    canvasHeight: number;
    onSelect: () => void;
    onMoveStart: (e: React.MouseEvent) => void;
    onResizeStart: (e: React.MouseEvent, dirX: number, dirY: number) => void;
    onRotateStart: (e: React.MouseEvent, centerX: number, centerY: number) => void;
}

export function ElementOverlay<T extends BoxElement>({
    element,
    isSelected,
    canvasRect,
    canvasWidth,
    canvasHeight,
    onSelect,
    onMoveStart,
    onResizeStart,
    onRotateStart,
}: ElementOverlayProps<T>) {
    const scaleX = canvasRect.width / canvasWidth;
    const scaleY = canvasRect.height / canvasHeight;

    const screenX = element.x * scaleX;
    const screenY = element.y * scaleY;
    const boxW = Math.max(20, element.width * scaleX);
    const boxH = Math.max(20, element.height * scaleY);

    const circleRadius = useMemo(() => {
        const base = Math.max(boxW, boxH);
        return Math.max(40, Math.min(200, base * 0.5));
    }, [boxW, boxH]);

    const centerX = canvasRect.left + screenX;
    const centerY = canvasRect.top + screenY;

    const resizeHandles = [
        { x: -1, y: -1, cursor: 'nwse-resize', color: 'bg-purple-500' },
        { x: 0, y: -1, cursor: 'ns-resize', color: 'bg-purple-500' },
        { x: 1, y: -1, cursor: 'nesw-resize', color: 'bg-purple-500' },
        { x: 1, y: 0, cursor: 'ew-resize', color: 'bg-purple-500' },
        { x: 1, y: 1, cursor: 'nwse-resize', color: 'bg-purple-500' },
        { x: 0, y: 1, cursor: 'ns-resize', color: 'bg-purple-500' },
        { x: -1, y: 1, cursor: 'nesw-resize', color: 'bg-purple-500' },
        { x: -1, y: 0, cursor: 'ew-resize', color: 'bg-purple-500' },
    ];

    return (
        <div
            className="absolute pointer-events-auto"
            style={{ left: '0px', top: '0px', transform: `translate(${screenX}px, ${screenY}px)` }}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
            <div className="absolute" style={{ left: '0', top: '0', transform: `rotate(${element.rotation}deg)`, transformOrigin: '0 0' }}>
                <div
                    className={`cursor-move transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-green-500 ring-opacity-50 bg-green-500 bg-opacity-5' : 'hover:ring-2 hover:ring-green-300 hover:ring-opacity-50'}`}
                    style={{ width: `${boxW}px`, height: `${boxH}px`, position: 'absolute', left: '0', top: '0', transform: 'translate(-50%, -50%)' }}
                    onMouseDown={(e) => { if (isSelected) onMoveStart(e); }}
                />

                {isSelected && (
                    <>
                        <div className="absolute border-2 border-orange-500 rounded-full pointer-events-none opacity-80" style={{ width: `${circleRadius * 2}px`, height: `${circleRadius * 2}px`, left: '0', top: '0', transform: 'translate(-50%, -50%)' }} />
                        <div
                            className="absolute w-4 h-4 bg-orange-500 border-2 border-white dark:border-dark-900 rounded-full cursor-grab hover:scale-125 transition-transform active:cursor-grabbing shadow-lg z-20"
                            style={{ left: '0', top: '0', transform: `translate(-50%, -50%) translateY(-${circleRadius}px)` }}
                            onMouseDown={(e) => onRotateStart(e, centerX, centerY)}
                            title="Rotate"
                        />
                        {resizeHandles.map((handle, index) => {
                            const halfW = boxW / 2;
                            const halfH = boxH / 2;
                            return (
                                <div
                                    key={index}
                                    className={`absolute w-3 h-3 ${handle.color} border-2 border-white dark:border-dark-900 rounded-full hover:scale-150 transition-transform shadow-lg z-10`}
                                    style={{ left: '0', top: '0', transform: `translate(-50%, -50%) translate(${handle.x * halfW}px, ${handle.y * halfH}px)`, cursor: handle.cursor }}
                                    onMouseDown={(e) => onResizeStart(e, handle.x, handle.y)}
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


