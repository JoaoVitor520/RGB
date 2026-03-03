import { Users, CalendarDays, DollarSign, TrendingUp } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import RecentAppointments from '@/components/dashboard/RecentAppointments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da sua clínica odontológica.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Pacientes"
          value="248"
          icon={Users}
          trend={{ value: 12, positive: true }}
          description="Pacientes cadastrados"
        />
        <MetricCard
          title="Agendamentos Hoje"
          value="12"
          icon={CalendarDays}
          trend={{ value: 8, positive: true }}
          description="4 confirmados, 8 pendentes"
        />
        <MetricCard
          title="Receita Mensal"
          value={formatCurrency(45230)}
          icon={DollarSign}
          trend={{ value: 15, positive: true }}
          description="Março 2026"
        />
        <MetricCard
          title="Taxa de Confirmação"
          value="87%"
          icon={TrendingUp}
          trend={{ value: 3, positive: true }}
          description="Média dos últimos 30 dias"
        />
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentAppointments />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-success/10">
                <div>
                  <p className="text-sm font-medium">Receitas do Mês</p>
                  <p className="text-xs text-muted-foreground">23 pagamentos recebidos</p>
                </div>
                <p className="text-lg font-bold text-success">{formatCurrency(45230)}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-destructive/10">
                <div>
                  <p className="text-sm font-medium">Despesas do Mês</p>
                  <p className="text-xs text-muted-foreground">8 pagamentos realizados</p>
                </div>
                <p className="text-lg font-bold text-destructive">{formatCurrency(12800)}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-warning/10">
                <div>
                  <p className="text-sm font-medium">A Receber (Atrasados)</p>
                  <p className="text-xs text-muted-foreground">5 pagamentos pendentes</p>
                </div>
                <p className="text-lg font-bold text-warning">{formatCurrency(8450)}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 mt-2">
                <div>
                  <p className="text-sm font-medium">Lucro Líquido</p>
                  <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
                </div>
                <p className="text-lg font-bold text-primary">{formatCurrency(32430)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
