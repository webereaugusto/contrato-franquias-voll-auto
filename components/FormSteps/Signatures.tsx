'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Witness } from '@/lib/contract-data'
import { formatCPF, cleanCPF, validateCPF } from '@/lib/cpf-validator'

export function Signatures() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<{ signatures: { cidadeAssinatura: string; dataAssinatura: string; testemunhas: Witness[] } }>()

  const testemunhas = watch('signatures.testemunhas') || []

  const addWitness = () => {
    const newWitness: Witness = { cpf: '', rg: '' }
    setValue('signatures.testemunhas', [...testemunhas, newWitness])
  }

  const removeWitness = (index: number) => {
    const updated = testemunhas.filter((_, i) => i !== index)
    setValue('signatures.testemunhas', updated)
  }

  const updateWitness = (index: number, field: 'cpf' | 'rg', value: string) => {
    const updated = [...testemunhas]
    if (field === 'cpf') {
      const cleaned = cleanCPF(value)
      updated[index] = { ...updated[index], cpf: formatCPF(cleaned) }
    } else {
      updated[index] = { ...updated[index], rg: value }
    }
    setValue('signatures.testemunhas', updated)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1">Assinaturas</h2>
        <p className="text-[#6e6e73] text-[15px]">Dados finais para validação do documento</p>
      </div>

      {/* Local e Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Cidade da Assinatura"
          placeholder="Ex: São Paulo"
          {...register('signatures.cidadeAssinatura', { required: 'Cidade é obrigatória' })}
          error={errors.signatures?.cidadeAssinatura?.message}
        />
        <Input
          label="Data da Assinatura"
          type="date"
          {...register('signatures.dataAssinatura', { required: 'Data é obrigatória' })}
          error={errors.signatures?.dataAssinatura?.message}
        />
      </div>

      {/* Testemunhas */}
      <div className="pt-6 border-t border-[#2c2c2e]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1c1c1e] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Testemunhas</h3>
              <p className="text-[13px] text-[#6e6e73]">Adicione as pessoas que assinarão como testemunhas</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={addWitness}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar
          </Button>
        </div>

        <div className="space-y-4">
          {testemunhas.map((testemunha, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#2c2c2e] flex items-center justify-center text-[13px] font-medium text-[#a1a1a6]">
                    {index + 1}
                  </span>
                  <span className="text-[15px] font-medium text-white">Testemunha</span>
                </div>
                <button
                  onClick={() => removeWitness(index)}
                  className="p-2 rounded-lg text-[#6e6e73] hover:text-[#ff453a] hover:bg-[#ff453a]/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#a1a1a6] mb-2 uppercase tracking-wide">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={testemunha.cpf}
                    onChange={(e) => updateWitness(index, 'cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`
                      w-full px-4 py-3.5 bg-[#141414] border rounded-xl text-white text-[15px] placeholder-[#6e6e73]
                      transition-all duration-200 focus:ring-4 focus:ring-[rgba(0,212,170,0.15)]
                      ${testemunha.cpf && !validateCPF(cleanCPF(testemunha.cpf)) 
                        ? 'border-[#ff453a] focus:border-[#ff453a]' 
                        : 'border-[#2c2c2e] focus:border-[#00d4aa]'}
                    `}
                  />
                  {testemunha.cpf && !validateCPF(cleanCPF(testemunha.cpf)) && (
                    <p className="mt-2 text-[13px] text-[#ff453a]">CPF inválido</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#a1a1a6] mb-2 uppercase tracking-wide">
                    RG
                  </label>
                  <input
                    type="text"
                    value={testemunha.rg}
                    onChange={(e) => updateWitness(index, 'rg', e.target.value)}
                    placeholder="00.000.000-0"
                    className="w-full px-4 py-3.5 bg-[#141414] border border-[#2c2c2e] rounded-xl text-white text-[15px] placeholder-[#6e6e73] transition-all duration-200 focus:border-[#00d4aa] focus:ring-4 focus:ring-[rgba(0,212,170,0.15)]"
                  />
                </div>
              </div>
            </div>
          ))}

          {testemunhas.length === 0 && (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#2c2c2e]">
              <svg className="w-12 h-12 mx-auto mb-4 text-[#6e6e73] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="text-[15px] text-[#6e6e73]">Nenhuma testemunha adicionada</p>
              <p className="text-[13px] text-[#6e6e73] mt-1">Clique em "Adicionar" para incluir</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
