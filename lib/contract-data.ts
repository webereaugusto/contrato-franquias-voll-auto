export interface PersonalData {
  nomeCompleto: string
  nacionalidade: 'brasileira' | 'outra'
  nacionalidadeOutra?: string
  estadoCivil: string
  profissao: string
  cpf: string
  rg: string
  cep: string
  cidade: string
  uf: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
}

export interface Investment {
  valorTotalKit: number
  valorTotalFabrica: number
  valorEntradaFabrica: number
  dataLimiteEntradaFabrica: string
  qtdParcelasFabrica: number
  valorParcelaFabrica: number
  valorTotalFranqueadora: number
  valorEntradaFranqueadora: number
  dataLimiteEntradaFranqueadora: string
  qtdParcelasFranqueadora: number
  valorParcelaFranqueadora: number
  taxaFranquia: number
}

export interface RoyaltyOption {
  id: string
  valor: number
  descricao: string
  selecionado: boolean
}

export interface Witness {
  cpf: string
  rg: string
}

export interface Signatures {
  cidadeAssinatura: string
  dataAssinatura: string
  testemunhas: Witness[]
}

export interface ContractData {
  personalData: PersonalData
  investment: Investment
  royalties: RoyaltyOption[]
  signatures: Signatures
}

