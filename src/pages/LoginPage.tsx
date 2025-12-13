import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
export function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/home');
  };
  return <div className="min-h-screen w-full bg-gradient-to-br from-[#2D5016] via-[#1B4965] to-[#C1502E] relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10 texture-overlay" />

      {/* Decorative organic shapes */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-[#F4A259] rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#2D5016] rounded-full opacity-20 blur-3xl" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="w-full max-w-md">
          {/* Hero illustration area */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.2,
          duration: 0.5
        }} className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-5xl font-bold text-white mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                Zefit
              </h1>
              <p className="text-[#FFF8F0] text-lg">Nourish. Move. Thrive.</p>
            </div>

            {/* Illustration placeholder - represents diverse people in nature */}
            <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#F4A259] to-[#C1502E] p-1">
              <div className="w-full h-full rounded-full bg-cover bg-center" style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop')"
            }} />
            </div>

            <p className="text-[#FFF8F0] text-sm max-w-sm mx-auto">
              Welcome to Zefit: Your path to holistic wellness, inspired by
              Cameroon
            </p>
          </motion.div>

          {/* Login/Signup Form */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4,
          duration: 0.5
        }} className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex gap-2 mb-6">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-full font-medium transition-all ${isLogin ? 'bg-[#2D5016] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Login
              </button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-full font-medium transition-all ${!isLogin ? 'bg-[#2D5016] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input type="email" placeholder="Your journey begins here..." className="w-full px-4 py-3 rounded-2xl border-2 border-[#E8E4E1] focus:border-[#2D5016] focus:outline-none transition-colors" required />
              </div>

              <div>
                <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-2xl border-2 border-[#E8E4E1] focus:border-[#2D5016] focus:outline-none transition-colors" required />
              </div>

              {!isLogin && <div>
                  <input type="password" placeholder="Confirm Password" className="w-full px-4 py-3 rounded-2xl border-2 border-[#E8E4E1] focus:border-[#2D5016] focus:outline-none transition-colors" required />
                </div>}

              <Button type="submit" fullWidth>
                {isLogin ? 'Welcome Back' : 'Join the Zefit Family'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E4E1]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#E8E4E1] rounded-2xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D5016]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-medium">Google</span>
                </button>

                <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#E8E4E1] rounded-2xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D5016]">
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer">
                <option>English</option>
                <option>Français</option>
              </select>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>;
}