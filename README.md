# Contrato Franquias VOLL - Preenchimento Automático

Aplicativo web moderno para preenchimento automático de contratos de franquia, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## Funcionalidades

- ✅ Formulário multi-step moderno (4 etapas)
- ✅ Validação de CPF em tempo real com algoritmo oficial
- ✅ Busca automática de endereço via CEP (API ViaCEP)
- ✅ Cálculos automáticos de valores e parcelas
- ✅ Gerenciamento de opções de royalties
- ✅ Geração de PDF formatado exatamente como o modelo
- ✅ Interface moderna estilo JotForm

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form + Zod** (formulários e validação)
- **Puppeteer** (geração de PDF)
- **ViaCEP API** (busca de endereço)

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure os dados do franqueador em `config/franqueador.ts`:
```typescript
export const franqueadorData = {
  razaoSocial: 'SUA RAZÃO SOCIAL',
  nomeFantasia: 'SEU NOME FANTASIA',
  cnpj: '00.000.000/0001-00',
  // ... outros dados
}
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
contrato/
├── app/
│   ├── api/generate-pdf/    # API route para gerar PDF
│   ├── page.tsx              # Página principal
│   └── layout.tsx
├── components/
│   ├── FormSteps/            # Componentes dos steps do formulário
│   └── ui/                   # Componentes reutilizáveis
├── lib/
│   ├── cpf-validator.ts      # Validação de CPF
│   ├── viacep-api.ts         # Integração ViaCEP
│   ├── pdf-generator.ts      # Geração de PDF
│   └── contract-data.ts      # Tipos TypeScript
├── config/
│   └── franqueador.ts        # Dados fixos do franqueador
└── templates/
    └── contract-template.html # Template do contrato
```

## Uso

1. **Dados Pessoais**: Preencha as informações do franqueado. O CPF é validado automaticamente e o endereço é preenchido ao digitar o CEP.

2. **Investimento**: Informe os valores do kit, pagamentos à fábrica e franqueadora. Os valores das parcelas são calculados automaticamente.

3. **Royalties**: Selecione ou adicione opções de royalties. Você pode editar e excluir opções existentes.

4. **Assinaturas**: Informe a cidade e data da assinatura, e adicione as testemunhas com CPF e RG.

5. **Gerar PDF**: Clique em "Baixar PDF" para gerar o contrato formatado.

## Personalização do Template

Para ajustar o template do contrato, edite o arquivo `lib/pdf-generator.ts`. O template HTML é gerado dinamicamente com os dados do formulário.

## Notas

- O Puppeteer requer Node.js 18+ e pode precisar de dependências do sistema no Linux
- Para produção, considere usar um serviço de renderização de PDF ou configurar o Puppeteer adequadamente
- Os dados do franqueador devem ser configurados antes do uso

## Licença

Este projeto é privado e de uso interno.

