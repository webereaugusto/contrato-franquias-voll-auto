/**
 * Remove caracteres não numéricos do CPF
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cleanCPF(cpf)
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
}

/**
 * Valida se o CPF é válido usando o algoritmo oficial
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleaned)) return false
  
  // Valida primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(9))) return false
  
  // Valida segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(10))) return false
  
  return true
}

/**
 * Valida e formata CPF em uma única função
 */
export function validateAndFormatCPF(cpf: string): { isValid: boolean; formatted: string } {
  const cleaned = cleanCPF(cpf)
  const formatted = formatCPF(cleaned)
  const isValid = cleaned.length === 11 && validateCPF(cleaned)
  
  return { isValid, formatted }
}

