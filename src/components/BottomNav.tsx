
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, ActivityIcon, AppleIcon, SparklesIcon, SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [{
    icon: HomeIcon,
    label: 'Home',
    path: '/home'
  }, {
    icon: ActivityIcon,
    label: 'Sports',
    path: '/sports'
  }, {
    icon: AppleIcon,
    label: 'Nutrition',
    path: '/nutrition'
  }, {
    icon: SparklesIcon,
    label: 'Everyday',
    path: '/everyday-fit'
  }, {
    icon: SettingsIcon,
    label: 'Settings',
    path: '/settings'
  }];
  return <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E4E1] px-4 py-3 z-50">
      <div className="flex justify-around items-center max-w-7xl mx-auto">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return <motion.button key={item.path} whileTap={{
          scale: 0.9
        }} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D5016]">
              <Icon className={`w-6 h-6 ${isActive ? 'text-[#2D5016]' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs ${isActive ? 'text-[#2D5016] font-semibold' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </motion.button>;
      })}
      </div>
    </nav>;
}