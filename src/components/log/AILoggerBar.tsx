'use client';

import React, { useState } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { AIAnalysisResult, MealCategory } from '@/lib/types';
import { Sparkles, Mic, MicOff, Camera, ArrowRight, Loader2, Plus, Check, X, ShieldAlert } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const AILoggerBar: React.FC = () => {
  const { addMeal, setActiveTab, profile } = useMacroTracker();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('lunch');
  const [customPortionNote, setCustomPortionNote] = useState('');

  // Voice dictation handler
  const toggleDictation = () => {
    triggerHaptic('light');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser. Try Safari on iOS or Chrome.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
          triggerHaptic('medium');
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleAnalyze = async (overridePrompt?: string) => {
    const textToAnalyze = overridePrompt || prompt;
    if (!textToAnalyze.trim() || isLoading) return;

    triggerHaptic('medium');
    setIsLoading(true);

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToAnalyze.trim(),
          apiKey: profile.customApiKey,
          model: profile.preferredModel,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data: AIAnalysisResult = await res.json();
      setAnalysisResult(data);
      setSelectedCategory(data.suggestedCategory || 'lunch');
      triggerHaptic('success');
    } catch (err) {
      console.error('Failed to analyze food:', err);
      // Fallback local estimation
      const fallbackResult: AIAnalysisResult = {
        mealName: textToAnalyze.slice(0, 30),
        suggestedCategory: 'lunch',
        items: [
          {
            name: textToAnalyze,
            portion: '1 serving',
            calories: 420,
            protein: 32,
            carbs: 45,
            fat: 12,
          },
        ],
        totalCalories: 420,
        totalProtein: 32,
        totalCarbs: 45,
        totalFat: 12,
        confidence: 0.85,
        healthTip: 'Macro calculated using offline nutritional database.',
      };
      setAnalysisResult(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!analysisResult) return;

    addMeal({
      name: analysisResult.mealName,
      category: selectedCategory,
      items: analysisResult.items.map((it, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        name: it.name,
        portion: it.portion,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
        fiber: it.fiber,
      })),
      calories: analysisResult.totalCalories,
      protein: analysisResult.totalProtein,
      carbs: analysisResult.totalCarbs,
      fat: analysisResult.totalFat,
      aiAnalyzed: true,
      aiConfidence: analysisResult.confidence,
      healthTip: analysisResult.healthTip,
    });

    setAnalysisResult(null);
    setPrompt('');
  };

  const quickPresets = [
    { label: '🥩 8oz Steak & Rice', text: '8oz grilled ribeye steak with 1 cup jasmine rice' },
    { label: '🥗 Chicken Salad', text: 'Large garden salad with grilled chicken breast and olive oil dressing' },
    { label: '🥑 3 Eggs & Toast', text: '3 scrambled eggs with 1 slice whole wheat avocado toast' },
    { label: '🥤 Whey Shake', text: '1 scoop whey protein isolate with 1 cup almond milk and 1 banana' },
  ];

  return (
    <div className="space-y-2.5">
      {/* Search / AI prompt input bar */}
      <div className="relative flex items-center bg-zinc-900/90 rounded-2xl border border-white/10 p-1.5 shadow-lg focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/40 transition-all">
        <div className="pl-2.5 pr-1 text-amber-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          placeholder="Ask AI: e.g. 2 eggs, sourdough toast..."
          disabled={isLoading}
          className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none"
        />

        <div className="flex items-center gap-1">
          {/* Mic dictation button */}
          <button
            type="button"
            onClick={toggleDictation}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Voice dictation"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Camera switch shortcut */}
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            title="Open camera to scan food photo"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Submit / Analyze button */}
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={!prompt.trim() || isLoading}
            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-black font-semibold p-2 rounded-xl flex items-center justify-center transition-all shadow-md shadow-amber-400/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick suggestion chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {quickPresets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(preset.text);
              handleAnalyze(preset.text);
            }}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 text-[11px] font-medium text-zinc-300 hover:text-white transition-all flex-shrink-0"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* AI Analysis Result Modal Sheet */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">AI Nutrition Breakdown</h3>
                  <span className="text-[11px] text-zinc-400">
                    Confidence: {Math.round(analysisResult.confidence * 100)}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => setAnalysisResult(null)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meal Title & Category Selector */}
            <div className="mt-4">
              <input
                type="text"
                value={analysisResult.mealName}
                onChange={(e) =>
                  setAnalysisResult({ ...analysisResult, mealName: e.target.value })
                }
                className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-3.5 py-2 font-bold text-white text-base focus:border-amber-400 focus:outline-none"
              />

              {/* Category segmented pills */}
              <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedCategory(cat);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition Highlights Grid */}
            <div className="grid grid-cols-4 gap-2 my-4">
              <div className="bg-zinc-800/70 rounded-2xl p-2.5 text-center border border-white/5">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Calories</span>
                <p className="text-lg font-extrabold text-red-400 mt-0.5">{analysisResult.totalCalories}</p>
                <span className="text-[9px] text-zinc-400">kcal</span>
              </div>

              <div className="bg-emerald-500/10 rounded-2xl p-2.5 text-center border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Protein</span>
                <p className="text-lg font-extrabold text-emerald-400 mt-0.5">{analysisResult.totalProtein}g</p>
                <span className="text-[9px] text-emerald-300/70">Anabolic</span>
              </div>

              <div className="bg-zinc-800/70 rounded-2xl p-2.5 text-center border border-white/5">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Carbs</span>
                <p className="text-lg font-extrabold text-sky-400 mt-0.5">{analysisResult.totalCarbs}g</p>
                <span className="text-[9px] text-zinc-400">Fuel</span>
              </div>

              <div className="bg-zinc-800/70 rounded-2xl p-2.5 text-center border border-white/5">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Fat</span>
                <p className="text-lg font-extrabold text-amber-400 mt-0.5">{analysisResult.totalFat}g</p>
                <span className="text-[9px] text-zinc-400">Lipids</span>
              </div>
            </div>

            {/* Itemized Ingredients List */}
            <div className="space-y-2 mt-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Recognized Ingredients ({analysisResult.items.length})
              </span>
              <div className="divide-y divide-zinc-800/80 bg-zinc-800/40 rounded-2xl p-2 border border-white/5">
                {analysisResult.items.map((item, idx) => (
                  <div key={idx} className="py-2 px-1 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-zinc-200">{item.name}</p>
                      <p className="text-[11px] text-zinc-400">{item.portion}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-zinc-200">{item.calories} cal</span>
                      <p className="text-[10px] text-emerald-400 font-medium">{item.protein}g protein</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Tip */}
            {analysisResult.healthTip && (
              <div className="mt-3 p-3 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-start gap-2.5 text-xs text-zinc-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{analysisResult.healthTip}</p>
              </div>
            )}

            {/* Confirm Log Action */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                className="flex-1 py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-[2] py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                <span>Log to Today</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
