import React, { useEffect, useRef, useState } from 'react';
import { User, Store } from './types';
import { dataStore } from './services/store';

// Layout
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';

// Home
import { BannerCarousel } from './components/home/BannerCarousel';
import { SmartSearchSection } from './components/home/SmartSearchSection';
import { CategorySlider } from './components/home/CategorySlider';
import { FeaturedStores } from './components/home/FeaturedStores';
import { LatestAdsSection } from './components/home/LatestAdsSection';
import { ABMNewsSection } from './components/home/ABMNewsSection';

// Views
import { StoreDirectory } from './components/stores/StoreDirectory';
import { StoreDetailPage } from './components/stores/StoreDetailPage';
import { SearchAndAIAssistant } from './components/search/SearchAndAIAssistant';
import { ABMHub } from './components/abm/ABMHub';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProfileView } from './components/profile/ProfileView';
import { ChatInterface } from './components/chat/ChatInterface';
import { AuthModal } from './components/auth/AuthModal';

const GUEST_USER: User = {
  id: 'guest_preview',
  name: 'Visitante',
  email: '',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  role: 'resident',
  unit: 'Barra da Tijuca · RJ',
  status: 'active',
  createdAt: new Date(0).toISOString(),
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(dataStore.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(dataStore.isAuthenticated());
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLocked, setAuthLocked] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [previewLocked, setPreviewLocked] = useState(dataStore.isPreviewLocked());
  const previewLimitRef = useRef(false);

  const syncAuth = () => {
    const logged = dataStore.isAuthenticated();
    setIsAuthenticated(logged);
    setCurrentUser(logged ? dataStore.getCurrentUser() : GUEST_USER);
    if (logged) {
      setPreviewLocked(false);
      setAuthLocked(false);
    }
  };

  useEffect(() => {
    syncAuth();
    return dataStore.subscribe(syncAuth);
  }, []);

  // Visitor preview: one persistent 20-second window, never restarted by refresh/navigation.
  useEffect(() => {
    if (isAuthenticated) return;

    const start = dataStore.ensurePreviewStarted();
    const trigger = () => {
      if (previewLimitRef.current || dataStore.isAuthenticated()) return;
      previewLimitRef.current = true;
      dataStore.lockPreview();
      setPreviewLocked(true);
      setAuthLocked(true);
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      window.scrollTo({ top: Math.max(0, document.documentElement.scrollHeight * 0.5 - window.innerHeight), behavior: 'smooth' });
    };

    const checkTime = () => {
      if (Date.now() - start >= 20000) trigger();
    };
    const timer = window.setInterval(checkTime, 250);

    const onScroll = () => {
      if (previewLimitRef.current) return;
      const maxPoint = Math.max(0, document.documentElement.scrollHeight * 0.5 - window.innerHeight);
      if (window.scrollY >= maxPoint) trigger();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    checkTime();

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      document.body.style.overflow = '';
      return;
    }
    const prevent = (e: WheelEvent) => {
      if (previewLocked) e.preventDefault();
    };
    if (previewLocked) document.body.style.overflow = 'hidden';
    window.addEventListener('wheel', prevent, { passive: false });
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', prevent);
    };
  }, [previewLocked, isAuthenticated]);

  const openAuth = (mode: 'login' | 'register' = 'login', locked = false) => {
    setAuthInitialMode(mode);
    setAuthLocked(locked);
    setAuthModalOpen(true);
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      openAuth('login', false);
      return false;
    }
    return true;
  };

  const handleNavigate = (tab: string, entityId?: string) => {
    const protectedTabs = ['perfil', 'chat', 'merchant_dashboard', 'admin_dashboard'];
    if (protectedTabs.includes(tab) && !requireAuth()) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'loja_detalhe' && entityId) {
      setSelectedStoreId(entityId);
      setActiveTab('loja_detalhe');
    } else if (tab === 'chat' && entityId) {
      setSelectedConversationId(entityId);
      setActiveTab('chat');
    } else if (tab === 'lojas') {
      setSelectedStoreId(null);
      setActiveTab('lojas');
    } else {
      setSelectedStoreId(null);
      setSelectedConversationId(null);
      setActiveTab(tab);
    }
  };

  const handleSearchFromHome = (query: string) => {
    setSearchInitialQuery(query);
    setActiveTab('buscar');
  };

  const handleSelectCategoryFromHome = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setActiveTab('lojas');
  };

  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setActiveTab('loja_detalhe');
  };

  const handleStartChatWithStore = (store: Store) => {
    if (!requireAuth()) return;
    const abmConv = dataStore.createConversation(
      'resident_merchant',
      currentUser,
      { id: store.ownerId, name: store.name, avatar: store.logo, role: 'merchant', storeId: store.id },
      `Olá ${store.name}! Tenho uma dúvida sobre os produtos/serviços no app ABM.`
    );
    setSelectedConversationId(abmConv.id);
    setActiveTab('chat');
  };


  const userForView = isAuthenticated ? currentUser : GUEST_USER;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col antialiased">

      <Header currentUser={userForView} isAuthenticated={isAuthenticated} onNavigate={handleNavigate} onOpenAuth={() => openAuth('login', false)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 pb-24">
        {activeTab === 'inicio' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <BannerCarousel
              onNavigateToStore={handleSelectStore}
              onNavigateToAd={(adId) => {
                const ad = dataStore.getAds().find(a => a.id === adId);
                if (ad) handleSelectStore(ad.storeId);
              }}
              onNavigateToABM={() => handleNavigate('abm')}
            />
            <SmartSearchSection onSearch={handleSearchFromHome} />
            <CategorySlider onSelectCategory={handleSelectCategoryFromHome} />
            <FeaturedStores onSelectStore={handleSelectStore} onSeeAllStores={() => handleNavigate('lojas')} />
            <LatestAdsSection onSelectStore={handleSelectStore} />
            <ABMNewsSection onNavigateToABM={(newsId) => handleNavigate('abm', newsId)} />
          </div>
        )}

        {activeTab === 'lojas' && <div className="animate-in fade-in duration-150"><StoreDirectory onSelectStore={handleSelectStore} initialCategory={selectedCategory} /></div>}

        {activeTab === 'loja_detalhe' && selectedStoreId && (
          <div className="animate-in fade-in duration-150">
            <StoreDetailPage storeId={selectedStoreId} currentUser={userForView} onBack={() => handleNavigate('lojas')} onStartChat={handleStartChatWithStore} />
          </div>
        )}

        {activeTab === 'buscar' && <div className="animate-in fade-in duration-150"><SearchAndAIAssistant initialQuery={searchInitialQuery} onSelectStore={handleSelectStore} /></div>}

        {activeTab === 'abm' && <div className="animate-in fade-in duration-150"><ABMHub currentUser={userForView} /></div>}

        {activeTab === 'chat' && selectedConversationId && isAuthenticated && (
          <div className="animate-in fade-in duration-150"><ChatInterface conversationId={selectedConversationId} currentUser={currentUser} onBack={() => handleNavigate('inicio')} onViewStore={handleSelectStore} /></div>
        )}

        {activeTab === 'merchant_dashboard' && isAuthenticated && (
          <div className="animate-in fade-in duration-150"><MerchantDashboard currentUser={currentUser} onViewStorePage={handleSelectStore} /></div>
        )}

        {activeTab === 'admin_dashboard' && isAuthenticated && (
          <div className="animate-in fade-in duration-150"><AdminDashboard currentUser={currentUser} onViewStore={handleSelectStore} /></div>
        )}

        {activeTab === 'perfil' && isAuthenticated && (
          <div className="animate-in fade-in duration-150">
            <ProfileView currentUser={currentUser} onOpenMerchantDashboard={() => handleNavigate('merchant_dashboard')} onOpenAdminDashboard={() => handleNavigate('admin_dashboard')} onSelectStore={handleSelectStore} onOpenChat={(convId) => handleNavigate('chat', convId)} onOpenAuth={() => openAuth('login', false)} />
          </div>
        )}
      </main>

      <BottomNavigation
        activeTab={['loja_detalhe','chat','merchant_dashboard','admin_dashboard'].includes(activeTab) ? '' : activeTab}
        onTabChange={(tab) => handleNavigate(tab)}
      />

      <AuthModal
        isOpen={authModalOpen}
        locked={authLocked}
        initialMode={authInitialMode}
        onClose={() => {
          if (!authLocked) setAuthModalOpen(false);
        }}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setPreviewLocked(false);
          setAuthLocked(false);
          setAuthModalOpen(false);
          handleNavigate('inicio');
        }}
      />
    </div>
  );
}
