import { Trash2, Upload } from 'lucide-react';
import { memo, useRef } from 'react';

import { ImageElement } from '../../lib/types';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { Checkbox } from '../ui/Checkbox';
import { Dropdown } from '../ui/Dropdown';

interface ImagesTabProps {
    imageElements: ImageElement[];
    selectedImageId: string | null;
    onAddImage: (file: File) => void;
    onSelectImage: (id: string) => void;
    onUpdateImage: (id: string, updates: Partial<ImageElement>) => void;
    onDeleteImage: (id: string) => void;
}

const FILTERS = [
    { value: 'normal', label: 'Normal' },
    { value: 'grayscale', label: 'Black & White' },
    { value: 'sepia', label: 'Sepia' },
    { value: 'negative', label: 'Negative' },
];

export const ImagesTab = memo(function ImagesTab({
    imageElements,
    selectedImageId,
    onAddImage,
    onSelectImage,
    onUpdateImage,
    onDeleteImage,
}: ImagesTabProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const selected = imageElements.find(i => i.id === selectedImageId);

    return (
        <div className="space-y-6">
            <div>
                <button
                    onClick={() => inputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30"
                >
                    <Upload className="w-5 h-5" />
                    Add Image
                </button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onAddImage(file);
                    e.currentTarget.value = '';
                }} />
            </div>

            {imageElements.length > 0 && (
                <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Images</label>
                    <div className="space-y-2">
                        {imageElements.map((img) => (
                            <div key={img.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedImageId === img.id ? 'bg-sky-100 dark:bg-sky-500/10 border-2 border-sky-500 shadow-lg shadow-sky-500/10' : 'bg-gray-100 dark:bg-dark-850 hover:bg-gray-200 dark:hover:bg-dark-800'}`} onClick={() => onSelectImage(img.id)}>
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{img.src.split('/').pop()}</span>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }} className="p-1 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selected && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="X" type="number" value={Math.round(selected.x)} onChange={(e) => onUpdateImage(selected.id, { x: Number(e.target.value) })} />
                        <Input label="Y" type="number" value={Math.round(selected.y)} onChange={(e) => onUpdateImage(selected.id, { y: Number(e.target.value) })} />
                        <Input label="Width" type="number" value={Math.round(selected.width)} onChange={(e) => onUpdateImage(selected.id, { width: Number(e.target.value) })} />
                        <Input label="Height" type="number" value={Math.round(selected.height)} onChange={(e) => onUpdateImage(selected.id, { height: Number(e.target.value) })} />
                    </div>

                    <Slider label="Rotation" value={selected.rotation} min={0} max={360} valueSuffix="°" onChange={(e) => onUpdateImage(selected.id, { rotation: Number(e.target.value) })} />
                    <Dropdown
                        label="Corners"
                        value={selected.cornerStyle}
                        onChange={(e) => onUpdateImage(selected.id, { cornerStyle: e.target.value as ImageElement['cornerStyle'] })}
                        options={[
                            { value: 'square', label: 'Square' },
                            { value: 'rounded', label: 'Rounded' },
                            { value: 'circle', label: 'Circle' },
                            { value: 'custom', label: 'Custom' },
                        ]}
                    />
                    {selected.cornerStyle === 'custom' && (
                        <Slider label="Border Radius" value={selected.borderRadius} min={0} max={500} valueSuffix="px" onChange={(e) => onUpdateImage(selected.id, { borderRadius: Number(e.target.value) })} />
                    )}

                    <Slider label="Outline Width" value={selected.outlineWidth} min={0} max={20} valueSuffix="px" onChange={(e) => onUpdateImage(selected.id, { outlineWidth: Number(e.target.value) })} />
                    {selected.outlineWidth > 0 && (
                        <Input label="Outline Color" type="color" value={selected.outlineColor} onChange={(e) => onUpdateImage(selected.id, { outlineColor: e.target.value })} />
                    )}

                    <Slider label="Brightness" value={selected.brightness} min={0} max={2} step={0.01} onChange={(e) => onUpdateImage(selected.id, { brightness: Number(e.target.value) })} />
                    <Slider label="Contrast" value={selected.contrast} min={0} max={2} step={0.01} onChange={(e) => onUpdateImage(selected.id, { contrast: Number(e.target.value) })} />
                    <Slider label="Blur" value={selected.blur} min={0} max={40} step={1} valueSuffix="px" onChange={(e) => onUpdateImage(selected.id, { blur: Number(e.target.value) })} />

                    <div className="grid grid-cols-2 gap-4">
                        <Checkbox label="Mirror Horizontal" checked={selected.mirrorH} onChange={(e) => onUpdateImage(selected.id, { mirrorH: e.target.checked })} />
                        <Checkbox label="Mirror Vertical" checked={selected.mirrorV} onChange={(e) => onUpdateImage(selected.id, { mirrorV: e.target.checked })} />
                    </div>

                    <Dropdown label="Filter" value={selected.filter} onChange={(e) => onUpdateImage(selected.id, { filter: e.target.value as ImageElement['filter'] })} options={FILTERS} />
                </>
            )}
        </div>
    );
});


