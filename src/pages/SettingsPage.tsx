import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { BottomNav } from '../components/BottomNav';
import { UserIcon, MailIcon, LockIcon, GlobeIcon, BellIcon, ShieldIcon, HelpCircleIcon, LogOutIcon, ChevronRightIcon, EditIcon, AwardIcon, TrendingUpIcon, CalendarIcon } from 'lucide-react';
export function SettingsPage() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  // User data (placeholder)
  const user = {
    name: 'Amina Nkosi',
    email: 'amina.nkosi@zefit.cm',
    bio: 'Wellness enthusiast | Ndolé lover | Finding balance every day',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
    stats: {
      streak: 6,
      workoutsCompleted: 42,
      mealsLogged: 156,
      memberSince: 'Jan 2024'
    }
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  const SettingRow = ({
    icon: Icon,
    label,
    value,
    onClick,
    showChevron = true
  }: {
    icon: any;
    label: string;
    value?: string;
    onClick?: () => void;
    showChevron?: boolean;
  }) => <motion.button whileTap={{
    scale: 0.98
  }} onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-[#FFF8F0] transition-colors rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2D5016]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#E8E4E1] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#2D5016]" />
        </div>
        <div className="text-left">
          <p className="font-medium text-[#2D5016]">{label}</p>
          {value && <p className="text-sm text-gray-500">{value}</p>}
        </div>
      </div>
      {showChevron && <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
    </motion.button>;
  const ToggleRow = ({
    icon: Icon,
    label,
    description,
    enabled,
    onToggle
  }: {
    icon: any;
    label: string;
    description?: string;
    enabled: boolean;
    onToggle: () => void;
  }) => <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-[#E8E4E1] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#2D5016]" />
        </div>
        <div>
          <p className="font-medium text-[#2D5016]">{label}</p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <motion.button onClick={onToggle} className={`relative w-12 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:ring-offset-2 ${enabled ? 'bg-[#2D5016]' : 'bg-gray-300'}`} whileTap={{
      scale: 0.95
    }}>
        <motion.div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md" animate={{
        x: enabled ? 20 : 0
      }} transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30
      }} />
      </motion.button>
    </div>;
  return <div className="min-h-screen w-full bg-[#FFF8F0] pb-24">
      <Header title="SETTINGS" showBack={true} />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-[#2D5016] via-[#1B4965] to-[#2D5016] p-6 texture-overlay">
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[#F4A259] overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <motion.button whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }} className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#F4A259] rounded-full flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-white">
                    <EditIcon className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1" style={{
                  fontFamily: 'Quicksand'
                }}>
                    {user.name}
                  </h2>
                  <p className="text-[#FFF8F0] text-sm opacity-90 mb-2">
                    {user.bio}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#F4A259]">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Member since {user.stats.memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div initial={{
                scale: 0,
                opacity: 0
              }} animate={{
                scale: 1,
                opacity: 1
              }} transition={{
                delay: 0.2,
                type: 'spring'
              }} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <AwardIcon className="w-5 h-5 text-[#F4A259]" />
                  </div>
                  <motion.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  delay: 0.4
                }} className="text-2xl font-bold text-white">
                    {user.stats.streak}
                  </motion.div>
                  <div className="text-xs text-[#FFF8F0] opacity-75">
                    Day Streak
                  </div>
                </motion.div>

                <motion.div initial={{
                scale: 0,
                opacity: 0
              }} animate={{
                scale: 1,
                opacity: 1
              }} transition={{
                delay: 0.3,
                type: 'spring'
              }} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUpIcon className="w-5 h-5 text-[#F4A259]" />
                  </div>
                  <motion.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  delay: 0.5
                }} className="text-2xl font-bold text-white">
                    {user.stats.workoutsCompleted}
                  </motion.div>
                  <div className="text-xs text-[#FFF8F0] opacity-75">
                    Workouts
                  </div>
                </motion.div>

                <motion.div initial={{
                scale: 0,
                opacity: 0
              }} animate={{
                scale: 1,
                opacity: 1
              }} transition={{
                delay: 0.4,
                type: 'spring'
              }} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CalendarIcon className="w-5 h-5 text-[#F4A259]" />
                  </div>
                  <motion.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  delay: 0.6
                }} className="text-2xl font-bold text-white">
                    {user.stats.mealsLogged}
                  </motion.div>
                  <div className="text-xs text-[#FFF8F0] opacity-75">Meals</div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Settings */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-[#2D5016] mb-3 px-2" style={{
          fontFamily: 'Quicksand'
        }}>
            Account
          </h3>
          <Card className="bg-white">
            <SettingRow icon={MailIcon} label="Email" value={user.email} onClick={() => alert('Edit email')} />
            <div className="border-t border-[#E8E4E1]" />
            <SettingRow icon={LockIcon} label="Password" value="••••••••" onClick={() => alert('Change password')} />
            <div className="border-t border-[#E8E4E1]" />
            <SettingRow icon={GlobeIcon} label="Language" value="English" onClick={() => alert('Change language')} />
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-[#2D5016] mb-3 px-2" style={{
          fontFamily: 'Quicksand'
        }}>
            Preferences
          </h3>
          <Card className="bg-white">
            <SettingRow icon={TrendingUpIcon} label="Units" value="Metric (kg, cm)" onClick={() => alert('Change units')} />
            <div className="border-t border-[#E8E4E1]" />
            <SettingRow icon={BellIcon} label="Workout Reminders" value="Daily at 7:00 AM" onClick={() => alert('Set reminders')} />
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-[#2D5016] mb-3 px-2" style={{
          fontFamily: 'Quicksand'
        }}>
            Notifications
          </h3>
          <Card className="bg-white">
            <ToggleRow icon={BellIcon} label="Push Notifications" description="Get reminders and updates" enabled={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
            <div className="border-t border-[#E8E4E1]" />
            <ToggleRow icon={MailIcon} label="Email Updates" description="Weekly wellness tips" enabled={emailUpdates} onToggle={() => setEmailUpdates(!emailUpdates)} />
          </Card>
        </motion.div>

        {/* Privacy & Support */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-[#2D5016] mb-3 px-2" style={{
          fontFamily: 'Quicksand'
        }}>
            Privacy & Support
          </h3>
          <Card className="bg-white">
            <SettingRow icon={ShieldIcon} label="Privacy Policy" onClick={() => alert('View privacy policy')} />
            <div className="border-t border-[#E8E4E1]" />
            <SettingRow icon={HelpCircleIcon} label="Help & Support" onClick={() => alert('Get help')} />
            <div className="border-t border-[#E8E4E1]" />
            <SettingRow icon={UserIcon} label="About Zefit" value="Version 1.0.0" onClick={() => alert('About Zefit')} />
          </Card>
        </motion.div>

        {/* Logout Button */}
        <motion.div variants={itemVariants}>
          <motion.button whileTap={{
          scale: 0.98
        }} onClick={() => {
          if (confirm('Are you sure you want to log out?')) {
            navigate('/');
          }
        }} className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl border-2 border-[#C1502E] text-[#C1502E] font-medium hover:bg-[#C1502E] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1502E] focus:ring-offset-2">
            <LogOutIcon className="w-5 h-5" />
            <span>Log Out</span>
          </motion.button>
        </motion.div>
      </motion.div>

      <BottomNav />
    </div>;
}