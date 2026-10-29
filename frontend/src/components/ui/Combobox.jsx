import React, { useState } from 'react';
import {
  Combobox as HeadlessCombobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export default function Combobox({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option...',
  disabled = false,
  error = false,
  className = '',
}) {
  const [query, setQuery] = useState('');

  const filtered =
    query === ''
      ? options
      : options.filter(item =>
          item.toLowerCase().includes(query.toLowerCase().trim())
        );

  return (
    <HeadlessCombobox
      value={value}
      onChange={onChange}
      disabled={disabled}
      onClose={() => setQuery('')}
    >
      <div className={`relative ${className}`}>
        <div
          className={`relative flex items-center w-full rounded-xl border bg-white dark:bg-slate-900 transition-colors shadow-xs ${
            error
              ? 'border-rose-400 dark:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
          } ${disabled ? 'opacity-60 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed' : ''}`}
        >
          <Search className="w-4 h-4 ml-3.5 text-slate-400 shrink-0 select-none" />

          <ComboboxInput
            className="w-full py-2.5 pl-2.5 pr-16 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none disabled:cursor-not-allowed"
            displayValue={item => item || ''}
            onChange={event => setQuery(event.target.value)}
            placeholder={placeholder}
          />

          <div className="absolute right-2 flex items-center gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ComboboxButton className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <ChevronDown className="w-4 h-4" />
            </ComboboxButton>
          </div>
        </div>

        <ComboboxOptions
          transition
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-900 py-1 text-sm shadow-xl border border-slate-200 dark:border-slate-800 focus:outline-none transition duration-100 ease-out data-[closed]:opacity-0"
        >
          {filtered.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-3 px-4 text-xs text-slate-500 dark:text-slate-400 text-center">
              No matching brands found
            </div>
          ) : (
            filtered.map(item => (
              <ComboboxOption
                key={item}
                value={item}
                className="group relative cursor-pointer select-none py-2 pl-9 pr-4 text-slate-800 dark:text-slate-200 data-[focus]:bg-blue-50 dark:data-[focus]:bg-blue-950/60 data-[focus]:text-blue-700 dark:data-[focus]:text-blue-300 font-medium text-sm transition-colors"
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}>
                      {item}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-blue-600 dark:text-blue-400">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </HeadlessCombobox>
  );
}

