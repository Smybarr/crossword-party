import { useState } from 'react'
import type { TabId } from '@/lib/types'
import { Layout } from '@/components/Layout'
import { TabNav } from '@/components/TabNav'
import { ClueProvider } from '@/components/ClueContext'
import { IdentityProvider, useIdentityContext } from '@/components/IdentityContext'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { RandomClue } from '@/components/RandomClue'
import { SearchBrowse } from '@/components/SearchBrowse'
import { Leaderboard } from '@/components/Leaderboard'
import { ProfilePage } from '@/components/ProfilePage'
import { Toaster } from '@/components/ui/sonner'

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabId>('random')

  return (
    <ClueProvider>
      <Layout onProfileTap={() => setActiveTab('profile')}>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'random' && <RandomClue />}
            {activeTab === 'search' && <SearchBrowse />}
            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'profile' && <ProfilePage />}
          </div>
          <TabNav active={activeTab} onChange={setActiveTab} />
        </div>
      </Layout>
      <Toaster position="top-center" />
    </ClueProvider>
  )
}

function AppContent() {
  const { session, loading } = useIdentityContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    return <WelcomeScreen />
  }

  return <MainApp />
}

export default function App() {
  return (
    <IdentityProvider>
      <AppContent />
    </IdentityProvider>
  )
}
