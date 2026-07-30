/**
 * PhoneInput.jsx
 *
 * A reusable phone number input with a country-code flag dropdown.
 *
 * Props:
 *   label          – string, field label
 *   required       – bool
 *   value          – the raw local number (no dial code)
 *   dialCode       – e.g. "+91"
 *   onValueChange  – (rawNumber: string) => void
 *   onDialChange   – (dialCode: string) => void
 *   error          – string | undefined
 *   placeholder    – string
 *   countryCodes   – array from API: [{ name, iso2, dialCode, minLength }]
 *   disabled       – bool
 *
 * Length behaviour:
 *   Each country in countryCodes carries its own `minLength` (the expected
 *   number of digits for a local number in that country, e.g. India = 10,
 *   UAE = 9, Andorra = 6). PhoneInput uses that value as a STRICT cap on the
 *   <input> (maxLength), and re-validates/truncates the current value
 *   whenever the dial code changes. If a country has no minLength on record,
 *   we fall back to 10 digits.
 *
 * What gets sent to the API:
 *   Strip the leading "+" from dialCode, then concat with the local number.
 *   e.g. dialCode="+91", value="9988334455"  →  "919988334455"
 *
 * Helper exports:
 *   formatPhoneForApi(dialCode, localNumber) → "919988334455"
 *   getExpectedLength(countryCodes, dialCode) → number (digits expected for that country)
 */

import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';

const DEFAULT_PHONE_LENGTH = 10;

export function formatPhoneForApi(dialCode = '+91', localNumber = '') {
  const cleanDial = String(dialCode).replace(/^\+/, '');
  const cleanNum  = String(localNumber).replace(/\D/g, '');
  return '+' + cleanDial + cleanNum;
}

// Looks up the expected digit-length for a given dial code from the
// countryCodes list. Falls back to DEFAULT_PHONE_LENGTH if not found.
export function getExpectedLength(countryCodes = [], dialCode = '+91') {
  const match = countryCodes.find((c) => c.dialCode === dialCode);
  const len = Number(match?.minLength);
  return Number.isFinite(len) && len > 0 ? len : DEFAULT_PHONE_LENGTH;
}

// Builds a fresh "exactly N digits" regex for the given country.
export function getPhoneRegexForCountry(countryCodes = [], dialCode = '+91') {
  const len = getExpectedLength(countryCodes, dialCode);
  return new RegExp(`^\\d{${len}}$`);
}

export function PhoneInput({
  label,
  required = false,
  value = '',
  dialCode = '+91',
  onValueChange,
  onDialChange,
  onBlurNumber,
  error,
  placeholder = 'Phone number',
  countryCodes = [],
  disabled = false,
  hint,
}) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const dropdownRef           = useRef(null);
  const searchRef             = useRef(null);

  const expectedLength = getExpectedLength(countryCodes, dialCode);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = countryCodes.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.dialCode.includes(term) ||
      c.iso2.toLowerCase().includes(term)
    );
  });

  const selected = countryCodes.find((c) => c.dialCode === dialCode) || null;

  const handleSelect = (c) => {
    onDialChange?.(c.dialCode);
    // Re-clamp the existing value to the newly selected country's length,
    // so switching from e.g. India (10) to Andorra (6) doesn't leave a
    // too-long number silently sitting in state.
    const newLen = getExpectedLength(countryCodes, c.dialCode);
    if (value && value.length > newLen) {
      onValueChange?.(value.slice(0, newLen));
    }
    setOpen(false);
    setSearch('');
  };

  const handleNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, expectedLength);
    onValueChange?.(raw);
  };

  const borderClass = error
    ? 'border-red-400 bg-red-50'
    : 'border-gray-200 bg-white';

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className={`flex rounded-xl border overflow-visible ${borderClass} focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all`}>

        {/* ── Country code trigger ── */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled || countryCodes.length === 0}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 h-full border-r border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-l-xl whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ minWidth: '72px' }}
          >
            {selected ? (
              <>
                <span className="text-base leading-none">{getFlagEmoji(selected.iso2)}</span>
                <span className="text-xs font-semibold text-gray-600">{selected.dialCode}</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Code</span>
            )}
            <FaChevronDown className="text-[9px] text-gray-400 ml-0.5" />
          </button>

          {/* ── Dropdown ── */}
          {open && (
            <div
              className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden"
              style={{ maxHeight: '260px', display: 'flex', flexDirection: 'column' }}
            >
              {/* Search */}
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <FaSearch className="text-gray-400 text-xs shrink-0" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..."
                    className="bg-transparent text-xs outline-none w-full text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {filtered.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No results</p>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.iso2}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-orange-50 transition-colors text-xs ${c.dialCode === dialCode ? 'bg-orange-50 font-bold text-orange-700' : 'text-gray-700'}`}
                    >
                      <span className="text-base leading-none shrink-0">{getFlagEmoji(c.iso2)}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-gray-400 font-medium shrink-0">{c.dialCode}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Number input ── */}
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleNumberChange}
          onBlur={() => onBlurNumber?.()}
          placeholder={placeholder}
          maxLength={expectedLength}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 sm:py-3 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400 rounded-r-xl disabled:opacity-60"
        />
      </div>

      {error ? (
        <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-gray-400 text-[10px] mt-1">{hint}</p>
      ) : (
        <p className="text-gray-400 text-[10px] mt-1">{value.length}/{expectedLength} digits</p>
      )}
    </div>
  );
}

// Converts ISO2 country code to flag emoji
function getFlagEmoji(iso2 = '') {
  if (!iso2 || iso2.length !== 2) return '🌐';
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default PhoneInput;