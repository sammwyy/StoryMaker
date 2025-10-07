import React from 'react';

type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    label?: string;
    valueSuffix?: string;
};

export function Slider({ label, value, valueSuffix = '', className = '', min = 0, max = 100, step = 1, onChange, ...props }: SliderProps) {
    const numericMin = typeof min === 'string' ? Number(min) : min;
    const numericMax = typeof max === 'string' ? Number(max) : max;
    const rawValue = typeof value === 'string' ? Number(value) : (value as number | undefined);
    const safeValue = Number.isFinite(rawValue as number) ? Math.min(numericMax as number, Math.max(numericMin as number, rawValue as number)) : numericMin;
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {label}{typeof safeValue !== 'undefined' ? `: ${safeValue}${valueSuffix}` : ''}
                </label>
            )}
            <input
                type="range"
                min={numericMin}
                max={numericMax}
                step={step}
                value={safeValue}
                onChange={onChange}
                {...props}
                className={`w-full ${className}`}
            />
        </div>
    );
}


