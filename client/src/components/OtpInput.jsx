import React, { useRef } from 'react';

export default function OtpInput({ value = '', onChange, length = 6 }) {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const otpArray = value.split('');
    otpArray[index] = val;
    const newOtp = otpArray.join('');
    onChange(newOtp);

    // Auto move focus to next input
    if (val && index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0 && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 text-center text-2xl font-black bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-white outline-none transition"
        />
      ))}
    </div>
  );
}
