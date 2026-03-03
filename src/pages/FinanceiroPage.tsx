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
import { DollarSign, TrendingUp, TrendingDown, ArrowUpDown, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import type { StatusPagamento, FinanceiroTipo } from '@/types/database'

interface FinanceiroRow {
  id: string
  descricao: string
  valor: number
  tipo: FinanceiroTipo
  status_pagamento: StatusPagamento
  data_vencimento: string
  paciente?: string
}

const statusConfig: Record<StatusPagamento, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  pago: { label: 'Pago', variant: 'success' },
  pendente: { label: 'Pendente', variant: 'warning' },
  atrasado: { label: 'Atrasado', variant: 'destructive' },
  cancelado: { label: 'Cancelado', variant: 'secondary' },
}

const mockFinanceiro: FinanceiroRow[] = [
  { id: '1', descricao: 'Limpeza dental', valor: 250, tipo: 'receita', status_pagamento: 'pago', data_vencimento: '2026-03-01', paciente: 'Maria Silva' },
  { id: '2', descricao: 'Restauração', valor: 450, tipo: 'receita', status_pagamento: 'pendente', data_vencimento: '2026-03-05', paciente: 'Pedro Santos' },
  { id: '3', descricao: 'Material odontológico', valor: 1200, tipo: 'despesa', status_pagamento: 'pago', data_vencimento: '2026-03-02' },
  { id: '4', descricao: 'Canal', valor: 800, tipo: 'receita', status_pagamento: 'atrasado', data_vencimento: '2026-02-20', paciente: 'Ana Costa' },
  { id: '5', descricao: 'Aluguel do consultório', valor: 3500, tipo: 'despesa', status_pagamento: 'pago', data_vencimento: '2026-03-01' },
  { id: '6', descricao: 'Clareamento', valor: 600, tipo: 'receita', status_pagamento: 'pago', data_vencimento: '2026-03-03', paciente: 'Juliana Alves' },
  { id: '7', descricao: 'Extração', valor: 350, tipo: 'receita', status_pagamento: 'pendente', data_vencimento: '2026-03-10', paciente: 'Carlos Lima' },
  { id: '8', descricao: 'Equipamento raio-x', valor: 8500, tipo: 'despesa', status_pagamento: 'pendente', data_vencimento: '2026-03-15' },
]

export default function FinanceiroPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeTab, setActiveTab] = useState('todos')

  const filteredData = useMemo(() => {
    if (activeTab === 'todos') return mockFinanceiro
    return mockFinanceiro.filter((f) => f.tipo === activeTab)
  }, [activeTab])

  const totals = useMemo(() => {
    const receitas = mockFinanceiro.filter((f) => f.tipo === 'receita').reduce((s, f) => s + f.valor, 0)
    const despesas = mockFinanceiro.filter((f) => f.tipo === 'despesa').reduce((s, f) => s + f.valor, 0)
    return { receitas, despesas, lucro: receitas - despesas }
  }, [])

  const columns = useMemo<ColumnDef<FinanceiroRow>[]>(
    () => [
      {
        accessorKey: 'descricao',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4">
            Descrição
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.getValue('descricao')}</p>
            {row.original.paciente && (
              <p className="text-xs text-muted-foreground">{row.original.paciente}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ row }) => (
          <Badge variant={row.getValue('tipo') === 'receita' ? 'success' : 'destructive'}>
            {row.getValue('tipo') === 'receita' ? 'Receita' : 'Despesa'}
          </Badge>
        ),
      },
      {
        accessorKey: 'valor',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4">
            Valor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className={row.original.tipo === 'receita' ? 'text-success font-medium' : 'text-destructive font-medium'}>
            {row.original.tipo === 'despesa' ? '- ' : ''}{formatCurrency(row.getValue('valor'))}
          </span>
        ),
      },
      {
        accessorKey: 'status_pagamento',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status_pagamento') as StatusPagamento
          const config = statusConfig[status]
          return <Badge variant={config.variant}>{config.label}</Badge>
        },
      },
      {
        accessorKey: 'data_vencimento',
        header: 'Vencimento',
        cell: ({ row }) => (
          <span className="text-sm">
            {new Date(row.getValue('data_vencimento') as string).toLocaleDateString('pt-BR')}
          </span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Receitas, despesas e controle financeiro.</p>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receitas</p>
              <p className="text-xl font-bold text-success">{formatCurrency(totals.receitas)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(totals.despesas)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(totals.lucro)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="receita">Receitas</TabsTrigger>
            <TabsTrigger value="despesa">Despesas</TabsTrigger>
          </TabsList>
          <Input
            placeholder="Buscar..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b bg-muted/50">
                    {hg.headers.map((header) => (
                      <th key={header.id} className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
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
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} registro(s)
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Próxima
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
