import { Plus, Trash2 } from 'lucide-react';
import { memo } from 'react';

import { TextElement } from '../../lib/types';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { Checkbox } from '../ui/Checkbox';
import { Dropdown } from '../ui/Dropdown';

interface TextTabProps {
    textElements: TextElement[];
    selectedTextId: string | null;
    onAddText: () => void;
    onSelectText: (id: string) => void;
    onUpdateText: (id: string, updates: Partial<TextElement>) => void;
    onDeleteText: (id: string) => void;
}

const FONTS = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Palatino',
    'Garamond',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
];

export const TextTab = memo(function TextTab({
    textElements,
    selectedTextId,
    onAddText,
    onSelectText,
    onUpdateText,
    onDeleteText,
}: TextTabProps) {
    const selectedText = textElements.find((t) => t.id === selectedTextId);

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onAddText} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30">
                    <Plus className="w-5 h-5" />
                    Add Text
                </button>
            </div>

            {textElements.length > 0 && (
                <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Text Elements</label>
                    <div className="space-y-2">
                        {textElements.map((textEl) => (
                            <div key={textEl.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedTextId === textEl.id ? 'bg-sky-100 dark:bg-sky-500/10 border-2 border-sky-500 shadow-lg shadow-sky-500/10' : 'bg-gray-100 dark:bg-dark-850 hover:bg-gray-200 dark:hover:bg-dark-800'}`} onClick={() => onSelectText(textEl.id)}>
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{textEl.text || 'Empty text'}</span>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteText(textEl.id); }} className="p-1 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedText && (
                <>
                    <Input label="Text Content" type="text" value={selectedText.text} onChange={(e) => onUpdateText(selectedText.id, { text: e.target.value })} placeholder="Enter text..." />

                    <Dropdown label="Font Family" value={selectedText.fontFamily} onChange={(e) => onUpdateText(selectedText.id, { fontFamily: e.target.value })} options={FONTS.map((f) => ({ value: f, label: f }))} />

                    <Slider label="Font Size" value={selectedText.fontSize} min={20} max={200} valueSuffix="px" onChange={(e) => onUpdateText(selectedText.id, { fontSize: Number(e.target.value) })} />

                    <Input label="Text Color" type="color" value={selectedText.color} onChange={(e) => onUpdateText(selectedText.id, { color: e.target.value })} />

                    <Slider label="Outline Width" value={selectedText.outlineWidth} min={0} max={20} valueSuffix="px" onChange={(e) => onUpdateText(selectedText.id, { outlineWidth: Number(e.target.value) })} />

                    {selectedText.outlineWidth > 0 && (
                        <Input label="Outline Color" type="color" value={selectedText.outlineColor} onChange={(e) => onUpdateText(selectedText.id, { outlineColor: e.target.value })} />
                    )}

                    <Slider label="Rotation" value={selectedText.rotation} min={0} max={360} valueSuffix="°" onChange={(e) => onUpdateText(selectedText.id, { rotation: Number(e.target.value) })} />

                    <Slider label="Container Width" value={selectedText.size} min={100} max={1080} valueSuffix="px" onChange={(e) => onUpdateText(selectedText.id, { size: Number(e.target.value) })} />

                    <Checkbox label="Break long words (character wrapping)" checked={!!selectedText.breakWords} onChange={(e) => onUpdateText(selectedText.id, { breakWords: e.target.checked })} />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="X Position" type="number" value={Math.round(selectedText.x)} onChange={(e) => onUpdateText(selectedText.id, { x: Number(e.target.value) })} />
                        <Input label="Y Position" type="number" value={Math.round(selectedText.y)} onChange={(e) => onUpdateText(selectedText.id, { y: Number(e.target.value) })} />
                    </div>
                </>
            )}
        </div>
    );
});


