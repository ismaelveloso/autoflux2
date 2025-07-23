import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Phone, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Cliente } from '../../types/database';
import ClienteForm from './ClienteForm';

const ClientesList: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowForm(true);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cliente.cpf_cnpj && cliente.cpf_cnpj.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <button
          onClick={() => {
            setSelectedCliente(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, email ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.map((cliente) => (
          <div key={cliente.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{cliente.nome}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(cliente)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone size={16} />
                <span>{cliente.telefone}</span>
              </div>
              
              {cliente.email && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={16} />
                  <span className="truncate">{cliente.email}</span>
                </div>
              )}

              {cliente.cpf_cnpj && (
                <div className="text-sm text-gray-500">
                  CPF/CNPJ: {cliente.cpf_cnpj}
                </div>
              )}

              {cliente.endereco && (
                <div className="text-sm text-gray-500">
                  {cliente.endereco}
                </div>
              )}

              <div className="text-xs text-gray-400 pt-2">
                Cadastrado em: {cliente.data_cadastro ? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR') : '-'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum cliente encontrado</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <ClienteForm
          cliente={selectedCliente}
          onClose={() => {
            setShowForm(false);
            setSelectedCliente(null);
          }}
          onSave={() => {
            loadClientes();
            setShowForm(false);
            setSelectedCliente(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientesList;