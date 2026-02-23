import { useState, useCallback } from 'react'
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

const VALID_TABS = new Set<string>(['random', 'search', 'leaderboard', 'profile'])

function getInitialTab(): TabId {
  const hash = window.location.hash.replace('#', '')
  return VALID_TABS.has(hash) ? (hash as TabId) : 'random'
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab)

  const changeTab = useCallback((tab: TabId) => {
    setActiveTab(tab)
    const search = window.location.search
    history.replaceState(null, '', window.location.pathname + search + '#' + tab)
  }, [])

  return (
    <ClueProvider>
      <Layout onProfileTap={() => changeTab('profile')}>
        <div className="flex flex-col h-full">
          <div className={`flex-1 overflow-y-auto ${activeTab !== 'random' ? 'hidden' : ''}`}>
            <RandomClue />
          </div>
          <div className={`flex-1 overflow-y-auto ${activeTab !== 'search' ? 'hidden' : ''}`}>
            <SearchBrowse />
          </div>
          <div className={`flex-1 overflow-y-auto ${activeTab !== 'leaderboard' ? 'hidden' : ''}`}>
            <Leaderboard />
          </div>
          <div className={`flex-1 overflow-y-auto ${activeTab !== 'profile' ? 'hidden' : ''}`}>
            <ProfilePage />
          </div>
          <TabNav active={activeTab} onChange={changeTab} />
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
