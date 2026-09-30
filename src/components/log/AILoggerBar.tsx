'use client';

import React, { useState } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { AIAnalysisResult, MealCategory } from '@/lib/types';
import { Mic, MicOff, ArrowRight, Loader2, X, Check } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

import { analyzeFoodTextWithPuter } from '@/lib/puter-client';

export const AILoggerBar: React.FC = () => {
  const { addMeal, profile } = useMacroTracker();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('lunch');

  const toggleDictation = () => {
    triggerHaptic('light');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser.');
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
    } catch {
      setIsListening(false);
    }
  };

  const handleAnalyze = async (overridePrompt?: string) => {
    const textToAnalyze = overridePrompt || prompt;
    if (!textToAnalyze.trim() || isLoading) return;

    triggerHaptic('medium');
    setIsLoading(true);

    try {
      const data = await analyzeFoodTextWithPuter(textToAnalyze.trim());
      setAnalysisResult(data);
      setSelectedCategory(data.suggestedCategory || 'lunch');
      triggerHaptic('success');
    } catch (err) {
      console.warn('Analysis error:', err);
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

  return (
    <div className="space-y-2">
      {/* Minimal Monochrome Input */}
      <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl p-1.5 focus-within:border-white transition-all">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          placeholder="Log food (e.g. 3 eggs, avocado toast)..."
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none"
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleDictation}
            className={`p-2 rounded-xl transition-all ${
              isListening ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
            }`}
            title="Voice dictation"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={!prompt.trim() || isLoading}
            className="bg-white hover:bg-zinc-200 disabled:opacity-20 text-black font-black text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-1 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>LOG</span>}
          </button>
        </div>
      </div>

      {/* Confirmation Sheet */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-black border border-white/20 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 pb-safe shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  AI BREAKDOWN
                </span>
                <h3 className="font-black text-white text-xl uppercase tracking-tight">
                  {analysisResult.mealName}
                </h3>
              </div>
              <button
                onClick={() => setAnalysisResult(null)}
                className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Selector */}
            <div className="grid grid-cols-4 gap-1.5 my-4">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-black'
                      : 'bg-zinc-950 text-zinc-500 border border-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Macro Totals */}
            <div className="grid grid-cols-4 gap-2 my-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">CALORIES</span>
                <p className="text-lg font-black text-white">{analysisResult.totalCalories}</p>
              </div>
              <div className="bg-zinc-950 border-2 border-white rounded-xl p-2.5 text-center">
                <span className="text-[9px] font-mono text-white font-bold block uppercase">PROTEIN</span>
                <p className="text-lg font-black text-white">{analysisResult.totalProtein}g</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">CARBS</span>
                <p className="text-lg font-black text-white">{analysisResult.totalCarbs}g</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">FAT</span>
                <p className="text-lg font-black text-white">{analysisResult.totalFat}g</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 my-3">
              <div className="divide-y divide-zinc-900 bg-zinc-950 rounded-xl p-2 border border-zinc-900">
                {analysisResult.items.map((item, idx) => (
                  <div key={idx} className="py-2 px-1 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{item.portion}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white">{item.calories} kcal</span>
                      <p className="text-[10px] text-zinc-400">{item.protein}g P</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-[2] py-3 px-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xl"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                <span>Confirm & Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
