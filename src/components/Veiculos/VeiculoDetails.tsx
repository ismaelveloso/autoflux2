import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Veiculo, ServicoAplicado, InsumoUsado } from '../../types/database';

interface VeiculoDetailsProps {
  veiculo: Veiculo;
  onClose: () => void;
}

const VeiculoDetails: React.FC<VeiculoDetailsProps> = ({ veiculo, onClose }) => {
  const [servicosAplicados, setServicosAplicados] = useState<ServicoAplicado[]>([]);
  const [insumosUsados, setInsumosUsados] = useState<InsumoUsado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVeiculoDetails();
  }, [veiculo.id]);

  const loadVeiculoDetails = async () => {
    try {
      // Carregar serviços aplicados
      const { data: servicos, error: servicosError } = await supabase
        .from('servicos_aplicados')
        .select(`
          *,
          servico:servicos(*)
        `)
        .eq('veiculo_id', veiculo.id);

      if (servicosError) throw servicosError;

      // Carregar insumos usados
      const { data: insumos, error: insumosError } = await supabase
        .from('insumos_usados')
        .select(`
          *,
          insumo:insumos(*)
        `)
        .eq('veiculo_id', veiculo.id);

      if (insumosError) throw insumosError;

      setServicosAplicados(servicos || []);
      setInsumosUsados(insumos || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes do veículo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recebido': return 'bg-blue-100 text-blue-800';
      case 'Em Serviço': return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando Peças': return 'bg-red-100 text-red-800';
      case 'Finalizado': return 'bg-green-100 text-green-800';
      case 'Entregue': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalServicos = servicosAplicados.reduce((sum, item) => sum + Number(item.preco_aplicado), 0);
  const totalInsumos = insumosUsados.reduce((sum, item) => sum + Number(item.valor_total), 0);
  const valorTotal = totalServicos + totalInsumos;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Detalhes do Veículo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do Veículo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Informações do Veículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Placa</label>
                <p className="text-lg font-semibold">{veiculo.placa}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Marca/Modelo</label>
                <p className="text-lg">{veiculo.marca} {veiculo.modelo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Ano</label>
                <p className="text-lg">{veiculo.ano || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Cor</label>
                <p className="text-lg">{veiculo.cor || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Cliente</label>
                <p className="text-lg">{veiculo.cliente?.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(veiculo.status)}`}>
                  {veiculo.status}
                </span>
              </div>
            </div>
            {veiculo.observacoes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600">Observações</label>
                <p className="text-gray-900">{veiculo.observacoes}</p>
              </div>
            )}
          </div>

          {/* Serviços Aplicados */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Serviços Aplicados</h3>
              <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center space-x-1 text-sm">
                <Plus size={16} />
                <span>Adicionar</span>
              </button>
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Serviço
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Preço
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {servicosAplicados.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.servico?.nome_servico}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        R$ {Number(item.preco_aplicado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.data_aplicacao ? new Date(item.data_aplicacao).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit size={14} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {servicosAplicados.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum serviço aplicado
                </div>
              )}
            </div>
          </div>

          {/* Insumos Usados */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Insumos Usados</h3>
              <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center space-x-1 text-sm">
                <Plus size={16} />
                <span>Adicionar</span>
              </button>
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Insumo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {insumosUsados.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.insumo?.nome_insumo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {Number(item.quantidade_usada)} {item.insumo?.unidade_medida}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        R$ {Number(item.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.data_uso ? new Date(item.data_uso).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit size={14} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {insumosUsados.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum insumo usado
                </div>
              )}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Resumo Financeiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Total Serviços</label>
                <p className="text-xl font-semibold text-blue-600">
                  R$ {totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Total Insumos</label>
                <p className="text-xl font-semibold text-green-600">
                  R$ {totalInsumos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Valor Total</label>
                <p className="text-xl font-bold text-gray-900">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeiculoDetails;