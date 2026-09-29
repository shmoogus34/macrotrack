'use client';

import React from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { IPhoneFrame } from '@/components/IPhoneFrame';
import { TabBar } from '@/components/TabBar';
import { LogTab } from '@/components/log/LogTab';
import { CameraTab } from '@/components/camera/CameraTab';
import { ProfileTab } from '@/components/profile/ProfileTab';

export default function Home() {
  const { activeTab } = useMacroTracker();

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
