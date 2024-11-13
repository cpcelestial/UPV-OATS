import React, { useState, InputHTMLAttributes } from "react"

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({ label, id, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                {...props}
                className="w-full border-b-2 border-gray-300 bg-transparent px-0 py-2 text-gray-900 focus:border-[#8B1818] focus:outline-none"
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    setIsFocused(false);
                    setHasValue(e.target.value !== '');
                }}
                onChange={(e) => setHasValue(e.target.value !== '')}
            />
            <label
                htmlFor={id}
                className={`absolute left-0 transition-all duration-200 ${isFocused || hasValue
                    ? '-top-3.5 text-sm text-[#8B1818]'
                    : 'top-2 text-base text-gray-600'
                    }`}
            >
                {label}
            </label>
        </div>
    );
};

export { FloatingInput };