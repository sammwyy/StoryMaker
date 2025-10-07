import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    description?: string;
};

export function Input({ label, description, className = '', ...props }: InputProps) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {label}
                </label>
            )}
            <input
                {...props}
                className={
                    `w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-850 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${className}`
                }
            />
            {description && (
                <p className="text-xs text-gray-500 dark:text-dark-400">{description}</p>
            )}
        </div>
    );
}


