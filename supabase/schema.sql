-- ============================================
-- Clinica Finezza - Supabase SQL Schema
-- Sistema de Gestão Odontológica - MVP
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS
-- ============================================

-- Tabela de clínicas (multi-tenant)
CREATE TABLE clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  endereco TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de membros da clínica (vincula auth.users à clínica)
CREATE TABLE clinic_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'recepcionista' CHECK (role IN ('admin', 'dentista', 'recepcionista')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, clinic_id)
);

-- Tabela de dentistas
CREATE TABLE dentistas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  especialidade TEXT NOT NULL DEFAULT 'Clínico Geral',
  cro TEXT,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  email TEXT,
  endereco TEXT,
  historico_clinico JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinic_id, cpf)
);

-- Tabela de agendamentos
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES dentistas(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'confirmado', 'finalizado', 'cancelado')),
  procedimento TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela financeiro
CREATE TABLE financeiro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  valor DECIMAL(10, 2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  status_pagamento TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status_pagamento IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  data_vencimento DATE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_clinic_members_user ON clinic_members(user_id);
CREATE INDEX idx_clinic_members_clinic ON clinic_members(clinic_id);
CREATE INDEX idx_pacientes_clinic ON pacientes(clinic_id);
CREATE INDEX idx_pacientes_nome ON pacientes(nome);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX idx_agendamentos_clinic ON agendamentos(clinic_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_dentista ON agendamentos(dentista_id);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_financeiro_clinic ON financeiro(clinic_id);
CREATE INDEX idx_financeiro_vencimento ON financeiro(data_vencimento);
CREATE INDEX idx_financeiro_status ON financeiro(status_pagamento);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para obter clinic_id do usuário autenticado
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM clinic_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER tr_pacientes_updated_at
  BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_financeiro_updated_at
  BEFORE UPDATE ON financeiro FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_dentistas_updated_at
  BEFORE UPDATE ON dentistas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_clinicas_updated_at
  BEFORE UPDATE ON clinicas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;

-- Políticas para clinicas
CREATE POLICY "Membros podem ver sua clínica"
  ON clinicas FOR SELECT
  USING (id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid()));

-- Políticas para clinic_members
CREATE POLICY "Membros podem ver membros da sua clínica"
  ON clinic_members FOR SELECT
  USING (clinic_id = get_user_clinic_id());

-- Políticas para dentistas
CREATE POLICY "Membros podem ver dentistas da clínica"
  ON dentistas FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Admin pode gerenciar dentistas"
  ON dentistas FOR ALL
  USING (
    clinic_id = get_user_clinic_id()
    AND EXISTS (
      SELECT 1 FROM clinic_members
      WHERE user_id = auth.uid() AND clinic_id = dentistas.clinic_id AND role = 'admin'
    )
  );

-- Políticas para pacientes
CREATE POLICY "Membros podem ver pacientes da clínica"
  ON pacientes FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Membros podem inserir pacientes"
  ON pacientes FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Membros podem atualizar pacientes"
  ON pacientes FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

-- Políticas para agendamentos
CREATE POLICY "Membros podem ver agendamentos da clínica"
  ON agendamentos FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Membros podem inserir agendamentos"
  ON agendamentos FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Membros podem atualizar agendamentos"
  ON agendamentos FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

-- Políticas para financeiro
CREATE POLICY "Membros podem ver financeiro da clínica"
  ON financeiro FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Membros podem inserir financeiro"
  ON financeiro FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Membros podem atualizar financeiro"
  ON financeiro FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

-- ============================================
-- DADOS DE EXEMPLO (para desenvolvimento)
-- ============================================

-- NOTA: Execute apenas em ambiente de desenvolvimento.
-- Os dados abaixo servem como seed para testar a aplicação.
-- Em produção, os dados serão criados via interface.
