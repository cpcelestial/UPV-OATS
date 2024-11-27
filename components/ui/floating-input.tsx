import React, { useState, InputHTMLAttributes } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  id,
  value,
  onChange,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        {...props}
        value={value}
        onChange={onChange}
        className="w-full border-b-2 border-gray-300 bg-transparent px-0 py-2 text-gray-900 focus:border-[#8B1818] focus:outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <label
        htmlFor={id}
        className={`absolute left-0 transition-all duration-200 ${
          isFocused || value
            ? "-top-3.5 text-sm text-[#8B1818]"
            : "top-2 text-base text-gray-600"
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export { FloatingInput };
