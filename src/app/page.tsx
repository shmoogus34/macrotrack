'use client';

import React, { useEffect, useState } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { IPhoneFrame } from '@/components/IPhoneFrame';
import { TabBar } from '@/components/TabBar';
import { LogTab } from '@/components/log/LogTab';
import { CameraTab } from '@/components/camera/CameraTab';
import { ProfileTab } from '@/components/profile/ProfileTab';
import { OnboardingModal } from '@/components/auth/OnboardingModal';

export default function Home() {
  const { activeTab, currentUser } = useMacroTracker();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  // If no user is logged in, show the clean onboarding / auth screen
  if (!currentUser) {
    return <OnboardingModal />;
  }

  return (
    <IPhoneFrame>
      <main className="flex-1 w-full relative flex flex-col">
        {activeTab === 'log' && <LogTab />}
        {activeTab === 'camera' && <CameraTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>
      <TabBar />
    </IPhoneFrame>
  );
}
