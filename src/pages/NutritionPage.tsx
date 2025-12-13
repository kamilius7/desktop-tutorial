import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { BottomNav } from '../components/BottomNav';
import { SearchIcon, SunriseIcon, SunIcon, MoonIcon, AppleIcon } from 'lucide-react';
export function NutritionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const cameroonianDishes = [{
    name: 'Ndolé',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    calories: 320,
    protein: 18
  }, {
    name: 'Eru',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    calories: 280,
    protein: 15
  }, {
    name: 'Achu Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    calories: 350,
    protein: 20
  }, {
    name: 'Koki',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=300&fit=crop',
    calories: 240,
    protein: 12
  }, {
    name: 'Fufu',
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop',
    calories: 380,
    protein: 8
  }];
  const localProduce = [{
    name: 'Plantain',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop'
  }, {
    name: 'Mango',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop'
  }, {
    name: 'Avocado',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop'
  }, {
    name: 'Okra',
    image: 'https://images.unsplash.com/photo-1597868165956-03a6827955b1?w=300&h=300&fit=crop'
  }];
  return <div className="min-h-screen w-full bg-[#FFF8F0] pb-24">
      <Header title="NUTRITION" showBack={true} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Daily Summary */}
        <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }}>
          <Card className="bg-gradient-to-br from-[#2D5016] to-[#1B4965] p-6">
            <h3 className="text-white font-bold text-lg mb-4" style={{
            fontFamily: 'Quicksand'
          }}>
              Today's Goals
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#F4A259]">1,450</div>
                <div className="text-white text-xs mt-1">Calories Left</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#F4A259]">65g</div>
                <div className="text-white text-xs mt-1">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#F4A259]">180g</div>
                <div className="text-white text-xs mt-1">Carbs</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search & Log Meal */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }}>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="What did you eat?" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-[#E8E4E1] focus:border-[#2D5016] focus:outline-none transition-colors bg-white" />
          </div>

          {/* Meal Time Quick Add */}
          <div className="flex gap-3 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-[#E8E4E1] hover:border-[#F4A259] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4A259]">
              <SunriseIcon className="w-4 h-4 text-[#F4A259]" />
              <span className="text-sm font-medium">Breakfast</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-[#E8E4E1] hover:border-[#C1502E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1502E]">
              <SunIcon className="w-4 h-4 text-[#C1502E]" />
              <span className="text-sm font-medium">Lunch</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-[#E8E4E1] hover:border-[#1B4965] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4965]">
              <MoonIcon className="w-4 h-4 text-[#1B4965]" />
              <span className="text-sm font-medium">Dinner</span>
            </button>
          </div>
        </motion.div>

        {/* Cameroonian Staples */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2D5016]" style={{
            fontFamily: 'Quicksand'
          }}>
              Cameroonian Staples
            </h3>
            <button className="text-sm text-[#C1502E] font-medium">
              See All
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {cameroonianDishes.map((dish, index) => <motion.div key={index} initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.3 + index * 0.05
          }} className="flex-shrink-0 w-48">
                <Card hoverable className="bg-white overflow-hidden">
                  <div className="h-32 bg-cover bg-center" style={{
                backgroundImage: `url(${dish.image})`
              }} />
                  <div className="p-4">
                    <h4 className="font-bold text-[#2D5016] mb-2">
                      {dish.name}
                    </h4>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{dish.calories} cal</span>
                      <span>{dish.protein}g protein</span>
                    </div>
                    <button className="w-full mt-3 py-2 bg-[#F4A259] text-white rounded-full text-sm font-medium hover:bg-[#e89347] transition-colors">
                      Add to Log
                    </button>
                  </div>
                </Card>
              </motion.div>)}
          </div>
        </motion.div>

        {/* Local Fruits & Vegetables */}
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
            Fresh Local Produce
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {localProduce.map((item, index) => <motion.div key={index} initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.5 + index * 0.05
          }}>
                <Card hoverable className="bg-white overflow-hidden">
                  <div className="h-32 bg-cover bg-center" style={{
                backgroundImage: `url(${item.image})`
              }} />
                  <div className="p-3">
                    <h4 className="font-bold text-[#2D5016] text-center">
                      {item.name}
                    </h4>
                  </div>
                </Card>
              </motion.div>)}
          </div>
        </motion.div>

        {/* Cultural Factoid */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.6
      }}>
          <Card className="bg-gradient-to-r from-[#F4A259] to-[#C1502E] p-5">
            <div className="flex items-start gap-3">
              <AppleIcon className="w-6 h-6 text-white flex-shrink-0 mt-1" />
              <div className="text-white">
                <h4 className="font-bold mb-1">Did you know?</h4>
                <p className="text-sm opacity-90">
                  Ndolé, made with bitter leaves and groundnuts, is Cameroon's
                  national dish and packed with iron and protein!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>;
}