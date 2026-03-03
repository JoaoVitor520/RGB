import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import type { Paciente } from '@/types/database'
import { formatCPF, formatPhone } from '@/lib/utils'
import { sendWhatsAppMessage } from '@/services/webhookService'

interface PatientTableProps {
  data: Paciente[]
  onEdit: (patient: Paciente) => void
  onDelete: (id: string) => void
}

export default function PatientTable({ data, onEdit, onDelete }: PatientTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const handleSendMessage = async (patient: Paciente) => {
    const result = await sendWhatsAppMessage({
      to: patient.whatsapp,
      patientName: patient.nome,
      message: `Olá ${patient.nome}, este é um lembrete da Clinica Finezza.`,
      type: 'custom',
    })

    if (result.success) {
      alert(`Mensagem enviada para ${patient.nome}!`)
    } else {
      alert(`Erro ao enviar mensagem: ${result.error}`)
    }
  }

  const columns = useMemo<ColumnDef<Paciente>[]>(
    () => [
      {
        accessorKey: 'nome',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.getValue('nome')}</p>
            <p className="text-xs text-muted-foreground">{formatCPF(row.original.cpf)}</p>
          </div>
        ),
      },
      {
        accessorKey: 'whatsapp',
        header: 'WhatsApp',
        cell: ({ row }) => (
          <span className="text-sm">{formatPhone(row.getValue('whatsapp'))}</span>
        ),
      },
      {
        accessorKey: 'data_nascimento',
        header: 'Nascimento',
        cell: ({ row }) => {
          const date = new Date(row.getValue('data_nascimento') as string)
          return (
            <span className="text-sm">
              {date.toLocaleDateString('pt-BR')}
            </span>
          )
        },
      },
      {
        id: 'status_pagamento',
        header: 'Pagamento',
        cell: () => {
          const statuses = ['pago', 'pendente', 'atrasado'] as const
          const status = statuses[Math.floor(Math.random() * 3)]
          const config = {
            pago: { label: 'Em dia', variant: 'success' as const },
            pendente: { label: 'Pendente', variant: 'warning' as const },
            atrasado: { label: 'Atrasado', variant: 'destructive' as const },
          }
          const c = config[status]
          return <Badge variant={c.variant}>{c.label}</Badge>
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const patient = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={() => handleSendMessage(patient)}
                title="Enviar mensagem WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(patient)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(patient.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [onEdit, onDelete]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase()
      const nome = (row.getValue('nome') as string).toLowerCase()
      const cpf = row.original.cpf
      return nome.includes(search) || cpf.includes(search.replace(/\D/g, ''))
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Buscar por nome ou CPF..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Nenhum paciente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} paciente(s) encontrado(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
