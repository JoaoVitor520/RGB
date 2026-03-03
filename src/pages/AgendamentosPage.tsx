import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AgendamentoStatus } from '@/types/database'

interface CalendarAppointment {
  id: string
  paciente: string
  dentista: string
  procedimento: string
  data_hora: string
  duracao_min: number
  status: AgendamentoStatus
}

const today = new Date()

function makeTime(hours: number, minutes: number): string {
  const d = new Date(today)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

const mockAppointments: CalendarAppointment[] = [
  { id: '1', paciente: 'Maria Silva', dentista: 'Dr. João', procedimento: 'Limpeza', data_hora: makeTime(8, 0), duracao_min: 45, status: 'confirmado' },
  { id: '2', paciente: 'Pedro Santos', dentista: 'Dra. Ana', procedimento: 'Restauração', data_hora: makeTime(9, 30), duracao_min: 60, status: 'pendente' },
  { id: '3', paciente: 'Ana Costa', dentista: 'Dr. João', procedimento: 'Canal', data_hora: makeTime(11, 0), duracao_min: 90, status: 'confirmado' },
  { id: '4', paciente: 'Carlos Lima', dentista: 'Dra. Ana', procedimento: 'Extração', data_hora: makeTime(14, 0), duracao_min: 60, status: 'pendente' },
  { id: '5', paciente: 'Juliana Alves', dentista: 'Dr. João', procedimento: 'Clareamento', data_hora: makeTime(15, 30), duracao_min: 75, status: 'confirmado' },
  { id: '6', paciente: 'Roberto Souza', dentista: 'Dra. Ana', procedimento: 'Prótese', data_hora: makeTime(17, 0), duracao_min: 45, status: 'finalizado' },
]

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState(mockAppointments)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [formData, setFormData] = useState({
    paciente: '',
    dentista: '',
    procedimento: '',
    duracao_min: '45',
  })

  const handleSlotClick = (date: Date) => {
    setSelectedSlot(date)
    setDialogOpen(true)
  }

  const handleCreateAppointment = () => {
    if (!selectedSlot || !formData.paciente || !formData.procedimento) return

    const newApt: CalendarAppointment = {
      id: crypto.randomUUID(),
      paciente: formData.paciente,
      dentista: formData.dentista || 'Dr. João',
      procedimento: formData.procedimento,
      data_hora: selectedSlot.toISOString(),
      duracao_min: parseInt(formData.duracao_min),
      status: 'pendente',
    }

    setAppointments((prev) => [...prev, newApt])
    setDialogOpen(false)
    setFormData({ paciente: '', dentista: '', procedimento: '', duracao_min: '45' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Calendário de consultas e procedimentos.
          </p>
        </div>
        <Button onClick={() => { setSelectedSlot(new Date()); setDialogOpen(true) }}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <AppointmentCalendar
        appointments={appointments}
        onSlotClick={handleSlotClick}
        onAppointmentClick={(id) => {
          const apt = appointments.find((a) => a.id === id)
          if (apt) alert(`Agendamento: ${apt.paciente} — ${apt.procedimento}`)
        }}
      />

      {/* New appointment dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              {selectedSlot
                ? `Horário: ${selectedSlot.toLocaleDateString('pt-BR')} às ${selectedSlot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Preencha os dados do agendamento'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Input
                placeholder="Nome do paciente"
                value={formData.paciente}
                onChange={(e) => setFormData({ ...formData, paciente: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Dentista</Label>
              <Select
                value={formData.dentista}
                onValueChange={(v) => setFormData({ ...formData, dentista: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. João">Dr. João — Clínico Geral</SelectItem>
                  <SelectItem value="Dra. Ana">Dra. Ana — Ortodontista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Procedimento</Label>
                <Input
                  placeholder="Ex: Limpeza"
                  value={formData.procedimento}
                  onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Select
                  value={formData.duracao_min}
                  onValueChange={(v) => setFormData({ ...formData, duracao_min: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAppointment}>Agendar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
