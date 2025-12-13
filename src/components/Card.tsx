import React from 'react';
import { motion } from 'framer-motion';
interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
  backgroundImage?: string;
}
export function Card({
  children,
  onClick,
  className = '',
  hoverable = false,
  backgroundImage
}: CardProps) {
  const baseStyles = 'rounded-3xl shadow-lg overflow-hidden relative';
  const interactiveStyles = hoverable ? 'cursor-pointer' : '';
  const hoverAnimation = hoverable ? {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  } : {};
  return <motion.div whileHover={hoverAnimation} onClick={onClick} className={`${baseStyles} ${interactiveStyles} ${className}`} style={backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {}}>
      {children}
    </motion.div>;
}