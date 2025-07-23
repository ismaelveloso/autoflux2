import React, { useState, useEffect } from 'react';
import { Car, Users, Wrench, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase, getCurrentMonthRange } from '../../lib/supabase';

interface DashboardStats {
  totalVeiculos: number;
  veiculosEmServico: number;
  totalClientes: number;
  faturamentoMes: number;
  veiculosFinalizados: number;
  veiculosAguardandoPecas: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVeiculos: 0,
    veiculosEmServico: 0,
    totalClientes: 0,
    faturamentoMes: 0,
    veiculosFinalizados: 0,
    veiculosAguardandoPecas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Check if user is authenticated before making requests
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Total de veículos
      const { count: totalVeiculos } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true });

      // Veículos em serviço
      const { count: veiculosEmServico } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Em Serviço');

      // Total de clientes
      const { count: totalClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      // Faturamento do mês
      const { startDate, endDate } = getCurrentMonthRange();
      const { data: faturamento } = await supabase
        .from('financeiro')
        .select('valor_recebido')
        .gte('data_pagamento', startDate)
        .lte('data_pagamento', endDate);

      const faturamentoMes = faturamento?.reduce((sum, item) => sum + Number(item.valor_recebido), 0) || 0;

      // Veículos finalizados
      const { count: veiculosFinalizados } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Finalizado');

      // Veículos aguardando peças
      const { count: veiculosAguardandoPecas } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Aguardando Peças');

      setStats({
        totalVeiculos: totalVeiculos || 0,
        veiculosEmServico: veiculosEmServico || 0,
        totalClientes: totalClientes || 0,
        faturamentoMes,
        veiculosFinalizados: veiculosFinalizados || 0,
        veiculosAguardandoPecas: veiculosAguardandoPecas || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="text-red-600" size={20} />
          <div>
            <h4 className="text-red-800 font-medium">Erro</h4>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }
  const cards = [
    {
      title: 'Total de Veículos',
      value: stats.totalVeiculos,
      icon: Car,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Em Serviço',
      value: stats.veiculosEmServico,
      icon: Wrench,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClientes,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Faturamento do Mês',
      value: `R$ ${stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status dos veículos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Veículos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Finalizados</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.veiculosFinalizados}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Em Serviço</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.veiculosEmServico}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Aguardando Peças</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.veiculosAguardandoPecas}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Faturamento do Mês</span>
              <span className="font-semibold text-green-600">
                R$ {stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Média por Veículo</span>
              <span className="font-semibold text-gray-900">
                R$ {stats.totalVeiculos > 0 ? (stats.faturamentoMes / stats.totalVeiculos).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {stats.veiculosAguardandoPecas > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-yellow-600" size={20} />
            <div>
              <h4 className="text-yellow-800 font-medium">Atenção!</h4>
              <p className="text-yellow-700">
                {stats.veiculosAguardandoPecas} veículo(s) aguardando peças. Verifique o estoque.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;