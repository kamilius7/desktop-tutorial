import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { BottomNav } from '../components/BottomNav';
import { PlusIcon, X } from 'lucide-react';

export function SportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  // 3D-inspired animation variants for exercises
  const exerciseItemVariants = {
    hidden: { opacity: 0, y: 20, rotateX: 90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: { opacity: 0, y: -20, rotateX: -90 }
  };

  const animationVariants = {
    cardio: {
      initial: { y: -30, opacity: 0 },
      animate: { y: [0, -20, 0], opacity: 1 },
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    },
    core: {
      initial: { rotate: 0, opacity: 0 },
      animate: { rotate: [0, 15, -15, 0], opacity: 1 },
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    },
    upperBody: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: [1, 1.1, 1], opacity: 1 },
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    },
    lowerBody: {
      initial: { scaleY: 0.8, opacity: 0 },
      animate: { scaleY: [1, 0.8, 1], opacity: 1 },
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    },
    flexibility: {
      initial: { rotate: 0, opacity: 0 },
      animate: { rotate: [0, 20, -20, 0], opacity: 1 },
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  const getAnimationVariant = (index: number) => {
    const variants = [
      animationVariants.cardio,
      animationVariants.core,
      animationVariants.upperBody,
      animationVariants.lowerBody,
      animationVariants.flexibility
    ];
    return variants[index];
  };

  const workoutCategories = [{
    title: 'CARDIO',
    subtitle: 'Boost your endurance!',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=400&fit=crop',
    color: 'from-[#C1502E] to-[#F4A259]',
    emoji: '🏃',
    lottieUrl: 'https://lottie.host/2d9e4d5d-3e7e-4e8b-8e8d-8d8d8d8d8d8d/kR8Zq5Q8oV.json',
    exercises: [
      { name: 'Jumping Jacks', duration: '30s', intensity: 'High', imageUrl: 'https://images.unsplash.com/photo-1587433093163-49f2914e17e7' },
      { name: 'High Knees', duration: '30s', intensity: 'High', imageUrl: 'https://i.ytimg.com/vi/tx5rgpDAJRI/hqdefault.jpg' },
      { name: 'Butt Kicks', duration: '30s', intensity: 'Medium', imageUrl: 'https://i.ytimg.com/vi/g-b-jGk_G8M/hqdefault.jpg' },
      { name: 'Jump Rope', duration: '45s', intensity: 'High', imageUrl: 'https://images.unsplash.com/photo-1599557633245-224a180f28b1' }
    ]
  }, {
    title: 'CORE',
    subtitle: 'Strengthen your center.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    color: 'from-[#2D5016] to-[#1B4965]',
    emoji: '💪',
    lottieUrl: 'https://lottie.host/d4f5c8a2-8e7e-4c9d-9e8d-8d8d8d8d8d8d/nJ2Xq5M8pW.json',
    exercises: [
      { name: 'Plank Hold', duration: '45s', intensity: 'Medium', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b' },
      { name: 'Crunches', duration: '30s', intensity: 'Medium', imageUrl: 'https://i.ytimg.com/vi/Xyd_fa5zoEU/hqdefault.jpg' },
      { name: 'Russian Twists', duration: '40s', intensity: 'High', imageUrl: 'https://i.ytimg.com/vi/DJQ1-t92-aA/hqdefault.jpg' },
      { name: 'Bicycle Crunches', duration: '30s', intensity: 'High', imageUrl: 'https://i.ytimg.com/vi/9_4f8t-2H0Y/hqdefault.jpg' }
    ]
  }, {
    title: 'UPPER BODY',
    subtitle: 'Build functional power.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=400&fit=crop',
    color: 'from-[#1B4965] to-[#2D5016]',
    emoji: '🤸',
    lottieUrl: 'https://lottie.host/a3e2b9c1-7d6e-4b8c-8d7c-7c7c7c7c7c7c/mK3Yp6N9qX.json',
    exercises: [
      { name: 'Push-ups', duration: '30s', intensity: 'High', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
      { name: 'Tricep Dips', duration: '30s', intensity: 'High', imageUrl: 'https://i.ytimg.com/vi/0326dy_-CzM/hqdefault.jpg' },
      { name: 'Shoulder Press', duration: '40s', intensity: 'Medium', imageUrl: 'https://i.ytimg.com/vi/B-aVuyhvLHU/hqdefault.jpg' },
      { name: 'Arm Circles', duration: '30s', intensity: 'Low', imageUrl: 'https://i.ytimg.com/vi/v_Z-v-f-h6c/hqdefault.jpg' }
    ]
  }, {
    title: 'LOWER BODY',
    subtitle: 'Ground your strength.',
    image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&h=400&fit=crop',
    color: 'from-[#F4A259] to-[#C1502E]',
    emoji: '🦵',
    lottieUrl: 'https://lottie.host/c5g7h9j2-9f8g-5d0e-0f9g-9g9g9g9g9g9g/oL4Zr7O0sY.json',
    exercises: [
      { name: 'Squats', duration: '40s', intensity: 'High', imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e' },
      { name: 'Lunges', duration: '45s', intensity: 'High', imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e' },
      { name: 'Leg Raises', duration: '30s', intensity: 'Medium', imageUrl: 'https://i.ytimg.com/vi/l4kQd9eWJmk/hqdefault.jpg' },
      { name: 'Calf Raises', duration: '30s', intensity: 'Low', imageUrl: 'https://i.ytimg.com/vi/3-v124-T0pI/hqdefault.jpg' }
    ]
  }, {
    title: 'FLEXIBILITY & MOBILITY',
    subtitle: 'Move with grace.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop',
    color: 'from-[#2D5016] to-[#F4A259]',
    emoji: '🧘',
    lottieUrl: 'https://lottie.host/e7i9k1l4-1h0i-7f2g-2g1h-1h1h1h1h1h1h/pM5As8P1tZ.json',
    exercises: [
      { name: 'Hamstring Stretch', duration: '30s', intensity: 'Low', imageUrl: 'https://i.ytimg.com/vi/kL_NAdsM-w4/hqdefault.jpg' },
      { name: 'Quad Stretch', duration: '30s', intensity: 'Low', imageUrl: 'https://i.ytimg.com/vi/pcca-p-o_1g/hqdefault.jpg' },
      { name: 'Cat-Cow Stretch', duration: '45s', intensity: 'Low', imageUrl: 'https://i.ytimg.com/vi/t5Nmf-G8j4w/hqdefault.jpg' },
      { name: 'Full Body Twist', duration: '30s', intensity: 'Low', imageUrl: 'https://i.ytimg.com/vi/5-0-4_v_c-s/hqdefault.jpg' }
    ]
  }];

  return (
    <div className="min-h-screen w-full bg-[#FFF8F0] pb-24">
      <Header title="SPORTS" showBack={true} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Motivational Quote */}
        <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-gradient-to-r from-[#2D5016] to-[#1B4965] rounded-2xl p-6 mb-6 texture-overlay">
          <p className="text-white text-center italic text-lg relative z-10">
            "The body achieves what the mind believes."
          </p>
        </motion.div>

        {/* Workout Categories with 3D Animations */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {workoutCategories.map((category, index) => (
            <motion.div key={index} variants={itemVariants}>
              <motion.div
                onClick={() => setSelectedCategory(index)}
                className="cursor-pointer relative overflow-hidden rounded-2xl h-40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card hoverable backgroundImage={category.image} className="h-40">
                  <div className="h-full flex items-end p-6 relative z-10">
                    <motion.div
                      className="text-white"
                      {...getAnimationVariant(index)}
                    >
                      <h3 className="text-2xl font-bold mb-1" style={{
                        fontFamily: 'Quicksand'
                      }}>
                        {category.title}
                      </h3>
                      <p className="text-sm opacity-90">{category.subtitle}</p>
                    </motion.div>
                  </div>

                  {/* Animated background pulse */}
                  <motion.div
                    className="absolute inset-0 bg-black opacity-0 pointer-events-none"
                    animate={{
                      opacity: [0, 0.1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  />
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Coach Recommended */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }} className="mt-8">
          <h3 className="text-xl font-bold text-[#2D5016] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
            Coach Recommended
          </h3>
          <Card className="bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F4A259] to-[#C1502E] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">20</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">Full Body Strength</h4>
                <p className="text-gray-600 text-sm mb-3">
                  A balanced routine combining upper, lower, and core exercises
                </p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="bg-[#E8E4E1] px-3 py-1 rounded-full">
                    20 min
                  </span>
                  <span className="bg-[#E8E4E1] px-3 py-1 rounded-full">
                    Intermediate
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedCategory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCategory(null)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end"
          >
            <motion.div
              initial={{ y: 500 }}
              animate={{ y: 0 }}
              exit={{ y: 500 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#2D5016]" style={{ fontFamily: 'Quicksand' }}>
                  {workoutCategories[selectedCategory].title}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Exercise Demonstrations */}
              <motion.div
                className={`bg-gradient-to-br ${workoutCategories[selectedCategory].color} rounded-2xl p-8 mb-6 text-center min-h-48 flex items-center justify-center overflow-hidden relative`}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,0,0,0.1)',
                    '0 0 40px rgba(0,0,0,0.2)',
                    '0 0 20px rgba(0,0,0,0.1)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {selectedExercise ? (
                  <img src={selectedExercise.imageUrl} alt={selectedExercise.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      {/* Fallback Emoji Animation */}
                      <motion.div
                        className="text-8xl"
                        {...getAnimationVariant(selectedCategory)}
                      >
                        {workoutCategories[selectedCategory].emoji}
                      </motion.div>
                      <p className="text-white text-sm mt-4 font-semibold">
                        {workoutCategories[selectedCategory].title} in progress...
                      </p>
                    </motion.div>
                  </div>
                )}
              </motion.div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#2D5016]" style={{ fontFamily: 'Quicksand' }}>
                  Exercises
                </h3>

                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                >
                  {workoutCategories[selectedCategory].exercises.map((exercise, idx) => (
                    <motion.div
                      key={idx}
                      variants={exerciseItemVariants}
                      className="bg-[#FFF8F0] border-2 border-[#E8E4E1] rounded-xl p-4 hover:border-[#2D5016] transition-colors"
                      whileHover={{ x: 5 }}
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-[#2D5016]">{exercise.name}</h4>
                          <p className="text-sm text-gray-600">Duration: {exercise.duration}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          exercise.intensity === 'High'
                            ? 'bg-[#C1502E] text-white'
                            : exercise.intensity === 'Medium'
                            ? 'bg-[#F4A259] text-white'
                            : 'bg-[#2D5016] text-white'
                        }`}>
                          {exercise.intensity}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-[#2D5016] to-[#1B4965] text-white font-bold py-3 rounded-2xl mt-6"
                >
                  Start {workoutCategories[selectedCategory].title} Workout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button whileHover={{
      scale: 1.05
    }} whileTap={{
      scale: 0.95
    }} className="fixed bottom-28 right-6 w-14 h-14 bg-[#C1502E] rounded-full shadow-lg flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-[#C1502E] focus:ring-offset-2">
        <PlusIcon className="w-6 h-6" />
      </motion.button>

      <BottomNav />
    </div>
  );
}