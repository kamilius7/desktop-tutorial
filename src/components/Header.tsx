import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}
export function Header({
  title,
  showBack = true,
  rightElement
}: HeaderProps) {
  const navigate = useNavigate();
  return <motion.header initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="sticky top-0 z-50 bg-[#FFF8F0] border-b border-[#E8E4E1] px-4 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {showBack && <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[#E8E4E1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D5016]">
              <ArrowLeftIcon className="w-6 h-6 text-[#2D5016]" />
            </button>}
          <h1 className="text-2xl font-bold text-[#2D5016]">{title}</h1>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </motion.header>;
}