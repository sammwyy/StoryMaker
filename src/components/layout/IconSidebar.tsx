import { Image, Type, Download, Moon, Sun, Github, ImagePlus } from 'lucide-react';

import { Tab } from '../../lib/types';

interface IconSidebarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    isDark: boolean;
    onToggleTheme: () => void;
}

export function IconSidebar({ activeTab, onTabChange, isDark, onToggleTheme }: IconSidebarProps) {
    const tabs = [
        { id: 'background' as Tab, icon: Image, label: 'Background' },
        { id: 'text' as Tab, icon: Type, label: 'Text' },
        { id: 'images' as Tab, icon: ImagePlus, label: 'Images' },
        { id: 'export' as Tab, icon: Download, label: 'Export' },
    ];

    return (
        <div className="w-16 bg-gray-50 dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800 flex flex-col">
            <div className="flex-1 py-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`w-full h-16 flex items-center justify-center transition-all ${activeTab === tab.id
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                                }`}
                            title={tab.label}
                        >
                            <Icon className="w-6 h-6" />
                        </button>
                    );
                })}
            </div>

            <div className="border-t border-gray-200 dark:border-dark-800">
                <button
                    onClick={onToggleTheme}
                    className="w-full h-16 flex items-center justify-center text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-850 transition-all"
                    title="Toggle theme"
                >
                    {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>

                <a
                    href="https://github.com/sammwyy/storymaker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-16 flex items-center justify-center text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-850 transition-all"
                    title="GitHub"
                >
                    <Github className="w-6 h-6" />
                </a>
            </div>
        </div>
    );
}


