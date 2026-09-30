'use client';

import React, { useState } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { ArrowRight, Check } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const OnboardingModal: React.FC = () => {
  const { signupWithProvider, allUsers, loginUser } = useMacroTracker();

  const [step, setStep] = useState<'auth' | 'goals'>('auth');
  const [selectedProvider, setSelectedProvider] = useState<'apple' | 'google' | 'email'>('apple');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Personalized Goals Setup
  const [calorieGoal, setCalorieGoal] = useState('2400');
  const [proteinGoal, setProteinGoal] = useState('180');
  const [weightInput, setWeightInput] = useState('175');

  // Existing account switcher
  const [showAccountList, setShowAccountList] = useState(false);

  const handleProviderSelect = (provider: 'apple' | 'google' | 'email') => {
    triggerHaptic('light');
    setSelectedProvider(provider);
    if (provider === 'apple') {
      setNameInput('Apple User');
      setEmailInput('user@icloud.com');
      setStep('goals');
    } else if (provider === 'google') {
      setNameInput('Google User');
      setEmailInput('user@gmail.com');
      setStep('goals');
    } else {
      // Email flow
      if (!emailInput || !emailInput.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      setNameInput(emailInput.split('@')[0]);
      setStep('goals');
    }
  };

  const handleCompleteSetup = () => {
    triggerHaptic('success');
    const calories = parseInt(calorieGoal) || 2400;
    const protein = parseInt(proteinGoal) || 180;
    const weight = parseFloat(weightInput) || 175;

    signupWithProvider(
      selectedProvider,
      emailInput || `${selectedProvider}_user@macrotrack.app`,
      nameInput || 'Athlete',
      {
        dailyCalories: calories,
        dailyProtein: protein,
        dailyCarbs: Math.round((calories * 0.45) / 4),
        dailyFat: Math.round((calories * 0.25) / 9),
        dailyWaterMl: 3000,
      },
      {
        name: nameInput || 'Athlete',
        currentWeightLbs: weight,
        targetWeightLbs: weight,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 text-white font-sans selection:bg-white selection:text-black">
      {step === 'auth' ? (
        <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full py-8">
          {/* Top Brand Header */}
          <div className="pt-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-500 block mb-2">
              PRECISION NUTRITION
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase leading-none">
              MACRO<br />TRACK
            </h1>
            <p className="text-sm font-medium text-zinc-400 mt-4 leading-relaxed">
              Minimalist, high-speed macro tracking powered by multimodal visual AI.
            </p>
          </div>

          {/* Center / Auth Options */}
          <div className="space-y-3 my-8">
            {/* Sign in with Apple */}
            <button
              onClick={() => handleProviderSelect('apple')}
              className="w-full py-4 px-5 rounded-2xl bg-white text-black font-extrabold text-sm flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-2xl"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-5.99-9.13-10.83-19.99-14.54-32.58-3.71-12.6-5.56-24.31-5.56-35.14 0-14.89 3.69-27.42 11.07-37.59 7.39-10.17 16.74-15.35 28.05-15.55 4.35 0 9.29 1.15 14.81 3.44 5.53 2.29 9.38 3.5 11.56 3.64 1.74-.14 5.75-1.4 12.04-3.78 6.3-2.38 11.75-3.4 16.35-3.07 12.62.9 22.84 5.48 30.65 13.73-10.98 6.64-16.35 15.82-16.1 27.53.25 9.25 3.73 17.07 10.45 23.46 6.72 6.39 14.77 10.02 24.15 10.88-2.23 6.96-5.06 14.34-8.51 22.13zM119.22 33.15c0-7.38 2.65-14.34 7.96-20.89 5.3-6.55 11.97-10.85 20-12.91.43 2.28.65 4.45.65 6.51 0 7.38-2.73 14.47-8.19 21.28-5.46 6.81-12.27 11.07-20.42 12.78v-6.77z" />
              </svg>
              <span>Sign up with Apple</span>
            </button>

            {/* Sign in with Google */}
            <button
              onClick={() => handleProviderSelect('google')}
              className="w-full py-4 px-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-extrabold text-sm flex items-center justify-center gap-3 transition-transform active:scale-[0.98] hover:bg-zinc-800"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.53 0 2.925.57 4.005 1.515l2.4-2.4C16.89 3.45 14.685 2.5 12.24 2.5 7.02 2.5 2.76 6.76 2.76 12s4.26 9.5 9.48 9.5c5.445 0 9.075-3.825 9.075-9.24 0-.645-.06-1.275-.18-1.975H12.24z" />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Email input toggle */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-medium"
                />
                <button
                  onClick={() => handleProviderSelect('email')}
                  disabled={!emailInput}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl text-xs font-bold text-white transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>

          {/* Existing Accounts selector */}
          <div className="pt-4 border-t border-zinc-900 text-center">
            {allUsers && allUsers.length > 0 ? (
              <div>
                <button
                  onClick={() => setShowAccountList(!showAccountList)}
                  className="text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  {showAccountList ? 'Hide Existing Accounts' : `Switch to Existing Account (${allUsers.length})`}
                </button>

                {showAccountList && (
                  <div className="mt-3 space-y-1.5 text-left">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => loginUser(u.id)}
                        className="w-full p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between text-xs transition-all"
                      >
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <span className="text-[10px] text-zinc-500 capitalize">{u.provider} • {u.email}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-600">
                New accounts start completely fresh with zero logged foods.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* STEP 2: Personalized Goals Setup */
        <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full py-8">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-500 block mb-2">
              STEP 2 OF 2
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase">
              YOUR TARGETS
            </h2>
            <p className="text-xs text-zinc-400 mt-2">
              Configure your personal goals. You can adjust these at any time in Profile.
            </p>

            <div className="space-y-4 mt-8">
              {/* Name */}
              <div>
                <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider block mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-white"
                />
              </div>

              {/* Protein Target (Super prominent) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] uppercase font-bold text-white tracking-wider">
                    Daily Protein Target
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">Grams / Day</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={proteinGoal}
                    onChange={(e) => setProteinGoal(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-white rounded-xl px-4 py-3.5 text-2xl font-black text-white focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                    g
                  </span>
                </div>
              </div>

              {/* Calorie Target */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                    Daily Calorie Target
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">kcal</span>
                </div>
                <input
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-white"
                />
              </div>

              {/* Current Weight */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                    Current Weight
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">lbs</span>
                </div>
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 flex gap-3">
            <button
              onClick={() => setStep('auth')}
              className="py-4 px-5 rounded-2xl bg-zinc-900 text-zinc-400 font-bold text-xs"
            >
              Back
            </button>
            <button
              onClick={handleCompleteSetup}
              className="flex-1 py-4 px-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-2xl"
            >
              <Check className="w-4 h-4 stroke-[3.5px]" />
              <span>Enter MacroTrack</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
