import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { BottomNav } from '../components/BottomNav';
export function HomePage() {
  const navigate = useNavigate();
  const userName = 'Amina'; // Placeholder
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
  return <div className="min-h-screen w-full bg-[#FFF8F0] pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2D5016] to-[#1B4965] px-4 py-6 texture-overlay">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1" style={{
            fontFamily: 'Quicksand'
          }}>
              Zefit
            </h1>
            <p className="text-[#FFF8F0] text-sm">
              Bonjour, {userName}! Let's thrive today.
            </p>
          </div>
          <motion.button whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} onClick={() => navigate('/settings')} className="w-12 h-12 rounded-full bg-[#F4A259] border-3 border-white overflow-hidden focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2D5016]">
            <div className="w-full h-full bg-cover bg-center" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop')"
          }} />
          </motion.button>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Personalized Recommendation Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-[#F4A259] to-[#C1502E] p-6">
            <div className="text-white">
              <p className="text-sm font-medium mb-2">TODAY'S FOCUS</p>
              <h3 className="text-xl font-bold mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                Core Blast - 20 min
              </h3>
              <p className="text-sm mb-4 opacity-90">
                Build strength from your center. Perfect for midday energy!
              </p>
              <button className="bg-white text-[#C1502E] px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all">
                Start Now
              </button>
            </div>
          </Card>
        </motion.div>

        {/* African Proverb */}
        <motion.div variants={itemVariants} className="text-center py-4">
          <p className="text-[#2D5016] italic text-sm">
            "A healthy person has a thousand wishes, but a sick person has only
            one."
          </p>
          <p className="text-gray-500 text-xs mt-1">— African Proverb</p>
        </motion.div>

        {/* Main Navigation Cards */}
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card hoverable onClick={() => navigate('/sports')} backgroundImage="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop" className="h-48">
              <div className="h-full flex items-end p-6">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2" style={{
                  fontFamily: 'Quicksand'
                }}>
                    SPORTS
                  </h2>
                  <p className="text-sm opacity-90">
                    Build strength, endurance & flexibility
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hoverable onClick={() => navigate('/nutrition')} backgroundImage="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=400&fit=crop" className="h-48">
              <div className="h-full flex items-end p-6">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2" style={{
                  fontFamily: 'Quicksand'
                }}>
                    NUTRITION
                  </h2>
                  <p className="text-sm opacity-90">
                    Fuel your body with authentic flavors
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hoverable onClick={() => navigate('/everyday-fit')} backgroundImage="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop" className="h-48">
              <div className="h-full flex items-end p-6">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2" style={{
                  fontFamily: 'Quicksand'
                }}>
                    EVERYDAY FIT
                  </h2>
                  <p className="text-sm opacity-90">
                    Mindfulness, rest & daily moments
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <BottomNav />
    </div>;
}