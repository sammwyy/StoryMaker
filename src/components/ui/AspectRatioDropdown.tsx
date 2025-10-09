import { ChevronDown, ChevronUp } from 'lucide-react';

import { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '../../lib/types';

interface AspectRatioDropdownProps {
    options: AspectRatio[];
    selectedOption: AspectRatio;
    onSelect: (option: AspectRatio) => void;
    placeholder?: string;
}

export const AspectRatioDropdown = ({ options, selectedOption, onSelect, placeholder = "Select aspect ratio" }: AspectRatioDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option: AspectRatio) => {
        onSelect(option);
        setIsOpen(false);
    };

    const getAspectRatioIcon = (iconName: string) => {
        const iconMap: { [key: string]: any } = {
            Smartphone: () => <div className="w-4 h-6 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-2 h-3 bg-gray-300 rounded-sm"></div></div>,
            Image: () => <div className="w-4 h-4 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 bg-gray-300 rounded-sm"></div></div>,
            Video: () => <div className="w-4 h-6 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 bg-gray-300 rounded-sm"></div></div>,
            Users: () => <div className="w-6 h-3 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-sm"></div></div>,
            MessageCircle: () => <div className="w-6 h-3 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-sm"></div></div>,
            Briefcase: () => <div className="w-6 h-3 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-sm"></div></div>,
            Music: () => <div className="w-4 h-6 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 bg-gray-300 rounded-sm"></div></div>,
            Play: () => <div className="w-6 h-3 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-sm"></div></div>,
            Monitor: () => <div className="w-6 h-3 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-sm"></div></div>,
            Zap: () => <div className="w-4 h-6 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 bg-gray-300 rounded-sm"></div></div>,
            Film: () => <div className="w-8 h-3 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-sm"></div></div>,
            Tv: () => <div className="w-5 h-4 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-sm"></div></div>,
            Square: () => <div className="w-4 h-4 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 bg-gray-300 rounded-sm"></div></div>,
            Camera: () => <div className="w-4 h-5 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 bg-gray-300 rounded-sm"></div></div>,
            Settings: () => <div className="w-4 h-6 border border-gray-400 rounded-sm bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 bg-gray-300 rounded-sm"></div></div>,
        };

        return iconMap[iconName] || iconMap.Image;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-850 border border-gray-300 dark:border-dark-700 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {getAspectRatioIcon(selectedOption.icon)()}
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedOption.name}</div>
                        <div className="text-sm text-gray-500 dark:text-dark-400">
                            {selectedOption.width} × {selectedOption.height} ({selectedOption.ratio})
                        </div>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-850 border border-gray-300 dark:border-dark-700 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                            {getAspectRatioIcon(option.icon)()}
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">{option.name}</div>
                                <div className="text-sm text-gray-500 dark:text-dark-400">
                                    {option.width} × {option.height} ({option.ratio})
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
