'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RoyaltyOption } from '@/lib/contract-data'

export function Royalties() {
  const { watch, setValue } = useFormContext<{ royalties: RoyaltyOption[] }>()

  const royalties = watch('royalties') || []
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newOption, setNewOption] = useState({ valor: '', descricao: '' })

  const handleSelect = (optionId: string) => {
    const updated = royalties.map((opt) => ({
      ...opt,
      selecionado: opt.id === optionId,
    }))
    setValue('royalties', updated)
  }

  const handleAdd = () => {
    if (!newOption.valor || !newOption.descricao) return

    const newRoyalty: RoyaltyOption = {
      id: Date.now().toString(),
      valor: parseFloat(newOption.valor),
      descricao: newOption.descricao,
      selecionado: false,
    }

    setValue('royalties', [...royalties, newRoyalty])
    setNewOption({ valor: '', descricao: '' })
    setShowAddForm(false)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    const option = royalties.find((opt) => opt.id === id)
    if (option) {
      setNewOption({ valor: option.valor.toString(), descricao: option.descricao })
      setShowAddForm(true)
    }
  }

  const handleUpdate = () => {
    if (!editingId || !newOption.valor || !newOption.descricao) return

    const updated = royalties.map((opt) =>
      opt.id === editingId
        ? { ...opt, valor: parseFloat(newOption.valor), descricao: newOption.descricao }
        : opt
    )

    setValue('royalties', updated)
    setEditingId(null)
    setNewOption({ valor: '', descricao: '' })
    setShowAddForm(false)
  }

  const handleDelete = (id: string) => {
    const updated = royalties.filter((opt) => opt.id !== id)
    setValue('royalties', updated)
  }

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
        <h2 className="text-2xl font-semibold text-white mb-1">Opções de Royalties</h2>
        <p className="text-[#6e6e73] text-[15px]">Selecione a opção de royalties para o contrato</p>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {royalties.map((option) => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`
              p-5 rounded-2xl cursor-pointer transition-all duration-200 border
              ${option.selecionado
                ? 'bg-[rgba(0,212,170,0.08)] border-[#00d4aa]'
                : 'bg-[#1c1c1e] border-[#2c2c2e] hover:border-[#3a3a3c]'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                ${option.selecionado ? 'border-[#00d4aa]' : 'border-[#6e6e73]'}
              `}>
                {option.selecionado && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00d4aa]" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-lg font-semibold ${option.selecionado ? 'text-[#00d4aa]' : 'text-white'}`}>
                    {option.valor === 0 ? 'Isenção' : formatCurrency(option.valor)}
                  </span>
                  {option.valor > 0 && (
                    <span className="text-[#6e6e73] text-sm">/mês</span>
                  )}
                </div>
                <p className="text-[14px] text-[#a1a1a6] leading-relaxed">
                  {option.descricao}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(option.id); }}
                  className="p-2 rounded-lg text-[#6e6e73] hover:text-white hover:bg-[#2c2c2e] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(option.id); }}
                  className="p-2 rounded-lg text-[#6e6e73] hover:text-[#ff453a] hover:bg-[#ff453a]/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm ? (
        <div className="p-6 rounded-2xl bg-[#1c1c1e] border border-[#00d4aa]/30">
          <h3 className="text-lg font-medium text-white mb-5">
            {editingId ? 'Editar Opção' : 'Nova Opção de Royalties'}
          </h3>
          <div className="space-y-4">
            <Input
              label="Valor Mensal (R$)"
              type="number"
              step="0.01"
              placeholder="990,00"
              value={newOption.valor}
              onChange={(e) => setNewOption({ ...newOption, valor: e.target.value })}
            />
            <div>
              <label className="block text-[13px] font-medium text-[#a1a1a6] mb-2 uppercase tracking-wide">
                Descrição
              </label>
              <textarea
                value={newOption.descricao}
                onChange={(e) => setNewOption({ ...newOption, descricao: e.target.value })}
                placeholder="Descreva as condições desta opção de royalties..."
                rows={3}
                className="w-full px-4 py-3.5 bg-[#141414] border border-[#2c2c2e] rounded-xl text-white text-[15px] placeholder-[#6e6e73] resize-none focus:border-[#00d4aa] focus:ring-4 focus:ring-[rgba(0,212,170,0.15)] transition-all"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={editingId ? handleUpdate : handleAdd}>
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingId(null)
                  setNewOption({ valor: '', descricao: '' })
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-5 rounded-2xl border-2 border-dashed border-[#2c2c2e] text-[#6e6e73] hover:border-[#00d4aa] hover:text-[#00d4aa] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Nova Opção
        </button>
      )}

      {royalties.length === 0 && !showAddForm && (
        <div className="text-center py-12 text-[#6e6e73]">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-[15px]">Nenhuma opção de royalties cadastrada</p>
          <p className="text-[13px] mt-1">Clique no botão acima para adicionar</p>
        </div>
      )}
    </div>
  )
}
