'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PersonalData } from '@/components/FormSteps/PersonalData'
import { Investment } from '@/components/FormSteps/Investment'
import { Royalties } from '@/components/FormSteps/Royalties'
import { Signatures } from '@/components/FormSteps/Signatures'

const contractSchema = z.object({
  personalData: z.object({
    nomeCompleto: z.string().min(1, 'Nome completo é obrigatório'),
    nacionalidade: z.enum(['brasileira', 'outra']),
    nacionalidadeOutra: z.string().optional(),
    estadoCivil: z.string().min(1, 'Estado civil é obrigatório'),
    profissao: z.string().min(1, 'Profissão é obrigatória'),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    cep: z.string().min(1, 'CEP é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    uf: z.string().min(1, 'UF é obrigatória'),
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
  }),
  investment: z.object({
    valorTotalKit: z.number().min(0),
    valorTotalFabrica: z.number().min(0),
    valorEntradaFabrica: z.number().min(0),
    dataLimiteEntradaFabrica: z.string().min(1),
    qtdParcelasFabrica: z.number().min(1),
    valorParcelaFabrica: z.number().min(0),
    valorTotalFranqueadora: z.number().min(0),
    valorEntradaFranqueadora: z.number().min(0),
    dataLimiteEntradaFranqueadora: z.string().min(1),
    qtdParcelasFranqueadora: z.number().min(1),
    valorParcelaFranqueadora: z.number().min(0),
    taxaFranquia: z.number().min(0),
  }),
  royalties: z
    .array(
      z.object({
        id: z.string(),
        valor: z.number(),
        descricao: z.string(),
        selecionado: z.boolean(),
      })
    )
    .min(1, 'Adicione pelo menos uma opção de royalties')
    .refine(
      (royalties) => royalties.some((r) => r.selecionado),
      { message: 'Selecione uma opção de royalties' }
    ),
  signatures: z.object({
    cidadeAssinatura: z.string().min(1, 'Cidade da assinatura é obrigatória'),
    dataAssinatura: z.string().min(1, 'Data da assinatura é obrigatória'),
    testemunhas: z.array(
      z.object({
        cpf: z.string().min(1, 'CPF da testemunha é obrigatório'),
        rg: z.string().min(1, 'RG da testemunha é obrigatório'),
      })
    ).min(1, 'Adicione pelo menos uma testemunha'),
  }),
})

type ContractFormData = z.infer<typeof contractSchema>

const steps = [
  { id: 1, name: 'Dados Pessoais', icon: 'user', component: PersonalData },
  { id: 2, name: 'Investimento', icon: 'dollar', component: Investment },
  { id: 3, name: 'Royalties', icon: 'chart', component: Royalties },
  { id: 4, name: 'Assinaturas', icon: 'pen', component: Signatures },
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const methods = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      personalData: {
        nacionalidade: 'brasileira',
        estadoCivil: 'solteiro',
      },
      investment: {
        valorTotalKit: 0,
        valorTotalFabrica: 0,
        valorEntradaFabrica: 0,
        qtdParcelasFabrica: 0,
        valorParcelaFabrica: 0,
        valorTotalFranqueadora: 0,
        valorEntradaFranqueadora: 0,
        qtdParcelasFranqueadora: 0,
        valorParcelaFranqueadora: 0,
        taxaFranquia: 0,
      },
      royalties: [
        {
          id: '1',
          valor: 990,
          descricao: 'O valor de royalties começará a ser cobrado no mês subsequente a realização da inauguração, e assim consequentemente nos meses posteriores. (Com recebimento de Cursos VOLL)',
          selecionado: false,
        },
        {
          id: '2',
          valor: 1490,
          descricao: 'O valor de royalties começará a ser cobrado no mês subsequente a realização da inauguração, e assim consequentemente nos meses posteriores. (Sem recebimento de Cursos VOLL)',
          selecionado: false,
        },
        {
          id: '3',
          valor: 0,
          descricao: 'Isenção de Royalties - Conforme condições de recebimento de cursos descritas na cláusula 11.8.',
          selecionado: false,
        },
      ],
      signatures: {
        testemunhas: [],
      },
    },
    mode: 'onChange',
  })

  const CurrentStepComponent = steps[currentStep - 1].component

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await methods.trigger(fieldsToValidate as any)
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFillTest = () => {
    methods.reset({
      personalData: {
        nomeCompleto: 'Maria Silva Santos',
        nacionalidade: 'brasileira',
        estadoCivil: 'casado',
        profissao: 'Fisioterapeuta',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        cep: '01310-100',
        cidade: 'São Paulo',
        uf: 'SP',
        rua: 'Avenida Paulista',
        numero: '1000',
        complemento: 'Sala 1001',
        bairro: 'Bela Vista',
      },
      investment: {
        valorTotalKit: 50000,
        valorTotalFabrica: 35000,
        valorEntradaFabrica: 15000,
        dataLimiteEntradaFabrica: '2025-01-15',
        qtdParcelasFabrica: 10,
        valorParcelaFabrica: 2000,
        valorTotalFranqueadora: 15000,
        valorEntradaFranqueadora: 5000,
        dataLimiteEntradaFranqueadora: '2025-01-15',
        qtdParcelasFranqueadora: 5,
        valorParcelaFranqueadora: 2000,
        taxaFranquia: 15000,
      },
      royalties: [
        {
          id: '1',
          valor: 990,
          descricao: 'O valor de royalties começará a ser cobrado no mês subsequente a realização da inauguração, e assim consequentemente nos meses posteriores. (Com recebimento de Cursos VOLL)',
          selecionado: true,
        },
        {
          id: '2',
          valor: 1490,
          descricao: 'O valor de royalties começará a ser cobrado no mês subsequente a realização da inauguração, e assim consequentemente nos meses posteriores. (Sem recebimento de Cursos VOLL)',
          selecionado: false,
        },
        {
          id: '3',
          valor: 0,
          descricao: 'Isenção de Royalties - Conforme condições de recebimento de cursos descritas na cláusula 11.8.',
          selecionado: false,
        },
      ],
      signatures: {
        cidadeAssinatura: 'São Paulo',
        dataAssinatura: new Date().toISOString().split('T')[0],
        testemunhas: [
          { cpf: '111.222.333-44', rg: '11.222.333-4' },
          { cpf: '555.666.777-88', rg: '55.666.777-8' },
        ],
      },
    })
  }

  const handleGeneratePDF = async () => {
    const isValid = await methods.trigger()
    if (!isValid) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.')
      return
    }

    setIsGeneratingPDF(true)
    try {
      const data = methods.getValues()
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Erro ao gerar PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contrato-franquia-voll.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 1: return ['personalData']
      case 2: return ['investment']
      case 3: return ['royalties']
      case 4: return ['signatures']
      default: return []
    }
  }

  const progressPercentage = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#2c2c2e]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#00f5c4] flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">VOLL Franquias</h1>
              <p className="text-xs text-[#6e6e73]">Contrato Digital</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleFillTest}
              className="px-4 py-2 text-sm font-medium text-[#a1a1a6] hover:text-white transition-colors"
            >
              Demo
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00d4aa] hover:bg-[#00f5c4] text-black font-medium rounded-full text-sm transition-all disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exportar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-[#1c1c1e]">
        <div 
          className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00f5c4] transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="pt-20 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-28">
                <nav className="space-y-1">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        currentStep === step.id
                          ? 'bg-[rgba(0,212,170,0.15)] text-[#00d4aa]'
                          : 'text-[#a1a1a6] hover:text-white hover:bg-[#1c1c1e]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                        currentStep === step.id
                          ? 'bg-[#00d4aa] text-black'
                          : currentStep > step.id
                          ? 'bg-[#30d158] text-black'
                          : 'bg-[#2c2c2e] text-[#6e6e73]'
                      }`}>
                        {currentStep > step.id ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className="font-medium text-sm">{step.name}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 p-4 rounded-xl bg-[#1c1c1e] border border-[#2c2c2e]">
                  <div className="text-xs text-[#6e6e73] uppercase tracking-wider mb-2">Progresso</div>
                  <div className="text-2xl font-semibold text-white mb-1">{Math.round(progressPercentage)}%</div>
                  <div className="text-xs text-[#a1a1a6]">Passo {currentStep} de {steps.length}</div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="animate-fade-in">
                <FormProvider {...methods}>
                  <div className="bg-[#0a0a0a] rounded-2xl border border-[#2c2c2e] overflow-hidden">
                    <div className="p-8">
                      <CurrentStepComponent />
                    </div>

                    {/* Footer Navigation */}
                    <div className="px-8 py-5 bg-[#0a0a0a] border-t border-[#2c2c2e] flex items-center justify-between">
                      <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          currentStep === 1
                            ? 'opacity-30 cursor-not-allowed text-[#6e6e73]'
                            : 'text-[#a1a1a6] hover:text-white hover:bg-[#1c1c1e]'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Anterior
                      </button>

                      {currentStep < steps.length ? (
                        <button
                          onClick={handleNext}
                          className="flex items-center gap-2 px-6 py-2.5 bg-[#00d4aa] hover:bg-[#00f5c4] text-black font-medium rounded-xl text-sm transition-all"
                        >
                          Próximo
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={handleGeneratePDF}
                          disabled={isGeneratingPDF}
                          className="flex items-center gap-2 px-6 py-2.5 bg-[#00d4aa] hover:bg-[#00f5c4] text-black font-medium rounded-xl text-sm transition-all disabled:opacity-50"
                        >
                          {isGeneratingPDF ? 'Gerando...' : 'Finalizar Contrato'}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </FormProvider>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
