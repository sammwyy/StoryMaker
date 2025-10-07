import React from 'react';

type Option = { value: string; label: string };

type DropdownProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    options: Option[];
};

export function Dropdown({ label, options, className = '', ...props }: DropdownProps) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {label}
                </label>
            )}
            <select
                {...props}
                className={`w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-850 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${className}`}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}


