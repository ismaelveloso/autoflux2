export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cpf_cnpj?: string;
  email?: string;
  endereco?: string;
  data_cadastro?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  cor?: string;
  ano?: number;
  cliente_id: string;
  status: 'Recebido' | 'Em Serviço' | 'Aguardando Peças' | 'Finalizado' | 'Entregue';
  data_entrada?: string;
  data_saida?: string;
  observacoes?: string;
  valor_total?: number;
  created_at?: string;
  updated_at?: string;
  cliente?: Cliente;
}

export interface Servico {
  id: string;
  nome_servico: string;
  descricao?: string;
  valor_base: number;
  tempo_estimado_dias?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServicoAplicado {
  id: string;
  veiculo_id: string;
  servico_id: string;
  preco_aplicado: number;
  observacoes?: string;
  data_aplicacao?: string;
  created_at?: string;
  updated_at?: string;
  servico?: Servico;
  veiculo?: Veiculo;
}

export interface Insumo {
  id: string;
  nome_insumo: string;
  unidade_medida: string;
  quantidade_total: number;
  valor_unitario: number;
  quantidade_estoque?: number;
  tipo: 'Tintas' | 'Lixas' | 'Massa' | 'Solventes' | 'Soldagem' | 'Acessórios' | 'Geral';
  created_at?: string;
  updated_at?: string;
}

export interface InsumoUsado {
  id: string;
  insumo_id: string;
  veiculo_id: string;
  quantidade_usada: number;
  valor_total: number;
  data_uso?: string;
  created_at?: string;
  updated_at?: string;
  insumo?: Insumo;
  veiculo?: Veiculo;
}

export interface MovimentacaoEstoque {
  id: string;
  insumo_id: string;
  tipo: 'Entrada' | 'Saída';
  quantidade: number;
  veiculo_id?: string;
  observacoes?: string;
  data_movimentacao?: string;
  created_at?: string;
  updated_at?: string;
  insumo?: Insumo;
  veiculo?: Veiculo;
}

export interface Financeiro {
  id: string;
  veiculo_id: string;
  valor_total: number;
  valor_recebido: number;
  forma_pagamento: 'Pix' | 'Dinheiro' | 'Cartão' | 'Boleto' | 'Outros';
  data_pagamento: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  veiculo?: Veiculo;
}

export interface UserProfile {
  id: string;
  user_id: string;
  role: 'admin' | 'mecanico' | 'financeiro';
  nome: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read?: boolean;
  data?: any;
  created_at?: string;
}