import { useState, useMemo } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  isSameDay,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  setHours,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AgendamentoStatus } from '@/types/database'

type ViewMode = 'day' | 'week'

interface CalendarAppointment {
  id: string
  paciente: string
  dentista: string
  procedimento: string
  data_hora: string
  duracao_min: number
  status: AgendamentoStatus
}

const statusColors: Record<AgendamentoStatus, string> = {
  pendente: 'bg-warning/20 border-warning text-warning-foreground',
  confirmado: 'bg-primary/10 border-primary text-primary',
  finalizado: 'bg-success/10 border-success text-success',
  cancelado: 'bg-destructive/10 border-destructive text-destructive',
}

const statusLabels: Record<AgendamentoStatus, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
}

interface AppointmentCalendarProps {
  appointments: CalendarAppointment[]
  onSlotClick?: (date: Date) => void
  onAppointmentClick?: (id: string) => void
}

const HOUR_HEIGHT = 64
const START_HOUR = 7
const END_HOUR = 20

export default function AppointmentCalendar({
  appointments,
  onSlotClick,
  onAppointmentClick,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  const hours = useMemo(
    () =>
      eachHourOfInterval({
        start: setHours(startOfDay(currentDate), START_HOUR),
        end: setHours(endOfDay(currentDate), END_HOUR),
      }),
    [currentDate]
  )

  const days = useMemo(() => {
    if (viewMode === 'day') return [currentDate]
    const start = startOfWeek(currentDate, { locale: ptBR })
    const end = endOfWeek(currentDate, { locale: ptBR })
    return eachDayOfInterval({ start, end })
  }, [currentDate, viewMode])

  const navigateForward = () => {
    setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))
  }

  const navigateBackward = () => {
    setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : subDays(currentDate, 1))
  }

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.data_hora), day))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={navigateBackward}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {viewMode === 'week'
              ? `${format(days[0], "dd 'de' MMM", { locale: ptBR })} — ${format(days[days.length - 1], "dd 'de' MMM, yyyy", { locale: ptBR })}`
              : format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <Button variant="outline" size="icon" onClick={navigateForward}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Hoje
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b bg-muted/50" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
          <div className="p-2 border-r" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                'p-3 text-center border-r last:border-r-0',
                isSameDay(day, new Date()) && 'bg-primary/5'
              )}
            >
              <p className="text-xs text-muted-foreground uppercase">
                {format(day, 'EEE', { locale: ptBR })}
              </p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  isSameDay(day, new Date()) && 'text-primary'
                )}
              >
                {format(day, 'dd')}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto max-h-[600px]">
          <div className="relative grid" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
            {/* Hours column */}
            <div>
              {hours.map((hour) => (
                <div
                  key={hour.toISOString()}
                  className="border-b border-r flex items-start justify-end pr-2 pt-1"
                  style={{ height: HOUR_HEIGHT }}
                >
                  <span className="text-xs text-muted-foreground">
                    {format(hour, 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const dayAppointments = getAppointmentsForDay(day)
              return (
                <div key={day.toISOString()} className="relative border-r last:border-r-0">
                  {hours.map((hour) => (
                    <div
                      key={hour.toISOString()}
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      style={{ height: HOUR_HEIGHT }}
                      onClick={() => {
                        const slotDate = new Date(day)
                        slotDate.setHours(hour.getHours(), 0, 0, 0)
                        onSlotClick?.(slotDate)
                      }}
                    />
                  ))}

                  {/* Appointment blocks */}
                  {dayAppointments.map((apt) => {
                    const aptDate = new Date(apt.data_hora)
                    const hour = aptDate.getHours()
                    const minutes = aptDate.getMinutes()
                    const top = (hour - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT
                    const height = (apt.duracao_min / 60) * HOUR_HEIGHT

                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          'absolute left-1 right-1 rounded-lg border-l-4 px-2 py-1 cursor-pointer overflow-hidden transition-shadow hover:shadow-md',
                          statusColors[apt.status]
                        )}
                        style={{ top, height: Math.max(height, 28) }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAppointmentClick?.(apt.id)
                        }}
                      >
                        <p className="text-xs font-semibold truncate">{apt.paciente}</p>
                        <p className="text-[10px] truncate">{apt.procedimento}</p>
                        <Badge variant="outline" className="mt-0.5 text-[10px] py-0 px-1">
                          {statusLabels[apt.status]}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
