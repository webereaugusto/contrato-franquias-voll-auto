'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { formatCPF, validateCPF, cleanCPF } from '@/lib/cpf-validator'
import { fetchAddressByCEP, formatCEP } from '@/lib/viacep-api'
import { PersonalData as PersonalDataType } from '@/lib/contract-data'

interface ExtendedPersonalData extends PersonalDataType {
  nacionalidadeOutra?: string
}

export function PersonalData() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<{ personalData: ExtendedPersonalData }>()

  const cep = watch('personalData.cep')
  const cpf = watch('personalData.cpf')
  const nacionalidade = watch('personalData.nacionalidade')
  const isEstrangeiro = nacionalidade === 'outra'

  useEffect(() => {
    if (cpf && !isEstrangeiro) {
      const cleaned = cleanCPF(cpf)
      if (cleaned.length === 11) {
        const formatted = formatCPF(cleaned)
        setValue('personalData.cpf', formatted, { shouldValidate: true })
      }
    }
  }, [cpf, setValue, isEstrangeiro])

  useEffect(() => {
    const cleanedCEP = cep?.replace(/\D/g, '')
    if (cleanedCEP?.length === 8) {
      const fetchAddress = async () => {
        const address = await fetchAddressByCEP(cleanedCEP)
        if (address) {
          setValue('personalData.rua', address.logradouro)
          setValue('personalData.bairro', address.bairro)
          setValue('personalData.cidade', address.localidade)
          setValue('personalData.uf', address.uf)
        }
      }
      fetchAddress()
    }
  }, [cep, setValue])

  useEffect(() => {
    if (cep) {
      const formatted = formatCEP(cep)
      if (formatted !== cep) {
        setValue('personalData.cep', formatted)
      }
    }
  }, [cep, setValue])

  const estadosCivis = [
    { value: '', label: 'Selecione...' },
    { value: 'solteiro', label: 'Solteiro(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo', label: 'Viúvo(a)' },
    { value: 'uniao-estavel', label: 'União Estável' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1">Dados Pessoais</h2>
        <p className="text-[#6e6e73] text-[15px]">Informações do franqueado para o contrato</p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Input
            label="Nome Completo"
            placeholder="Digite o nome completo"
            {...register('personalData.nomeCompleto', { required: 'Nome completo é obrigatório' })}
            error={errors.personalData?.nomeCompleto?.message}
          />
        </div>

        <div className={isEstrangeiro ? '' : 'md:col-span-1'}>
          <RadioGroup
            label="Nacionalidade"
            name="nacionalidade"
            options={[
              { value: 'brasileira', label: 'Brasileira' },
              { value: 'outra', label: 'Estrangeira' },
            ]}
            value={watch('personalData.nacionalidade')}
            onChange={(value) => setValue('personalData.nacionalidade', value as 'brasileira' | 'outra')}
            error={errors.personalData?.nacionalidade?.message}
            required
          />
        </div>

        {isEstrangeiro && (
          <Input
            label="Qual nacionalidade?"
            placeholder="Ex: Portuguesa, Italiana, etc."
            {...register('personalData.nacionalidadeOutra', { 
              required: isEstrangeiro ? 'Informe a nacionalidade' : false 
            })}
            error={errors.personalData?.nacionalidadeOutra?.message}
          />
        )}

        <Select
          label="Estado Civil"
          options={estadosCivis}
          {...register('personalData.estadoCivil', { required: 'Estado civil é obrigatório' })}
          error={errors.personalData?.estadoCivil?.message}
        />

        <Input
          label="Profissão"
          placeholder="Ex: Fisioterapeuta"
          {...register('personalData.profissao', { required: 'Profissão é obrigatória' })}
          error={errors.personalData?.profissao?.message}
        />

        <Input
          label={isEstrangeiro ? "CPF (opcional)" : "CPF"}
          placeholder="000.000.000-00"
          {...register('personalData.cpf', {
            required: isEstrangeiro ? false : 'CPF é obrigatório',
            validate: (value) => {
              if (!value || isEstrangeiro) return true
              const cleaned = cleanCPF(value)
              if (cleaned.length !== 11) return 'CPF deve ter 11 dígitos'
              if (!validateCPF(cleaned)) return 'CPF inválido'
              return true
            },
          })}
          error={errors.personalData?.cpf?.message}
          maxLength={14}
        />

        <Input
          label={isEstrangeiro ? "RG / Documento (opcional)" : "RG"}
          placeholder={isEstrangeiro ? "Passaporte, RNE, etc." : "00.000.000-0"}
          {...register('personalData.rg', { 
            required: isEstrangeiro ? false : 'RG é obrigatório' 
          })}
          error={errors.personalData?.rg?.message}
        />
      </div>

      {/* Info para estrangeiros */}
      {isEstrangeiro && (
        <div className="p-4 rounded-xl bg-[#1c1c1e] border border-[#2c2c2e] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ffd60a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#ffd60a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] text-[#a1a1a6]">
              Para estrangeiros, CPF e RG são opcionais. Você pode informar o número do passaporte ou RNE no campo de documento.
            </p>
          </div>
        </div>
      )}

      {/* Endereço Section */}
      <div className="pt-6 border-t border-[#2c2c2e]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1c1c1e] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Endereço</h3>
            <p className="text-[13px] text-[#6e6e73]">Digite o CEP para preenchimento automático</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label="CEP"
            placeholder="00000-000"
            {...register('personalData.cep', { required: 'CEP é obrigatório' })}
            error={errors.personalData?.cep?.message}
            helperText="Busca automática do endereço"
            maxLength={9}
          />

          <Input
            label="Cidade"
            placeholder="Cidade"
            {...register('personalData.cidade', { required: 'Cidade é obrigatória' })}
            error={errors.personalData?.cidade?.message}
          />

          <Input
            label="UF"
            placeholder="UF"
            {...register('personalData.uf', { required: 'UF é obrigatória' })}
            error={errors.personalData?.uf?.message}
            maxLength={2}
          />

          <div className="md:col-span-2">
            <Input
              label="Rua / Logradouro"
              placeholder="Nome da rua"
              {...register('personalData.rua', { required: 'Rua é obrigatória' })}
              error={errors.personalData?.rua?.message}
            />
          </div>

          <Input
            label="Número"
            placeholder="Nº"
            {...register('personalData.numero', { required: 'Número é obrigatório' })}
            error={errors.personalData?.numero?.message}
          />

          <Input
            label="Complemento"
            placeholder="Apto, Sala, Bloco..."
            {...register('personalData.complemento')}
          />

          <div className="md:col-span-2">
            <Input
              label="Bairro"
              placeholder="Nome do bairro"
              {...register('personalData.bairro', { required: 'Bairro é obrigatório' })}
              error={errors.personalData?.bairro?.message}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
