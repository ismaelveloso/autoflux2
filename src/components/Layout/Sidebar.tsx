import React from 'react';
import { 
  Car, 
  Users, 
  Wrench, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import { signOut } from '../../lib/supabase';
import { UserProfile } from '../../types/database';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, profile }) => {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'mecanico', 'financeiro'] },
    { id: 'veiculos', label: 'Veículos', icon: Car, roles: ['admin', 'mecanico'] },
    { id: 'clientes', label: 'Clientes', icon: Users, roles: ['admin', 'mecanico'] },
    { id: 'servicos', label: 'Serviços', icon: Wrench, roles: ['admin', 'mecanico'] },
    { id: 'estoque', label: 'Estoque', icon: Package, roles: ['admin', 'mecanico'] },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, roles: ['admin', 'financeiro'] },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, roles: ['admin', 'mecanico', 'financeiro'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400">AutoFlux</h1>
        <p className="text-gray-400 text-sm">Sistema de Gestão</p>
      </div>

      <div className="mb-6">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-300">Bem-vindo,</p>
          <p className="font-semibold">{profile?.nome}</p>
          <p className="text-xs text-blue-400 capitalize">{profile?.role}</p>
        </div>
      </div>

      <nav className="space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;