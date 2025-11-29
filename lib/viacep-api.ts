export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

/**
 * Busca endereço completo através do CEP usando a API ViaCEP
 */
export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  const cleanedCEP = cep.replace(/\D/g, '')
  
  if (cleanedCEP.length !== 8) {
    return null
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`)
    const data: ViaCEPResponse = await response.json()
    
    if (data.erro) {
      return null
    }
    
    return data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}

/**
 * Formata CEP (00000-000)
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length <= 5) return cleaned
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
}

