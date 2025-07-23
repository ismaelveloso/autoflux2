import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import VeiculosList from './components/Veiculos/VeiculosList';
import ClientesList from './components/Clientes/ClientesList';

const App: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
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