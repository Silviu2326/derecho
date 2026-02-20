// Enhanced Form Components
// Input with validation, character counter, and better states

import { useState, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
}

export function Input({
  label,
  error,
  success,
  hint,
  leftIcon,
  rightIcon,
  showCharCount,
  maxLength,
  className = '',
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const charCount = props.value?.toString().length || 0;
  const isPassword = props.type === 'password';

  const getStateClass = () => {
    if (error) return 'border-red-500 focus:border-red-500';
    if (success) return 'border-emerald-500 focus:border-emerald-500';
    return 'border-theme focus:border-accent';
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-theme-primary">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          {...props}
          type={isPassword && showPassword ? 'text' : props.type}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 bg-theme-tertiary border rounded-xl text-theme-primary
            placeholder-theme-muted focus:outline-none transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || isPassword || error || success ? 'pr-10' : ''}
            ${getStateClass()}
            ${className}
          `}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {error && <AlertCircle className="w-5 h-5 text-red-400" />}
          {success && !error && <Check className="w-5 h-5 text-emerald-400" />}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-theme-muted hover:text-theme-primary"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          {rightIcon && !error && !success && !isPassword && rightIcon}
        </div>
      </div>

      {/* Helper text */}
      {(error || success || hint || showCharCount) && (
        <div className="flex items-center justify-between text-xs">
          <span className={error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-theme-muted'}>
            {error || success || hint}
          </span>
          {showCharCount && maxLength && (
            <span className={`${charCount >= maxLength ? 'text-red-400' : 'text-theme-muted'}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Textarea with character count
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCharCount?: boolean;
}

export function Textarea({
  label,
  error,
  hint,
  showCharCount,
  className = '',
  id,
  value,
  maxLength,
  ...props
}: TextareaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const charCount = value?.toString().length || 0;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-theme-primary">
          {label}
        </label>
      )}
      
      <textarea
        id={inputId}
        value={value}
        maxLength={maxLength}
        {...props}
        className={`
          w-full px-4 py-3 bg-theme-tertiary border rounded-xl text-theme-primary
          placeholder-theme-muted focus:outline-none transition-colors resize-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500' : 'border-theme focus:border-accent'}
          ${className}
        `}
      />

      {/* Helper text */}
      {(error || hint || showCharCount) && (
        <div className="flex items-center justify-between text-xs">
          <span className={error ? 'text-red-400' : 'text-theme-muted'}>
            {error || hint}
          </span>
          {showCharCount && maxLength && (
            <span className={`${charCount >= maxLength ? 'text-red-400' : 'text-theme-muted'}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Select with custom styling
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-theme-primary">
          {label}
        </label>
      )}
      
      <select
        id={inputId}
        {...props}
        className={`
          w-full px-4 py-3 bg-theme-tertiary border rounded-xl text-theme-primary
          focus:outline-none transition-colors appearance-none cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500' : 'border-theme focus:border-accent'}
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px'
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

// Checkbox with custom styling
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, className = '', id, ...props }: CheckboxProps) {
  const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label htmlFor={inputId} className="flex items-center gap-3 cursor-pointer">
      <input
        id={inputId}
        type="checkbox"
        {...props}
        className={`
          w-5 h-5 rounded border-2 border-theme bg-transparent
          checked:bg-accent checked:border-accent
          focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-theme-card
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer
          ${className}
        `}
      />
      <span className="text-theme-primary">{label}</span>
    </label>
  );
}

// Toggle Switch
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative w-12 h-6 rounded-full transition-colors
          ${checked ? 'bg-accent' : 'bg-theme-tertiary'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
            ${checked ? 'translate-x-7' : 'translate-x-1'}
          `}
        />
      </button>
      {label && <span className="text-theme-primary">{label}</span>}
    </label>
  );
}

export default Input;
