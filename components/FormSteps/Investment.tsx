'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Investment as InvestmentType } from '@/lib/contract-data'

export function Investment() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<{ investment: InvestmentType }>()

  const valorTotalFabrica = watch('investment.valorTotalFabrica') || 0
  const valorTotalFranqueadora = watch('investment.valorTotalFranqueadora') || 0
  const valorTotalKit = Number(valorTotalFabrica) + Number(valorTotalFranqueadora)

  useEffect(() => {
    setValue('investment.valorTotalKit', valorTotalKit)
  }, [valorTotalKit, setValue])

  const valorTotalFabricaNum = Number(valorTotalFabrica)
  const valorEntradaFabrica = Number(watch('investment.valorEntradaFabrica') || 0)
  const qtdParcelasFabrica = Number(watch('investment.qtdParcelasFabrica') || 0)
  const valorParcelaFabrica = qtdParcelasFabrica > 0 
    ? (valorTotalFabricaNum - valorEntradaFabrica) / qtdParcelasFabrica 
    : 0

  const valorTotalFranqueadoraNum = Number(valorTotalFranqueadora)
  const valorEntradaFranqueadora = Number(watch('investment.valorEntradaFranqueadora') || 0)
  const qtdParcelasFranqueadora = Number(watch('investment.qtdParcelasFranqueadora') || 0)
  const valorParcelaFranqueadora = qtdParcelasFranqueadora > 0 
    ? (valorTotalFranqueadoraNum - valorEntradaFranqueadora) / qtdParcelasFranqueadora 
    : 0

  useEffect(() => {
    if (qtdParcelasFabrica > 0) {
      setValue('investment.valorParcelaFabrica', Math.round(valorParcelaFabrica * 100) / 100)
    }
  }, [valorParcelaFabrica, qtdParcelasFabrica, setValue])

  useEffect(() => {
    if (qtdParcelasFranqueadora > 0) {
      setValue('investment.valorParcelaFranqueadora', Math.round(valorParcelaFranqueadora * 100) / 100)
    }
  }, [valorParcelaFranqueadora, qtdParcelasFranqueadora, setValue])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1">Investimento e Taxas</h2>
        <p className="text-[#6e6e73] text-[15px]">Valores referentes à Cláusula 11 do contrato</p>
      </div>

      {/* Total Value Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#00d4aa]/10 to-[#00d4aa]/5 border border-[#00d4aa]/20">
        <p className="text-[13px] font-medium text-[#00d4aa] uppercase tracking-wider mb-2">
          Valor Total do Kit (Equipamentos e Serviços)
        </p>
        <p className="text-4xl font-bold text-white">{formatCurrency(valorTotalKit)}</p>
      </div>

      {/* Payment Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagamento à Fábrica */}
        <div className="p-6 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#2c2c2e] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#a1a1a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Pagamento à Fábrica</h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Valor Total"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register('investment.valorTotalFabrica', { valueAsNumber: true })}
              error={errors.investment?.valorTotalFabrica?.message}
            />
            <Input
              label="Valor Entrada (Pix)"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register('investment.valorEntradaFabrica', { valueAsNumber: true })}
              error={errors.investment?.valorEntradaFabrica?.message}
            />
            <Input
              label="Data Limite Entrada"
              type="date"
              {...register('investment.dataLimiteEntradaFabrica')}
              error={errors.investment?.dataLimiteEntradaFabrica?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Qtd. Parcelas"
                type="number"
                min="1"
                placeholder="0"
                {...register('investment.qtdParcelasFabrica', { valueAsNumber: true })}
                error={errors.investment?.qtdParcelasFabrica?.message}
              />
              <div>
                <label className="block text-[13px] font-medium text-[#a1a1a6] mb-2 uppercase tracking-wide">
                  Valor Parcela
                </label>
                <div className="px-4 py-3.5 bg-[#141414] border border-[#2c2c2e] rounded-xl text-white text-[15px]">
                  {formatCurrency(valorParcelaFabrica)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagamento à Franqueadora */}
        <div className="p-6 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#2c2c2e] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#a1a1a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Pagamento à Franqueadora</h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Valor Total"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register('investment.valorTotalFranqueadora', { valueAsNumber: true })}
              error={errors.investment?.valorTotalFranqueadora?.message}
            />
            <Input
              label="Valor Entrada (Pix)"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register('investment.valorEntradaFranqueadora', { valueAsNumber: true })}
              error={errors.investment?.valorEntradaFranqueadora?.message}
            />
            <Input
              label="Data Limite Entrada"
              type="date"
              {...register('investment.dataLimiteEntradaFranqueadora')}
              error={errors.investment?.dataLimiteEntradaFranqueadora?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Qtd. Parcelas"
                type="number"
                min="1"
                placeholder="0"
                {...register('investment.qtdParcelasFranqueadora', { valueAsNumber: true })}
                error={errors.investment?.qtdParcelasFranqueadora?.message}
              />
              <div>
                <label className="block text-[13px] font-medium text-[#a1a1a6] mb-2 uppercase tracking-wide">
                  Valor Parcela
                </label>
                <div className="px-4 py-3.5 bg-[#141414] border border-[#2c2c2e] rounded-xl text-white text-[15px]">
                  {formatCurrency(valorParcelaFranqueadora)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Taxa de Franquia */}
      <div className="p-6 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#30d158]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#30d158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Taxa de Franquia</h3>
              <p className="text-[13px] text-[#6e6e73]">Isenta - Valor mencionado na cláusula 11.2.2</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#30d158]/10 text-[#30d158] text-[13px] font-medium">
            Isenta
          </span>
        </div>
        <Input
          label="Valor da Taxa"
          type="number"
          step="0.01"
          placeholder="15000,00"
          {...register('investment.taxaFranquia', { valueAsNumber: true })}
          error={errors.investment?.taxaFranquia?.message}
        />
      </div>
    </div>
  )
}
