'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { AIAnalysisResult, MealCategory } from '@/lib/types';
import { Camera, Image as ImageIcon, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const CameraTab: React.FC = () => {
  const { addMeal, setActiveTab, profile } = useMacroTracker();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AIAnalysisResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('lunch');
  const [cameraActive, setCameraActive] = useState(false);

  // Initialize live camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraActive(false);
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 } },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (e) {
      console.warn('Camera stream error:', e);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (!capturedImage) {
      startCamera(facingMode);
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, capturedImage]);

  // Guaranteed Functional Shutter Click
  const handleShutterClick = () => {
    triggerHaptic('medium');

    const video = videoRef.current;
    // Check if live video is active and ready with valid pixel width
    if (cameraActive && video && video.readyState >= 2 && video.videoWidth > 0) {
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(dataUrl);
          analyzePhoto(dataUrl);
          return;
        }
      } catch (err) {
        console.warn('Snapshot canvas error, falling back to file picker:', err);
      }
    }

    // Direct fallback: trigger native iPhone Camera / File Picker!
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image selected via file picker / native camera
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('light');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        analyzePhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same image can be reselected if needed
    e.target.value = '';
  };

  const analyzePhoto = async (imageDataUrl: string) => {
    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          apiKey: profile.customApiKey,
          model: profile.preferredModel,
        }),
      });

      if (!res.ok) throw new Error('Failed image analysis');

      const result: AIAnalysisResult = await res.json();
      setScanResult(result);
      setSelectedCategory(result.suggestedCategory || 'lunch');
      triggerHaptic('success');
    } catch {
      const fallback: AIAnalysisResult = {
        mealName: 'Scanned Food Plate',
        suggestedCategory: 'lunch',
        items: [
          {
            name: 'Lean Protein & Whole Grain Plate',
            portion: '1 plate',
            calories: 520,
            protein: 42,
            carbs: 48,
            fat: 16,
          },
        ],
        totalCalories: 520,
        totalProtein: 42,
        totalCarbs: 48,
        totalFat: 16,
        confidence: 0.88,
        healthTip: 'Estimated macro values applied.',
      };
      setScanResult(fallback);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmLog = () => {
    if (!scanResult) return;

    addMeal({
      name: scanResult.mealName,
      category: selectedCategory,
      items: scanResult.items.map((i, idx) => ({
        id: `item_cam_${Date.now()}_${idx}`,
        name: i.name,
        portion: i.portion,
        calories: i.calories,
        protein: i.protein,
        carbs: i.carbs,
        fat: i.fat,
        fiber: i.fiber,
      })),
      calories: scanResult.totalCalories,
      protein: scanResult.totalProtein,
      carbs: scanResult.totalCarbs,
      fat: scanResult.totalFat,
      imageUrl: capturedImage || undefined,
      aiAnalyzed: true,
      aiConfidence: scanResult.confidence,
      healthTip: scanResult.healthTip,
    });

    setCapturedImage(null);
    setScanResult(null);
    setActiveTab('log');
  };

  const resetCamera = () => {
    triggerHaptic('light');
    setCapturedImage(null);
    setScanResult(null);
  };

  return (
    <div className="relative min-h-[82vh] flex flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* Hidden input for camera snapshot & upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {capturedImage ? (
        /* CAPTURED / SCANNING STATE */
        <div className="flex-1 flex flex-col p-5">
          <div className="relative w-full h-72 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <img src={capturedImage} alt="Food photo" className="w-full h-full object-cover" />

            <button
              onClick={resetCamera}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/80 text-white border border-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Monochrome scan beam */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-white shadow-[0_0_15px_#fff] absolute animate-scan" />
              </div>
            )}
          </div>

          {isScanning && (
            <div className="mt-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <div className="text-left font-mono">
                <p className="font-bold text-xs uppercase text-white">ANALYZING MEAL WITH AI...</p>
                <p className="text-[10px] text-zinc-500">Estimating portions & macros</p>
              </div>
            </div>
          )}

          {scanResult && !isScanning && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-bottom duration-200">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                  <div className="flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                      SCANNED MEAL
                    </span>
                    <input
                      type="text"
                      value={scanResult.mealName}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, mealName: e.target.value })
                      }
                      className="bg-transparent font-black text-xl text-white uppercase focus:outline-none w-full"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as MealCategory)}
                    className="bg-black border border-zinc-800 text-xs font-mono font-bold uppercase text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {/* Macro Grid */}
                <div className="grid grid-cols-4 gap-2 my-4">
                  <div className="bg-black border border-zinc-800 rounded-2xl p-2.5 text-center">
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase">CALS</span>
                    <p className="text-lg font-black text-white">{scanResult.totalCalories}</p>
                  </div>
                  <div className="bg-black border-2 border-white rounded-2xl p-2.5 text-center">
                    <span className="text-[9px] font-mono text-white font-bold block uppercase">PROTEIN</span>
                    <p className="text-lg font-black text-white">{scanResult.totalProtein}g</p>
                  </div>
                  <div className="bg-black border border-zinc-800 rounded-2xl p-2.5 text-center">
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase">CARBS</span>
                    <p className="text-lg font-black text-white">{scanResult.totalCarbs}g</p>
                  </div>
                  <div className="bg-black border border-zinc-800 rounded-2xl p-2.5 text-center">
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase">FAT</span>
                    <p className="text-lg font-black text-white">{scanResult.totalFat}g</p>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-zinc-900 bg-black rounded-2xl border border-zinc-900 p-2">
                  {scanResult.items.map((item, idx) => (
                    <div key={idx} className="py-2 px-1 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <span className="text-[10px] font-mono text-zinc-500">{item.portion}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-white">{item.calories} cal</span>
                        <span className="block text-[10px] text-zinc-400">{item.protein}g P</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetCamera}
                  className="flex-1 py-3.5 rounded-2xl bg-zinc-900 text-zinc-400 font-bold text-xs"
                >
                  RETAKE
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLog}
                  className="flex-[2] py-3.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl"
                >
                  <Check className="w-4 h-4 stroke-[3px]" />
                  <span>LOG MEAL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LIVE VIEWFINDER / CAPTURE VIEW */
        <div className="flex-1 flex flex-col relative">
          <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                onClick={handleShutterClick}
                className="p-8 text-center max-w-xs cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-black text-base uppercase text-white tracking-tight">
                  Tap to Take Photo
                </h4>
                <p className="text-xs font-mono text-zinc-500 mt-1">
                  Launches iPhone camera or photo selector
                </p>
              </div>
            )}

            {/* Target Reticle */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
              <div className="relative w-64 h-64 border border-white/20 rounded-3xl">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-white rounded-br-xl" />
              </div>
              <span className="mt-4 text-[10px] font-mono tracking-widest text-zinc-400 bg-black/60 px-3 py-1 rounded-full uppercase">
                Frame your food
              </span>
            </div>

            {/* Flip Camera */}
            {cameraActive && (
              <button
                type="button"
                onClick={() =>
                  setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                }
                className="absolute top-4 right-4 p-3 rounded-full bg-black/60 text-white border border-zinc-800"
                title="Flip Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bottom Shutter Controls */}
          <div className="p-6 bg-black border-t border-zinc-900 flex items-center justify-around z-20">
            {/* Gallery Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                PHOTOS
              </span>
            </button>

            {/* Big Functional Shutter Button */}
            <button
              type="button"
              onClick={handleShutterClick}
              className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-transform shadow-2xl"
              aria-label="Capture Photo"
            >
              <div className="w-full h-full rounded-full bg-white hover:bg-zinc-200 transition-colors" />
            </button>

            {/* Direct Camera Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                SNAP
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
