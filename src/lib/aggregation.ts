export type SetForAggregation = {
  data: string // data ISO (yyyy-mm-dd) da sessão
  peso: number
  repeticoes: number
}

export type SemanaResumo = {
  semanaInicio: string // yyyy-mm-dd, segunda-feira daquela semana
  cargaMaxima: number
  volume: number
}

function inicioDaSemana(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('-').map(Number)
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  const diaSemana = data.getUTCDay() // 0 = domingo, 1 = segunda, ...
  const diasDesdeSegunda = (diaSemana + 6) % 7
  data.setUTCDate(data.getUTCDate() - diasDesdeSegunda)
  return data.toISOString().slice(0, 10)
}

/**
 * Agrupa séries por semana (segunda a domingo), calculando a carga máxima
 * e o volume total (peso × repetições) de cada semana. Semanas sem
 * nenhuma série simplesmente não aparecem no resultado.
 */
export function agregarPorSemana(sets: SetForAggregation[]): SemanaResumo[] {
  const porSemana = new Map<string, { cargaMaxima: number; volume: number }>()

  for (const set of sets) {
    const semana = inicioDaSemana(set.data)
    const atual = porSemana.get(semana) ?? { cargaMaxima: 0, volume: 0 }
    atual.cargaMaxima = Math.max(atual.cargaMaxima, set.peso)
    atual.volume += set.peso * set.repeticoes
    porSemana.set(semana, atual)
  }

  return Array.from(porSemana.entries())
    .map(([semanaInicio, resumo]) => ({ semanaInicio, ...resumo }))
    .sort((a, b) => a.semanaInicio.localeCompare(b.semanaInicio))
}
