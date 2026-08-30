import { describe, expect, it } from 'vitest'
import { agregarPorSemana } from './aggregation'

describe('agregarPorSemana', () => {
  it('retorna vazio quando não há séries', () => {
    expect(agregarPorSemana([])).toEqual([])
  })

  it('calcula carga máxima e volume de uma única série', () => {
    const resultado = agregarPorSemana([{ data: '2026-08-10', peso: 60, repeticoes: 10 }])
    expect(resultado).toEqual([{ semanaInicio: '2026-08-10', cargaMaxima: 60, volume: 600 }])
  })

  it('junta várias séries da mesma semana (segunda a domingo)', () => {
    // 2026-08-10 é segunda-feira; 2026-08-16 é domingo da mesma semana
    const resultado = agregarPorSemana([
      { data: '2026-08-10', peso: 60, repeticoes: 10 },
      { data: '2026-08-12', peso: 65, repeticoes: 8 },
      { data: '2026-08-16', peso: 62.5, repeticoes: 9 },
    ])
    expect(resultado).toEqual([
      { semanaInicio: '2026-08-10', cargaMaxima: 65, volume: 600 + 520 + 562.5 },
    ])
  })

  it('trata semanas sem treino simplesmente não aparecendo no resultado', () => {
    const resultado = agregarPorSemana([
      { data: '2026-08-10', peso: 60, repeticoes: 10 },
      { data: '2026-08-24', peso: 65, repeticoes: 10 },
    ])
    expect(resultado.map((r) => r.semanaInicio)).toEqual(['2026-08-10', '2026-08-24'])
  })

  it('separa semanas diferentes e ordena por data crescente', () => {
    const resultado = agregarPorSemana([
      { data: '2026-08-24', peso: 70, repeticoes: 5 },
      { data: '2026-08-10', peso: 60, repeticoes: 10 },
      { data: '2026-08-17', peso: 65, repeticoes: 8 },
    ])
    expect(resultado.map((r) => r.semanaInicio)).toEqual([
      '2026-08-10',
      '2026-08-17',
      '2026-08-24',
    ])
  })

  it('um domingo pertence à semana que começou na segunda anterior', () => {
    // 2026-08-09 é domingo; a segunda-feira anterior é 2026-08-03
    const resultado = agregarPorSemana([{ data: '2026-08-09', peso: 50, repeticoes: 10 }])
    expect(resultado[0].semanaInicio).toBe('2026-08-03')
  })
})
