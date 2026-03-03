export type AgendamentoStatus = 'pendente' | 'confirmado' | 'finalizado' | 'cancelado'

export type FinanceiroTipo = 'receita' | 'despesa'

export type StatusPagamento = 'pendente' | 'pago' | 'atrasado' | 'cancelado'

export interface Paciente {
  id: string
  nome: string
  cpf: string
  whatsapp: string
  data_nascimento: string
  historico_clinico: Record<string, unknown>
  created_at: string
  updated_at: string
  clinic_id: string
}

export interface Agendamento {
  id: string
  paciente_id: string
  dentista_id: string
  data_hora: string
  status: AgendamentoStatus
  procedimento: string
  observacoes: string | null
  created_at: string
  updated_at: string
  clinic_id: string
  paciente?: Paciente
}

export interface Financeiro {
  id: string
  agendamento_id: string | null
  valor: number
  tipo: FinanceiroTipo
  status_pagamento: StatusPagamento
  data_vencimento: string
  descricao: string | null
  created_at: string
  updated_at: string
  clinic_id: string
  agendamento?: Agendamento
}

export interface Dentista {
  id: string
  nome: string
  especialidade: string
  email: string
  clinic_id: string
}
