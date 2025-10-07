import { Download } from 'lucide-react';
import { memo } from 'react';

import { ExportFormat } from '../../lib/types';

interface ExportPanelProps {
    onExport: (format: ExportFormat) => void;
    disabled: boolean;
}

export const ExportPanel = memo(function ExportPanel({ onExport, disabled }: ExportPanelProps) {
    const formats: { format: ExportFormat; label: string }[] = [
        { format: 'jpg', label: 'JPG' },
        { format: 'png', label: 'PNG' },
        { format: 'webp', label: 'WEBP' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Export Story</label>
                <p className="text-sm text-gray-500 dark:text-dark-400 mb-4">
                    {disabled ? 'Upload an image to enable export' : 'Choose format to download your story'}
                </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {formats.map(({ format, label }) => (
                    <button
                        key={format}
                        onClick={() => onExport(format)}
                        disabled={disabled}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-dark-800 disabled:shadow-none"
                    >
                        <Download className="w-5 h-5" />
                        Export as {label}
                    </button>
                ))}
            </div>
        </div>
    );
});


