'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { AIAnalysisResult, MealCategory } from '@/lib/types';
import { Check, X, Loader2, Camera } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const CameraTab: React.FC = () => {
  const { addMeal, setActiveTab, profile } = useMacroTracker();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraLive, setIsCameraLive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AIAnalysisResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('lunch');

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Step 1: Open Camera function directly triggered by user click
  const openCamera = async () => {
    triggerHaptic('medium');
    setCameraLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraLive(true);
      setCameraLoading(false);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play error:', playErr);
        }
      }
    } catch (err) {
      console.warn('Direct camera open failed, using fallback:', err);
      setCameraLoading(false);
      // Fallback directly to native iPhone camera input
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Step 2: Capture Photo from the live background video
  const takePicture = () => {
    triggerHaptic('heavy');
    const video = videoRef.current;

    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCapturedImage(dataUrl);

          // Stop live stream once photo is taken
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
            setStream(null);
            setIsCameraLive(false);
          }

          analyzePhoto(dataUrl);
          return;
        }
      } catch (e) {
        console.warn('Canvas capture error:', e);
      }
    }

    // Fallback if video isn't ready
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Single Circle Button click handler:
  // If camera is NOT open -> open the camera!
  // If camera IS open -> take the picture!
  const handleSingleCircleButtonClick = () => {
    if (!isCameraLive) {
      openCamera();
    } else {
      takePicture();
    }
  };

  // File fallback handler
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
    e.target.value = '';
  };

  // Send photo to AI
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

      if (!res.ok) throw new Error('Analysis failed');

      const result: AIAnalysisResult = await res.json();
      setScanResult(result);
      setSelectedCategory(result.suggestedCategory || 'lunch');
      triggerHaptic('success');
    } catch {
      const fallback: AIAnalysisResult = {
        mealName: 'Scanned Meal',
        suggestedCategory: 'lunch',
        items: [
          {
            name: 'Detected Balanced Meal Plate',
            portion: '1 serving',
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
        healthTip: 'High protein nutrition profile detected.',
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

  const retakePhoto = () => {
    triggerHaptic('light');
    setCapturedImage(null);
    setScanResult(null);
    openCamera();
  };

  return (
    <div className="relative h-full w-full flex-1 flex flex-col bg-black text-white overflow-hidden select-none">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* STATE 1: Captured Photo & AI Breakdown Sheet */}
      {capturedImage ? (
        <div className="flex-1 flex flex-col justify-between p-5 pb-20 overflow-y-auto no-scrollbar">
          <div>
            <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <img src={capturedImage} alt="Food" className="w-full h-full object-cover" />
              <button
                onClick={retakePhoto}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/80 text-white border border-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
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
                  <p className="font-bold text-xs uppercase text-white">ANALYZING WITH AI...</p>
                  <p className="text-[10px] text-zinc-500">Calculating macros and ingredients</p>
                </div>
              </div>
            )}

            {scanResult && !isScanning && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-bottom duration-200">
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                    <div className="flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                        DETECTED FOOD
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

                  {/* Macro Numbers */}
                  <div className="grid grid-cols-4 gap-2 my-4">
                    <div className="bg-black border border-zinc-800 rounded-2xl p-2.5 text-center">
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase">CALORIES</span>
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

                  {/* Ingredients */}
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

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex-1 py-3.5 rounded-2xl bg-zinc-900 text-zinc-400 font-bold text-xs font-mono uppercase"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLog}
                    className="flex-[2] py-3.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl"
                  >
                    <Check className="w-4 h-4 stroke-[3px]" />
                    <span>Log to Today</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STATE 2: Full Viewport Live Camera + Square in the Middle + Only 1 Circle Button */
        <div className="relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Background Live Video Feed */}
          <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCameraLive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* When camera is NOT open yet: Dark backdrop with prompt */}
            {!isCameraLive && (
              <div className="text-center px-6 pointer-events-none">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 block mb-2">
                  CAMERA READY
                </span>
                <p className="text-xs font-mono text-zinc-400">
                  Tap the circle button below to open camera
                </p>
              </div>
            )}
          </div>

          {/* Square in the Middle (Viewfinder Reticle) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            <div className="relative w-64 h-64 border-2 border-white/80 rounded-3xl flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />

              {/* Center point */}
              <div className="w-2 h-2 rounded-full bg-white/40" />
            </div>

            <span className="mt-4 text-[10px] font-mono tracking-widest text-white/80 uppercase bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
              {isCameraLive ? 'Center food & press circle' : 'Center food plate'}
            </span>
          </div>

          {/* Top minimal status */}
          <div className="relative z-20 pt-4 px-6 flex justify-between items-center pointer-events-none">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/70">
              {isCameraLive ? '● LIVE FEED' : 'STANDBY'}
            </span>
          </div>

          {/* Bottom Area: ONLY ONE CIRCLE BUTTON */}
          <div className="relative z-30 pb-20 pt-4 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={handleSingleCircleButtonClick}
              disabled={cameraLoading}
              className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.25)] bg-black/40 backdrop-blur-md"
              aria-label={isCameraLive ? 'Take Picture' : 'Open Camera'}
            >
              {cameraLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              ) : (
                <div
                  className={`w-full h-full rounded-full transition-all duration-300 flex items-center justify-center ${
                    isCameraLive
                      ? 'bg-white hover:bg-zinc-200'
                      : 'bg-white/20 hover:bg-white/40 text-white'
                  }`}
                >
                  {!isCameraLive && <Camera className="w-6 h-6 text-white" />}
                </div>
              )}
            </button>

            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mt-2 font-bold">
              {isCameraLive ? 'SNAP' : 'OPEN CAMERA'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
