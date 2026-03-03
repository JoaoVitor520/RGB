import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type TableName = 'pacientes' | 'agendamentos' | 'financeiro' | 'dentistas' | 'clinicas'

export function useSupabase() {
  const from = useCallback((table: TableName) => {
    return supabase.from(table)
  }, [])

  const select = useCallback(
    async <T>(table: TableName, columns = '*') => {
      const { data, error } = await supabase.from(table).select(columns)
      return { data: data as T[] | null, error }
    },
    []
  )

  const insert = useCallback(
    async <T>(table: TableName, values: Record<string, unknown> | Record<string, unknown>[]) => {
      const { data, error } = await supabase.from(table).insert(values).select()
      return { data: data as T[] | null, error }
    },
    []
  )

  const update = useCallback(
    async <T>(table: TableName, id: string, values: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from(table)
        .update(values)
        .eq('id', id)
        .select()
        .single()
      return { data: data as T | null, error }
    },
    []
  )

  const remove = useCallback(async (table: TableName, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    return { error }
  }, [])

  return { supabase, from, select, insert, update, remove }
}
