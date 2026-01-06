import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, icon, className = "", ...props }) => {
  return (
    <div>
      <label className="block mb-2 text-sm" style={{ color: 'var(--secondary-color)' }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
            {icon}
          </div>
        )}
        <input
          className={`w-full p-3 rounded-lg border outline-none focus:border-blue-500 transition-colors ${icon ? 'pl-10' : ''} ${className}`}
          style={{
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            borderColor: 'var(--border-color)'
          }}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, options, error, className = "", ...props }) => {
  return (
    <div>
      <label className="block mb-2 text-sm" style={{ color: 'var(--secondary-color)' }}>
        {label}
      </label>
      <select
        className={`w-full p-3 rounded-lg border outline-none focus:border-blue-500 transition-colors ${className}`}
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          borderColor: 'var(--border-color)'
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({ label, error, className = "", ...props }) => {
  return (
    <div>
      <label className="block mb-2 text-sm" style={{ color: 'var(--secondary-color)' }}>
        {label}
      </label>
      <textarea
        className={`w-full p-3 rounded-lg border outline-none focus:border-blue-500 transition-colors resize-none ${className}`}
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          borderColor: 'var(--border-color)'
        }}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
