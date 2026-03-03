import { CalendarDays, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AgendamentoStatus } from '@/types/database'

interface Appointment {
  id: string
  paciente: string
  dentista: string
  procedimento: string
  data_hora: string
  status: AgendamentoStatus
}

const statusConfig: Record<AgendamentoStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }> = {
  pendente: { label: 'Pendente', variant: 'warning' },
  confirmado: { label: 'Confirmado', variant: 'default' },
  finalizado: { label: 'Finalizado', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'destructive' },
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    paciente: 'Maria Silva',
    dentista: 'Dr. João',
    procedimento: 'Limpeza',
    data_hora: new Date().toISOString(),
    status: 'confirmado',
  },
  {
    id: '2',
    paciente: 'Pedro Santos',
    dentista: 'Dra. Ana',
    procedimento: 'Restauração',
    data_hora: new Date(Date.now() + 3600000).toISOString(),
    status: 'pendente',
  },
  {
    id: '3',
    paciente: 'Ana Costa',
    dentista: 'Dr. João',
    procedimento: 'Canal',
    data_hora: new Date(Date.now() + 7200000).toISOString(),
    status: 'confirmado',
  },
  {
    id: '4',
    paciente: 'Carlos Oliveira',
    dentista: 'Dra. Ana',
    procedimento: 'Extração',
    data_hora: new Date(Date.now() + 10800000).toISOString(),
    status: 'pendente',
  },
]

export default function RecentAppointments() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Agendamentos de Hoje
        </CardTitle>
        <Badge variant="secondary">{mockAppointments.length} consultas</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAppointments.map((apt) => {
            const config = statusConfig[apt.status]
            const time = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <div
                key={apt.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{apt.paciente}</p>
                  <p className="text-xs text-muted-foreground">
                    {apt.procedimento} — {apt.dentista}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{time}</p>
                  <Badge variant={config.variant} className="mt-1">
                    {config.label}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
