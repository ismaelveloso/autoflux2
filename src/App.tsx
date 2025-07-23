import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import VeiculosList from './components/Veiculos/VeiculosList';
import ClientesList from './components/Clientes/ClientesList';

const App: React.FC = () => {
  const { user, profile, loading, error, sessionChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show loading while checking session
  if (loading || !sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Carregando AutoFlux...' : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if there's an auth error and no user
  if (error && !user && sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show login form if no user or profile after session check
  if ((!user || !profile) && sessionChecked) {
    return <LoginForm />;
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'veiculos': return 'Veículos';
      case 'clientes': return 'Clientes';
      case 'servicos': return 'Serviços';
      case 'estoque': return 'Estoque';
      case 'financeiro': return 'Financeiro';
      case 'notificacoes': return 'Notificações';
      case 'configuracoes': return 'Configurações';
      default: return 'AutoFlux';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'veiculos':
        return <VeiculosList />;
      case 'clientes':
        return <ClientesList />;
      case 'servicos':
        return <div className="p-6">Módulo de Serviços em desenvolvimento...</div>;
      case 'estoque':
        return <div className="p-6">Módulo de Estoque em desenvolvimento...</div>;
      case 'financeiro':
        return <div className="p-6">Módulo Financeiro em desenvolvimento...</div>;
      case 'notificacoes':
        return <div className="p-6">Módulo de Notificações em desenvolvimento...</div>;
      case 'configuracoes':
        return <div className="p-6">Módulo de Configurações em desenvolvimento...</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        profile={profile}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTabTitle(activeTab)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;