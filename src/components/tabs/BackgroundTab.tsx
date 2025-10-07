import { Upload } from 'lucide-react';
import { memo } from 'react';

import { BackgroundSettings } from '../../lib/types';
import { Input } from '../ui/Input';

interface BackgroundTabProps {
    onImageUpload: (file: File) => void;
    backgroundSettings: BackgroundSettings;
    onBackgroundChange: (settings: BackgroundSettings) => void;
    hasImage: boolean;
}

export const BackgroundTab = memo(function BackgroundTab({
    onImageUpload,
    backgroundSettings,
    onBackgroundChange,
    hasImage,
}: BackgroundTabProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onImageUpload(file);
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Upload Image</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-dark-850 border-gray-300 dark:border-dark-700 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-dark-400" />
                        <p className="text-sm text-gray-500 dark:text-dark-400">Click to upload image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>

            {hasImage && (
                <>
                    <div>
                        <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Background Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'fit', label: 'Fit' },
                                { value: 'stretch', label: 'Stretch' },
                                { value: 'solid', label: 'Solid Color' },
                                { value: 'gradient', label: 'Gradient' },
                                { value: 'blur', label: 'Blur' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onBackgroundChange({ ...backgroundSettings, type: option.value as BackgroundSettings['type'] })}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${backgroundSettings.type === option.value
                                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                        : 'bg-gray-100 dark:bg-dark-850 text-gray-700 dark:text-white/90 hover:bg-gray-200 dark:hover:bg-dark-800'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {backgroundSettings.type === 'solid' && (
                        <div>
                            <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Solid Color</label>
                            <Input
                                type="color"
                                value={backgroundSettings.solidColor}
                                onChange={(e) => onBackgroundChange({ ...backgroundSettings, solidColor: e.target.value })}
                            />
                        </div>
                    )}

                    {backgroundSettings.type === 'gradient' && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Gradient Start</label>
                                <Input type="color" value={backgroundSettings.gradientStart} onChange={(e) => onBackgroundChange({ ...backgroundSettings, gradientStart: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Gradient End</label>
                                <Input type="color" value={backgroundSettings.gradientEnd} onChange={(e) => onBackgroundChange({ ...backgroundSettings, gradientEnd: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Angle: {backgroundSettings.gradientAngle}°</label>
                                <input type="range" min="0" max="360" value={backgroundSettings.gradientAngle} onChange={(e) => onBackgroundChange({ ...backgroundSettings, gradientAngle: Number(e.target.value) })} className="w-full" />
                            </div>
                        </>
                    )}

                    {backgroundSettings.type === 'blur' && (
                        <div>
                            <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Blur Background Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => onBackgroundChange({ ...backgroundSettings, blurMode: 'fit' })} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${backgroundSettings.blurMode === 'fit' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-gray-100 dark:bg-dark-850 text-gray-700 dark:text-white/90 hover:bg-gray-200 dark:hover:bg-dark-800'}`}>Fit (Zoom)</button>
                                <button onClick={() => onBackgroundChange({ ...backgroundSettings, blurMode: 'stretch' })} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${backgroundSettings.blurMode === 'stretch' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-gray-100 dark:bg-dark-850 text-gray-700 dark:text-white/90 hover:bg-gray-200 dark:hover:bg-dark-800'}`}>Stretch</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
});


