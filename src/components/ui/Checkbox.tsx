import React from 'react';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
};

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
    return (
        <label className="flex items-center gap-3 select-none">
            <input
                type="checkbox"
                {...props}
                className={`w-4 h-4 rounded border-gray-300 dark:border-dark-700 text-sky-600 focus:ring-sky-500 ${className}`}
            />
            {label && (
                <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
            )}
        </label>
    );
}


