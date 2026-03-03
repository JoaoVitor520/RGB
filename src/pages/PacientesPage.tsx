import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PatientTable from '@/components/patients/PatientTable'
import PatientFormDialog from '@/components/patients/PatientFormDialog'
import type { Paciente } from '@/types/database'

const mockPatients: Paciente[] = [
  {
    id: '1',
    nome: 'Maria Silva Santos',
    cpf: '12345678901',
    whatsapp: '11999887766',
    data_nascimento: '1985-03-15',
    historico_clinico: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: '1',
  },
  {
    id: '2',
    nome: 'Pedro Henrique Oliveira',
    cpf: '98765432100',
    whatsapp: '11988776655',
    data_nascimento: '1990-07-22',
    historico_clinico: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: '1',
  },
  {
    id: '3',
    nome: 'Ana Carolina Costa',
    cpf: '45678912300',
    whatsapp: '11977665544',
    data_nascimento: '1978-11-08',
    historico_clinico: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: '1',
  },
  {
    id: '4',
    nome: 'Carlos Eduardo Lima',
    cpf: '32165498700',
    whatsapp: '11966554433',
    data_nascimento: '1995-01-30',
    historico_clinico: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: '1',
  },
  {
    id: '5',
    nome: 'Juliana Ferreira Alves',
    cpf: '78945612300',
    whatsapp: '11955443322',
    data_nascimento: '1982-06-12',
    historico_clinico: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: '1',
  },
  {
    id: '6',
    nome: 'Roberto Nascimento',
    cpf: '15935745600',
    whatsapp: '11944332211',
    data_nascimento: '1970-09-25',
    historico_clinico: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: '1',
  },
  {
    id: '7',
    nome: 'Fernanda Rodrigues',
    cpf: '35715945600',
    whatsapp: '11933221100',
    data_nascimento: '1988-12-03',
    historico_clinico: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: '1',
  },
  {
    id: '8',
    nome: 'Lucas Mendes de Souza',
    cpf: '95175345600',
    whatsapp: '11922110099',
    data_nascimento: '2000-04-18',
    historico_clinico: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: '1',
  },
]

export default function PacientesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null)
  const [patients, setPatients] = useState<Paciente[]>(mockPatients)

  const handleEdit = (patient: Paciente) => {
    setEditingPatient(patient)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este paciente?')) {
      setPatients((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleSave = (data: Partial<Paciente>) => {
    if (editingPatient) {
      setPatients((prev) =>
        prev.map((p) => (p.id === editingPatient.id ? { ...p, ...data } : p))
      )
    } else {
      const newPatient: Paciente = {
        id: crypto.randomUUID(),
        nome: data.nome ?? '',
        cpf: data.cpf ?? '',
        whatsapp: data.whatsapp ?? '',
        data_nascimento: data.data_nascimento ?? '',
        historico_clinico: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clinic_id: '1',
      }
      setPatients((prev) => [newPatient, ...prev])
    }
    setEditingPatient(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro de pacientes da clínica.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPatient(null)
            setDialogOpen(true)
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Table */}
      <PatientTable data={patients} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Dialog */}
      <PatientFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingPatient(null)
        }}
        patient={editingPatient}
        onSave={handleSave}
      />
    </div>
  )
}
