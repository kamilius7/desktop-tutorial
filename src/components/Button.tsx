import React from 'react';
import { motion } from 'framer-motion';
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
export function Button({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    primary: 'bg-[#2D5016] text-white hover:bg-[#1f3810] focus:ring-[#2D5016]',
    secondary: 'bg-[#C1502E] text-white hover:bg-[#a03d1f] focus:ring-[#C1502E]',
    outline: 'border-2 border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016] hover:text-white focus:ring-[#2D5016]'
  };
  const widthStyle = fullWidth ? 'w-full' : '';
  return <motion.button whileTap={{
    scale: 0.97
  }} onClick={onClick} type={type} className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}>
      {children}
    </motion.button>;
}