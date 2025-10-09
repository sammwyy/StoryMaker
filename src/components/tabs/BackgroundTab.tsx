import { Upload } from 'lucide-react';
import { memo, useState, useRef } from 'react';

import { BackgroundSettings, AspectRatio } from '../../lib/types';
import { PREDEFINED_ASPECT_RATIOS } from '../../lib/aspectRatios';
import { Input } from '../ui/Input';
import { AspectRatioDropdown } from '../ui/AspectRatioDropdown';

interface BackgroundTabProps {
    onImageUpload: (file: File) => void;
    backgroundSettings: BackgroundSettings;
    onBackgroundChange: (settings: BackgroundSettings) => void;
    hasImage: boolean;
    onAspectRatioChange: (aspectRatio: AspectRatio) => void;
    currentAspectRatio: AspectRatio;
}

export const BackgroundTab = memo(function BackgroundTab({
    onImageUpload,
    backgroundSettings,
    onBackgroundChange,
    hasImage,
    onAspectRatioChange,
    currentAspectRatio,
}: BackgroundTabProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [customWidth, setCustomWidth] = useState(currentAspectRatio.width);
    const [customHeight, setCustomHeight] = useState(currentAspectRatio.height);
    const [showCustomInputs, setShowCustomInputs] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));
        if (imageFile) {
            handleFile(imageFile);
        }
    };

    const handleAspectRatioSelect = (aspectRatio: AspectRatio) => {
        if (aspectRatio.id === 'custom') {
            setShowCustomInputs(true);
        } else {
            setShowCustomInputs(false);
            onAspectRatioChange(aspectRatio);
        }
    };

    const handleCustomDimensionsApply = () => {
        const customAspectRatio: AspectRatio = {
            id: 'custom',
            name: 'Custom',
            width: customWidth,
            height: customHeight,
            ratio: `${customWidth}:${customHeight}`,
            icon: 'Settings',
            category: 'custom'
        };
        onAspectRatioChange(customAspectRatio);
    };

    return (
        <div className="space-y-6">
            {/* Canvas Size Dropdown - moved to top */}
            <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Canvas Size</label>
                <AspectRatioDropdown
                    options={PREDEFINED_ASPECT_RATIOS}
                    selectedOption={currentAspectRatio}
                    onSelect={handleAspectRatioSelect}
                />

                {/* Custom inputs */}
                {showCustomInputs && (
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-dark-850 rounded-xl space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-dark-400">Width</label>
                                <Input
                                    type="number"
                                    value={customWidth}
                                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                                    min="100"
                                    max="4000"
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-dark-400">Height</label>
                                <Input
                                    type="number"
                                    value={customHeight}
                                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                                    min="100"
                                    max="4000"
                                    className="text-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCustomDimensionsApply}
                            className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
                        >
                            Apply Custom Size
                        </button>
                    </div>
                )}
            </div>

            {/* Horizontal Separator */}
            <div className="border-t border-gray-200 dark:border-dark-700"></div>

            {/* Upload Background Image */}
            <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Upload Background Image</label>
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragOver
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
                        : 'border-gray-300 dark:border-dark-700 bg-gray-50 dark:bg-dark-850 hover:bg-gray-100 dark:hover:bg-dark-800'
                        }`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-8 h-8 mb-2 ${isDragOver ? 'text-sky-500 animate-bounce' : 'text-gray-500 dark:text-dark-400'}`} />
                        <p className={`text-sm ${isDragOver ? 'text-sky-600 dark:text-sky-400' : 'text-gray-500 dark:text-dark-400'}`}>
                            {isDragOver ? 'Drop image here' : 'Click to upload or drag & drop'}
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Background Type */}
            {hasImage && (
                <>
                    {/* Horizontal Separator */}
                    <div className="border-t border-gray-200 dark:border-dark-700"></div>

                    <div>
                        <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Background Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'fit', label: 'Fit' },
                                { value: 'stretch', label: 'Stretch' },
                                { value: 'solid', label: 'Solid Color' },
                                { value: 'gradient', label: 'Gradient' },
                                { value: 'blur', label: 'Blur' },
                                { value: 'repeat', label: 'Repeat' },
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
                </>
            )}

            {hasImage && (
                <>
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


