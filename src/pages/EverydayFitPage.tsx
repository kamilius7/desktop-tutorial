import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { BottomNav } from '../components/BottomNav';
import { CameraIcon, HeartIcon, SparklesIcon, DropletIcon, MoonIcon } from 'lucide-react';
export function EverydayFitPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const dailyPhotos = [{
    date: 'Today',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop',
    caption: 'Morning stretch by the lake'
  }, {
    date: 'Yesterday',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    caption: 'Peaceful meditation'
  }, {
    date: '2 days ago',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop',
    caption: 'Gratitude journal time'
  }, {
    date: '3 days ago',
    image: 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=400&h=400&fit=crop',
    caption: 'Nature walk'
  }, {
    date: '4 days ago',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop',
    caption: 'Evening relaxation'
  }, {
    date: '5 days ago',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop',
    caption: 'Mindful moment'
  }];
  const prompts = ['Upload a photo of your mindful moment today.', 'How did you feel after your relaxation session?', 'What small win did you have today?', 'Share a photo that brings you joy.'];
  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);
  return <div className="min-h-screen w-full bg-[#FFF8F0] pb-24">
      <Header title="EVERYDAY FIT" showBack={true} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Today's Moment Prompt */}
        <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }}>
          <Card className="bg-gradient-to-br from-[#1B4965] to-[#2D5016] p-6 text-center">
            <SparklesIcon className="w-8 h-8 text-[#F4A259] mx-auto mb-3" />
            <h3 className="text-white text-lg font-bold mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              Today's Reflection
            </h3>
            <p className="text-white opacity-90 mb-4">{currentPrompt}</p>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} className="bg-[#F4A259] text-white px-8 py-3 rounded-full font-medium inline-flex items-center gap-2 hover:bg-[#e89347] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4A259] focus:ring-offset-2">
              <CameraIcon className="w-5 h-5" />
              Capture Moment
            </motion.button>
          </Card>
        </motion.div>

        {/* Wellness Streak */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }}>
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#2D5016]" style={{
              fontFamily: 'Quicksand'
            }}>
                Your Wellness Streak
              </h3>
              <div className="text-3xl font-bold text-[#C1502E]">6 days</div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(day => <motion.div key={day} initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              delay: 0.2 + day * 0.05
            }} className={`flex-1 h-2 rounded-full ${day <= 6 ? 'bg-gradient-to-r from-[#2D5016] to-[#F4A259]' : 'bg-[#E8E4E1]'}`} />)}
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Keep going! You're building a beautiful habit.
            </p>
          </Card>
        </motion.div>

        {/* Daily Photo Grid */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <h3 className="text-xl font-bold text-[#2D5016] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
            Your Journey
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {dailyPhotos.map((photo, index) => <motion.div key={index} initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.3 + index * 0.05
          }} onClick={() => setSelectedPhoto(index)}>
                <Card hoverable className="overflow-hidden cursor-pointer">
                  <div className="h-48 bg-cover bg-center" style={{
                backgroundImage: `url(${photo.image})`
              }} />
                  <div className="p-3 bg-white">
                    <p className="text-xs text-gray-500 mb-1">{photo.date}</p>
                    <p className="text-sm font-medium text-[#2D5016]">
                      {photo.caption}
                    </p>
                  </div>
                </Card>
              </motion.div>)}
          </div>
        </motion.div>

        {/* Mindful Moments Section */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }}>
          <h3 className="text-xl font-bold text-[#2D5016] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
            Mindful Practices
          </h3>

          <div className="space-y-3">
            <Card hoverable className="bg-white p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B4965] to-[#2D5016] flex items-center justify-center flex-shrink-0">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#2D5016]">
                    Breathing Exercise
                  </h4>
                  <p className="text-sm text-gray-600">
                    5 min guided relaxation
                  </p>
                </div>
                <button className="text-[#C1502E] font-medium text-sm">
                  Start
                </button>
              </div>
            </Card>

            <Card hoverable className="bg-white p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F4A259] to-[#C1502E] flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#2D5016]">
                    Gentle Stretching
                  </h4>
                  <p className="text-sm text-gray-600">
                    10 min morning routine
                  </p>
                </div>
                <button className="text-[#C1502E] font-medium text-sm">
                  Start
                </button>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Quick Trackers */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }}>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-[#1B4965] to-[#2D5016] p-5 text-center">
              <DropletIcon className="w-8 h-8 text-[#F4A259] mx-auto mb-2" />
              <p className="text-white text-sm mb-1">Hydration</p>
              <p className="text-3xl font-bold text-white">6/8</p>
              <p className="text-white text-xs opacity-75">glasses</p>
            </Card>

            <Card className="bg-gradient-to-br from-[#2D5016] to-[#F4A259] p-5 text-center">
              <MoonIcon className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white text-sm mb-1">Sleep</p>
              <p className="text-3xl font-bold text-white">7.5</p>
              <p className="text-white text-xs opacity-75">hours</p>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto !== null && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={() => setSelectedPhoto(null)} className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <motion.div initial={{
          scale: 0.9
        }} animate={{
          scale: 1
        }} exit={{
          scale: 0.9
        }} className="max-w-2xl w-full">
              <img src={dailyPhotos[selectedPhoto].image} alt={dailyPhotos[selectedPhoto].caption} className="w-full rounded-2xl" />
              <div className="bg-white rounded-2xl p-4 mt-4">
                <p className="text-sm text-gray-500">
                  {dailyPhotos[selectedPhoto].date}
                </p>
                <p className="text-lg font-medium text-[#2D5016] mt-1">
                  {dailyPhotos[selectedPhoto].caption}
                </p>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      <BottomNav />
    </div>;
}