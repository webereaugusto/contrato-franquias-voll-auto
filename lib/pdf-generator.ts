import { ContractData } from './contract-data'
import { franqueadorData } from '@/config/franqueador'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

/**
 * Converte número para extenso em português
 */
function numberToWords(num: number): string {
  if (num === 0) return 'zero'
  
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  if (num < 10) return units[num]
  if (num < 20) return teens[num - 10]
  if (num < 100) {
    const ten = Math.floor(num / 10)
    const unit = num % 10
    return tens[ten] + (unit > 0 ? ' e ' + units[unit] : '')
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100)
    const remainder = num % 100
    if (hundred === 1 && remainder === 0) return 'cem'
    return hundreds[hundred] + (remainder > 0 ? ' e ' + numberToWords(remainder) : '')
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000)
    const remainder = num % 1000
    const thousandWord = thousand === 1 ? 'mil' : numberToWords(thousand) + ' mil'
    return thousandWord + (remainder > 0 ? ' e ' + numberToWords(remainder) : '')
  }
  return num.toString()
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata valor monetário com R$
 */
function formatCurrencyFull(value: number): string {
  return 'R$ ' + formatCurrency(value)
}

/**
 * Formata data para português
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00')
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateString
  }
}

/**
 * Formata data para maiúsculo
 */
function formatDateUpper(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00')
    return format(date, "dd 'DE' MMMM 'DE' yyyy", { locale: ptBR }).toUpperCase()
  } catch {
    return dateString.toUpperCase()
  }
}

/**
 * Preenche o template HTML com os dados do contrato
 */
export function fillContractTemplate(data: ContractData): string {
  const { personalData, investment, royalties, signatures } = data
  
  // Encontrar royalty selecionado
  const selectedRoyalty = royalties.find(r => r.selecionado) || royalties[0]
  
  // Montar endereço do franqueado
  const enderecoFranqueado = `${personalData.rua}, ${personalData.numero}${personalData.complemento ? ', ' + personalData.complemento : ''}, ${personalData.bairro}, ${personalData.cidade}/${personalData.uf}, CEP: ${personalData.cep}`
  
  // Nacionalidade
  const nacionalidade = personalData.nacionalidade === 'brasileira' 
    ? 'brasileiro(a)' 
    : (personalData.nacionalidadeOutra || 'estrangeiro(a)')
  
  // Estado civil
  const estadoCivilMap: Record<string, string> = {
    'solteiro': 'solteiro(a)',
    'casado': 'casado(a)',
    'divorciado': 'divorciado(a)',
    'viuvo': 'viúvo(a)',
    'uniao-estavel': 'união estável',
  }
  const estadoCivil = estadoCivilMap[personalData.estadoCivil] || personalData.estadoCivil

  // Valor do royalty em extenso
  const royaltyValorExtenso = numberToWords(Math.floor(selectedRoyalty.valor))

  // Determinar texto do royalty baseado na opção selecionada
  let royaltyTexto = ''
  if (selectedRoyalty.valor === 990) {
    royaltyTexto = `<strong>Opção 1:</strong> R$ 990,00 (novecentos e noventa reais) ao mês – COM recebimento de Cursos VOLL.`
  } else if (selectedRoyalty.valor === 1490) {
    royaltyTexto = `<strong>Opção 2:</strong> R$ 1.490,00 (um mil quatrocentos e noventa reais) ao mês – SEM recebimento de Cursos VOLL.`
  } else if (selectedRoyalty.valor === 0) {
    royaltyTexto = `<strong>Opção 3:</strong> Isenção de Royalties – Conforme condições de recebimento de cursos descritas na cláusula 11.8.`
  } else {
    royaltyTexto = `<strong>Opção Personalizada:</strong> ${formatCurrencyFull(selectedRoyalty.valor)} (${royaltyValorExtenso} reais) ao mês. ${selectedRoyalty.descricao}`
  }

  const template = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Contrato de Franquia VOLL PILATES STUDIOS</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm 2.5cm 2cm;
      @bottom-right {
        content: counter(page);
        font-family: 'Times New Roman', Times, serif;
        font-size: 10pt;
        color: #666;
      }
    }
    
    /* Contador de páginas para Puppeteer */
    .page-number {
      position: fixed;
      bottom: 1cm;
      right: 1cm;
      font-size: 10pt;
      color: #666;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.35;
      color: #000;
      background: #fff;
    }
    .page-break {
      page-break-before: always;
    }
    
    /* CAPA */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }
    .cover-title {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      line-height: 1.6;
    }
    
    /* CONTEÚDO */
    .content {
      text-align: justify;
    }
    .header-title {
      text-align: center;
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 20px;
      line-height: 1.45;
    }
    p {
      text-align: justify;
      text-indent: 0;
      margin-bottom: 10px;
      line-height: 1.35;
    }
    p.indent {
      text-indent: 1.25cm;
    }
    .bold {
      font-weight: bold;
    }
    .underline {
      text-decoration: underline;
    }
    .center {
      text-align: center;
    }
    
    /* Cláusulas */
    .clause-title {
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .sub-clause {
      margin-left: 1.2cm;
      margin-bottom: 8px;
      text-indent: -0.8cm;
      padding-left: 0.8cm;
    }
    .sub-clause-item {
      margin-left: 1.8cm;
      margin-bottom: 6px;
      text-indent: -0.6cm;
      padding-left: 0.6cm;
    }
    .roman-list {
      margin-left: 1cm;
      margin-bottom: 10px;
    }
    .roman-list p {
      margin-bottom: 8px;
      text-indent: 0;
    }
    
    /* Assinaturas */
    .signature-section {
      margin-top: 40px;
      page-break-inside: avoid;
    }
    .signature-date {
      text-align: center;
      font-weight: bold;
      margin-bottom: 30px;
      text-transform: uppercase;
    }
    .signature-block {
      margin-top: 40px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 80%;
      margin: 0 auto;
      padding-top: 5px;
    }
    .witness-section {
      margin-top: 30px;
    }
    .witness-block {
      margin-bottom: 20px;
    }
    
    /* Caixas de valores */
    .value-box {
      border: 1px solid #000;
      padding: 10px 15px;
      margin: 15px 0;
      text-align: center;
    }
    .value-box-orange {
      border: 2px solid #e67e00;
      padding: 15px;
      margin: 15px 0;
    }
    .value-box-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 8px;
    }
    .value-highlight {
      font-weight: bold;
    }
    .text-orange {
      color: #e67e00;
    }
  </style>
</head>
<body>

<!-- PÁGINA 1: CAPA -->
<div class="cover-page">
  <div class="cover-title">
    CONTRATO DE FRANQUIA VOLL PILATES STUDIOS<br>
    MODALIDADE STUDIO PRO
  </div>
</div>

<!-- PÁGINA 2: INÍCIO DO CONTRATO -->
<div class="page-break"></div>
<div class="content">

<div class="header-title">
  CONTRATO DE FRANQUIA VOLL PILATES<br>
  STUDIOS MODALIDADE STUDIO PRO
</div>

<p class="indent">
Pelo presente instrumento particular e na melhor forma do direito, de um lado <strong>WOLF GESTÃO DE ATIVOS LTDA – VOLL PILATES STUDIOS</strong>, pessoa jurídica de direito privado, com sede na cidade de Porto Alegre, na Avenida Diário de Notícias, 200, sala 706, Porto Alegre, RS, devidamente inscrita no CNPJ sob o número 33.489.631/0001-75, neste ato representado pelo sócio Diretor <strong>HENRIQUE TONETO WOLF</strong>, brasileiro, divorciado, educador físico, portador do RG 3071458156 inscrito no CPF Nº 80577687034, residente e domiciliado em Porto Alegre-RS, doravante denominada <strong>FRANQUEADORA</strong> e <strong><u>${personalData.nomeCompleto.toUpperCase()}</u></strong>, <u>${nacionalidade}</u>, <u>${estadoCivil}</u>, <u>${personalData.profissao}</u>, portador(a) do RG Nº <u>${personalData.rg}</u> inscrito(a) no CPF Nº <u>${personalData.cpf}</u>, residente e domiciliado(a) na <u>${enderecoFranqueado}</u> denominado(a) simplesmente <strong>FRANQUEADO(A)</strong>, têm entre si justo e acordado o presente CONTRATO DE FRANQUIA VOLL PILATES STUDIOS.
</p>

<p class="bold">Considerações iniciais:</p>

<div class="roman-list">
<p>I. A <strong>FRANQUEADORA</strong> desenvolveu um modelo de negócio voltado a implementação e gestão de Studios de Pilates, denominado VOLL PILATES STUDIOS, que atende o público com serviços de aulas de atividades físicas, dentre elas, o Método Pilates, Treinamento Funcional, Método Abdominal Hipopressivo e Treinamento Suspenso;</p>

<p>II. A <strong>FRANQUEADORA</strong> disponibilizará seu know-how ao <strong>FRANQUEADO</strong> por meio de treinamentos e capacitações, sejam elas presenciais, escritos ou on-line.</p>

<p>III. A MARCA VOLL PILATES STUDIOS foi depositada e deferida perante o Instituto Nacional de Propriedade Industrial e teve seu pedido de registro sob o nº 916.707.512 na classe NCL 11 (35) e será concedida ao <strong>FRANQUEADO</strong> em caráter não exclusivo, no território compreendido neste Contrato de Franquia celebrado entre as partes.</p>

<p>IV. A <strong>FRANQUEADORA</strong> é detentora dos direitos de uso da marca VOLL PILATES STUDIOS, conforme registro 916707512 constante no INPI e documento esse anexo a COF;</p>

<p>V. O <strong>FRANQUEADO</strong> tem interesse em operar uma FRANQUIA VOLL PILATES STUDIOS mediante adoção de todo o modelo de negócio oferecido e se compromete a seguir na integralidade os manuais e orientações da <strong>FRANQUEADORA</strong>;</p>

<p>VI. O <strong>FRANQUEADO</strong> está ciente que a <strong>FRANQUEADORA</strong> não efetua a cobrança de Fundo Nacional de Marketing;</p>

<p>VII. O <strong>FRANQUEADO</strong> declara expressamente não ter recebido da <strong>FRANQUEADORA</strong> qualquer garantia de lucro;</p>

<p>VIII. A <strong>FRANQUEADORA</strong> disponibilizou, através da COF - CIRCULAR DE OFERTA DE FRANQUIA, todos os esclarecimentos e informações sobre o negócio VOLL PILATES STUDIOS;</p>

<p>IX. O <strong>FRANQUEADO</strong> recebeu a COF - CIRCULAR DE OFERTA DE FRANQUIA, há mais de 10 (dez) dias, tendo estudado e concordado com todas as informações, dados, cláusulas e condições constantes nos referidos documentos e tendo dirimido suas dúvidas;</p>

<p>X. A <strong>FRANQUEADORA</strong> em nenhum momento fez qualquer tipo de promessa e garantia quanto a resultados ou rentabilidade do negócio;</p>

<p>XI. Não há negócio sem risco. Ainda que se considere toda a estrutura e operação do sistema de franquias, não há por parte da <strong>FRANQUEADORA</strong>, qualquer promessa de resultado.</p>

<p>XII. DA NÃO OBRIGATORIEDADE DO SEGURO - A <strong>FRANQUEADORA</strong> não exige como obrigatório que o <strong>FRANQUEADO</strong> realize seguro do local e da sua atividade, contudo, em decorrência do negócio, sugere que o <strong>FRANQUEADO</strong> realize o seguro dependendo das variações de local e do número de alunos existentes.</p>

<p>XIII. A <strong>FRANQUEADORA</strong> durante a vigência do contrato de franquia realizará a supervisão da rede, ou seja, poderá fazer visitas nas unidades, com o intuito de auxiliar no desempenho e na melhoria do negócio.</p>

<p>XIV. A Taxa de Franquia de R$ ${formatCurrency(investment.taxaFranquia)} foi ISENTA ao franqueado.</p>
</div>

<p class="indent">
Assim, cientes e sabedoras de suas responsabilidades e direitos, as partes resolvem espontaneamente celebrar o presente <strong>CONTRATO DE FRANQUIA</strong>, nas seguintes condições dispostas nas páginas seguintes:
</p>

<p class="clause-title">1. OBJETO</p>
<p class="sub-clause">1.1. O OBJETO do presente CONTRATO é a concessão, pela <strong>FRANQUEADORA</strong> ao <strong>FRANQUEADO</strong>, o direito exclusivo, pessoal e intransferível, de utilizar fielmente o modelo de negócio VOLL PILATES STUDIOS, com as técnicas e KNOW-HOW específicos da MARCA, bem como toda a padronização e sinais distintivos contidos nos manuais e demais materiais de orientação.</p>

<p class="clause-title">2. DIREITO PERSONALÍSSIMO, SOLIDARIEDADE E INDEPENDÊNCIA DAS PARTES</p>
<p class="sub-clause">2.1. O presente CONTRATO tem caráter personalíssimo, sendo firmado em Intuito Personae, sendo o <strong>FRANQUEADO</strong> responsável por concluir o treinamento inicial promovido pela <strong>FRANQUEADORA</strong>, bem como gerir ou administrar a sua UNIDADE, nos termos desse CONTRATO, devendo, necessariamente, ter participação no capital social e poderes de administrador da empresa que irá operar a UNIDADE.</p>

<p class="sub-clause">2.2. A UNIDADE deverá ser implantada em até 180 dias a partir da assinatura deste instrumento ou em até 03 meses, após o envio de todos os equipamentos, mediante a constituição de empresa própria, pessoa jurídica da qual o <strong>FRANQUEADO</strong> detenha capital social superior a 50% e poderes de administrador, sendo referida empresa juridicamente autônoma da <strong>FRANQUEADORA</strong>, vedando-se completamente a utilização do nome VOLL PILATES STUDIOS ou palavras similares, gráfica ou foneticamente, à MARCA, na criação da denominação social da pessoa jurídica do <strong>FRANQUEADO</strong>.</p>

<p class="sub-clause">2.3. A UNIDADE será operada por pessoa jurídica diversa e independente da <strong>FRANQUEADORA</strong>, a ser constituída exclusivamente para esse fim, proibindo-se a inclusão de atividades estranhas a esse CONTRATO no objeto social.</p>

<p class="sub-clause">2.4. Em nenhum momento a <strong>FRANQUEADORA</strong> poderá ser responsabilizada por qualquer débito ou infração legal de responsabilidade da UNIDADE perante FORNECEDORES, COLABORADORES, governo ou terceiros.</p>

<p class="sub-clause">2.5. A EMPRESA FRANQUEADA deverá fazer cumprir todas as regras trabalhistas, contratuais e de conselhos de classe em que estiver inserta, registrando e mantendo atualizados os documentos de seus COLABORADORES, honrando pontualmente com as obrigações trabalhistas, previdenciárias e fiscais.</p>

<p class="sub-clause">2.6. Havendo qualquer tipo de processo administrativo, judicial ou extrajudicial, arbitral ou de qualquer tipo, relativamente à atividade do <strong>FRANQUEADO</strong> e/ou da EMPRESA FRANQUEADA, junto ao PROCON, órgãos de proteção ao consumidor, bem como qualquer órgão no âmbito federal, estadual ou municipal, fica ajustado que a responsabilidade será exclusiva do <strong>FRANQUEADO</strong> e da EMPRESA FRANQUEADA, quanto à solução da lide e contratação de profissionais para esse fim. Em hipótese alguma haverá vínculo de natureza trabalhista ou previdenciária, ou de qualquer subordinação entre os COLABORADORES da <strong>FRANQUEADORA</strong> e do <strong>FRANQUEADO</strong> ou da EMPRESA FRANQUEADA.</p>

<p class="sub-clause">2.7. Caso a <strong>FRANQUEADORA</strong> seja demandada por qualquer FORNECEDOR, ou CLIENTE, ou por qualquer pessoa ligada ao <strong>FRANQUEADO</strong> ou a EMPRESA FRANQUEADA, é dever do <strong>FRANQUEADO</strong> ou à EMPRESA FRANQUEADA ingressar nos autos e requerer imediatamente a exclusão da <strong>FRANQUEADORA</strong> do polo passivo, arcando ainda com todo o dano que venha a causar à <strong>FRANQUEADORA</strong>, nos termos da legislação civil em vigor.</p>

<p class="clause-title">3. PRAZO DE CONTRATO E CONDIÇÃO DE RENOVAÇÃO</p>
<p class="sub-clause">3.1. O presente CONTRATO terá o prazo de vigência de 05 (cinco) anos, a contar da data de sua assinatura.</p>

<p class="sub-clause">3.2. Ao final do contrato, o mesmo poderá ser renovado por igual período, sem cobrança de taxa de renovação de franquia. Contudo, para que ocorra a renovação do Contrato de Franquia o <strong>FRANQUEADO</strong> deverá estar adimplente em relação aos royalties e eventuais débitos, bem como cumprindo as demais regras descritas no contrato.</p>

<p class="clause-title">4. TERRITÓRIO</p>
<p class="sub-clause">4.1. A <strong>FRANQUEADORA</strong> faz a concessão, tratada na cláusula 1ª acima, à FRANQUEADA, durante o prazo deste contrato, concedendo exclusividade de atuação no território assim determinado.</p>

<p class="sub-clause-item">I. É de responsabilidade do <strong>FRANQUEADO</strong>, conhecedor da região onde pretende instalar uma UNIDADE VOLL PILATES STUDIOS, realizar a escolha do PONTO COMERCIAL. A <strong>FRANQUEADORA</strong> fornecerá as premissas para a escolha adequada do ponto de acordo com o seu conhecimento do negócio e mercado, entretanto, a decisão final é do <strong>FRANQUEADO</strong>.</p>

<p class="sub-clause">4.2. A atuação da UNIDADE VOLL PILATES STUDIOS será permitida exclusivamente no endereço da UNIDADE, não sendo autorizada a realização de serviços ou venda fora do estabelecimento. Não é permitido ao <strong>FRANQUEADO</strong> alterar o nome ou endereço de sua UNIDADE, sem a prévia e expressa anuência da <strong>FRANQUEADORA</strong>, mediante adendo contratual.</p>

<p class="sub-clause">4.3. Em cidades com até 30 mil habitantes o <strong>FRANQUEADO</strong> terá exclusividade de atuação da cidade.</p>

<p class="sub-clause">4.4. Nas cidades com população superior a 30 mil habitantes deverá ser respeitado uma distância mínima de 1km de cada UNIDADE existente.</p>

<p class="sub-clause-item">I. A <strong>FRANQUEADORA</strong> poderá AUMENTAR a distância mínima quando o estudo de geolocalização indicar a necessidade de espaçamento maior entre as UNIDADES.</p>

<p class="sub-clause">4.5. Em caso de rescisão do contrato de franquia ou ao seu término sem renovação, o <strong>FRANQUEADO</strong> obriga-se a não explorar direta ou indiretamente, por si ou por intermédio de terceiros, a prestação de serviços de Pilates no mesmo ponto comercial em que está instalada a UNIDADE FRANQUEADA VOLL para não incorrer em concorrência desleal.</p>

<p class="sub-clause">4.6. Assim que aprovado o território, a FRANQUEADA deverá informar para a <strong>FRANQUEADORA</strong> o LOCAL e solicitar a assinatura de um aditivo Contratual a fim de resguardar direitos territoriais. Além disso, sugere-se, também, que a FRANQUEADA abra sua empresa por meio de inscrição de CNPJ e também informe e solicite o aditivo competente.</p>

<p class="clause-title">5. SERVIÇOS E PRODUTOS</p>
<p class="sub-clause">5.1. O ROL DE SERVIÇOS já previamente autorizados e disponíveis para utilização do <strong>FRANQUEADO</strong> na UNIDADE serão descritos a seguir: Pilates; Mat Pilates; Pilates em Grupo;</p>

<p class="sub-clause">5.2. MAH (Método Abdominal Hipopressivo); VOLL Suspension (Pilates e Funcional em Suspensão) e Treinamento Funcional.</p>

<p class="sub-clause">5.3. A <strong>FRANQUEADORA</strong> poderá incluir novos serviços e produtos dentro do ROL de serviços e permitirá ao <strong>FRANQUEADO</strong> que inclua em sua UNIDADE.</p>

<p class="sub-clause">5.4. As atividades a seguir já estão previamente liberadas pela <strong>FRANQUEADORA</strong> para o <strong>FRANQUEADO</strong> incluir em sua unidade, se assim desejar: Treinamento Funcional, musculação, estética e dermato-funcional, clínica médica e fisioterapia, nutrição e psicologia.</p>

<p class="sub-clause">5.5. Qualquer outra atividade ligada a área de fisioterapia, educação física, nutrição e similares, que não esteja elencada no item acima, somente poderá ser explorada na UNIDADE mediante autorização expressa da <strong>FRANQUEADORA</strong>, devendo ser feito requerimento por e-mail.</p>

<p class="clause-title">6. IMPLANTAÇÃO DA UNIDADE E PADRÕES ARQUITETÔNICOS</p>
<p class="sub-clause">6.1. A UNIDADE deverá ser implantada e operada com zelo e profissionalismo, seguindo as orientações da <strong>FRANQUEADORA</strong> por meio de manuais ou vídeo-manuais, orientação da equipe da <strong>FRANQUEADORA</strong> ou plataforma do <strong>FRANQUEADO</strong>, obedecendo as diretrizes para instalação e gerenciamento de uma UNIDADE VOLL PILATES STUDIOS.</p>

<p class="sub-clause">6.2. Responsabilidade pelos Projetos e Execução da Obra - A <strong>FRANQUEADORA</strong> disponibiliza aos FRANQUEADOS a possibilidade de contratar profissionais e empresas parceiros da marca, previamente homologados, para o desenvolvimento de projetos arquitetônicos e de interiores das unidades VOLL PILATES STUDIOS. O projeto arquitetônico já está incluído no pagamento do kit inicial.</p>

<p class="sub-clause">6.2.1. Os projetos arquitetônicos são elaborados por profissionais autônomos e independentes, devidamente habilitados e cadastrados junto ao Conselho de Arquitetura e Urbanismo (CAU), cuja responsabilidade técnica e legal restringe-se à concepção e ao desenvolvimento do projeto, conforme padrões visuais e operacionais estabelecidos pela <strong>FRANQUEADORA</strong>.</p>

<p class="sub-clause">6.2.2. Os projetos elaborados, pela arquiteta homologada, serão entregues em formato digital, por meio eletrônico, contendo todas as informações necessárias à sua correta compreensão e execução.</p>

<p class="sub-clause">6.2.3. A arquiteta homologada se compromete a prestar suporte técnico à distância para o esclarecimento de eventuais dúvidas relativas ao entendimento do projeto, sem que tal suporte implique em acompanhamento de obra ou responsabilidade sobre sua execução.</p>

<p class="sub-clause">6.2.4. O atendimento remoto da arquiteta homologada será limitado a orientações sobre o conteúdo do projeto, não incluindo visitas técnicas, compatibilização em campo, ajustes decorrentes de condições específicas do local, nem validação de soluções construtivas adotadas durante a execução.</p>

<p class="sub-clause">6.2.5. A execução da obra, incluindo a contratação de mão de obra, fornecedores, aquisição de materiais, cumprimento de prazos, segurança, qualidade dos serviços e observância das normas técnicas, é de responsabilidade exclusiva do <strong>FRANQUEADO</strong> e/ou das empresas e profissionais por ele contratados, não cabendo à <strong>FRANQUEADORA</strong> nem aos arquitetos parceiros qualquer responsabilidade solidária ou subsidiária por eventuais vícios, falhas construtivas, atrasos, acidentes, danos materiais ou pessoais decorrentes da execução.</p>

<p class="sub-clause">6.2.6. O suporte técnico prestado pelos arquitetos parceiros, quando houver, limita-se a esclarecimentos remotos sobre o conteúdo do projeto, não implicando acompanhamento de obra, validação de soluções construtivas ou responsabilidade sobre sua execução.</p>

<p class="sub-clause">6.2.7. Qualquer serviço adicional, como acompanhamento presencial de obra, revisões, adequações ou compatibilizações, deverá ser objeto de contratação específica e independente entre o franqueado e o profissional responsável, sem qualquer intermediação, ingerência ou solidariedade da <strong>FRANQUEADORA</strong>.</p>

<p class="sub-clause">6.2.8. A <strong>FRANQUEADORA</strong> atua, portanto, exclusivamente como intermediadora da indicação técnica e não assume obrigações, garantias ou riscos decorrentes de contratos firmados diretamente entre o <strong>FRANQUEADO</strong> e os profissionais indicados.</p>

<p class="clause-title">7. DIREITOS E DEVERES DO FRANQUEADO</p>
<p class="sub-clause">7.1. Com a assinatura do presente CONTRATO, o <strong>FRANQUEADO</strong> terá direito a:</p>
<p class="sub-clause">7.1.2 Receber ou acessar os Manuais da Franquia, com os procedimentos de administração e operação da UNIDADE FRANQUEADA;</p>
<p class="sub-clause">7.1.3 Utilizar a marca para todas as atividades inerentes à franquia, durante a vigência do contrato;</p>
<p class="sub-clause">7.1.4 Receber treinamento para administração e operação de sua UNIDADE FRANQUEADA;</p>
<p class="sub-clause">7.1.5 Receber apoio e orientação da <strong>FRANQUEADORA</strong>;</p>
<p class="sub-clause">7.1.6 Realizar cursos e capacitações do Grupo VOLL com 50% de desconto;</p>
<p class="sub-clause">7.1.7 Receber acesso a Plataforma do <strong>FRANQUEADO</strong>.</p>
<p class="sub-clause">7.1.8 Receber um projeto arquitetônico, desenvolvido por arquiteta homologada;</p>

<p class="sub-clause">7.2 São deveres do <strong>FRANQUEADO</strong>:</p>
<p class="sub-clause">7.2.2 Aplicar em sua UNIDADE os conhecimentos repassados pela <strong>FRANQUEADORA</strong>, por meio de treinamentos e manuais, seguindo sempre suas orientações;</p>
<p class="sub-clause">7.2.3 Manter absoluto sigilo em relação a toda e qualquer informação ou especificação contida em treinamentos e/ou manuais que venha a receber;</p>
<p class="sub-clause">7.2.4 Não explorar atividade que, direta ou indiretamente, seja considerada concorrente ao ramo de atividade objeto da franquia concedida, durante a vigência do CONTRATO;</p>
<p class="sub-clause">7.2.5 Fornecer documentos e prestar informações detalhadas e com clareza sobre o desempenho da UNIDADE FRANQUEADA, sempre que solicitado, em prazo máximo de 48 horas;</p>
<p class="sub-clause">7.2.6 Utilizar, preencher e manter atualizado diariamente o Sistema de Gestão do seu Studio;</p>
<p class="sub-clause">7.2.7 Caso o <strong>FRANQUEADO</strong> opte em RECEBER cursos da <strong>FRANQUEADORA</strong> aos finais de semana, deverá ceder o espaço de sua UNIDADE à <strong>FRANQUEADORA</strong> ou ao Grupo VOLL PILATES para a realização de cursos de capacitação por ela fornecidos;</p>
<p class="sub-clause">7.2.8 Efetuar investimentos em marketing local, visando a divulgação da marca e serviços da UNIDADE, de acordo com as orientações da <strong>FRANQUEADORA</strong>;</p>
<p class="sub-clause">7.2.9 Informar a <strong>FRANQUEADORA</strong> sobre todas as suas ações de pré-inauguração, bem como o dia da Inauguração da sua UNIDADE.</p>

<p class="clause-title">8. FORNECEDORES</p>
<p class="sub-clause">8.1. Ao <strong>FRANQUEADO</strong> é obrigatório adquirir produtos ou serviços exclusivamente dos FORNECEDORES homologados pela <strong>FRANQUEADORA</strong> para que se mantenha o padrão de qualidade da rede. (A garantia dos produtos comprados com fornecedores é de responsabilidade dos próprios fabricantes)</p>
<p class="sub-clause">8.2. O <strong>FRANQUEADO</strong> poderá realizar a aquisição de produto ou serviço não-homologado, caso não haja fornecedor homologado específico para determinado produto ou serviço, cuja aquisição seja necessária ao bom funcionamento da UNIDADE.</p>

<p class="clause-title">9. DIREITOS E DEVERES DA FRANQUEADORA</p>
<p class="sub-clause">9.2 São direitos da <strong>FRANQUEADORA</strong>:</p>
<p class="sub-clause">9.2.1 A possibilidade de retirar acessos, materiais e o suporte ao <strong>FRANQUEADO</strong>, caso o mesmo não esteja adimplente com os valores dos ROYALTIES;</p>
<p class="sub-clause">9.2.2 Inspecionar as instalações do <strong>FRANQUEADO</strong> sempre que desejar, sem aviso prévio e tendo irrestrito acesso às dependências;</p>
<p class="sub-clause">9.2.3 Quando o <strong>FRANQUEADO</strong> optar em RECEBER cursos da <strong>FRANQUEADORA</strong>, poderá utilizar o espaço da UNIDADE FRANQUEADA para ministração dos cursos ligados ao Grupo VOLL PILATES;</p>
<p class="sub-clause-item">• Neste caso, o uso da UNIDADE será somente aos finais de semana;</p>
<p class="sub-clause-item">• A VOLL PILATES irá avisar com pelo menos 30 (trinta) dias de antecedência quando desejar fazer uso da UNIDADE;</p>
<p class="sub-clause-item">• O <strong>FRANQUEADO</strong> recebe 100% de abatimento no valor dos Royalties daquele mês sempre que receber o curso do Grupo VOLL PILATES na sua UNIDADE.</p>
<p class="sub-clause-item">• O <strong>FRANQUEADO</strong> deixará seu Studio disponível por 60 dias após o término do curso para que os ALUNOS que realizaram o Curso de Pilates realizem estágio Observatório, agendado no Studio de acordo com a disponibilidade do <strong>FRANQUEADO</strong>.</p>

<p class="sub-clause">9.3 São deveres da <strong>FRANQUEADORA</strong>:</p>
<p class="sub-clause">9.3.1 Fornecer os Manuais da Franquia, explicar os procedimentos de montagem, administração e operação da UNIDADE FRANQUEADA ou outros, em conformidade com o que está definido na Circular de Oferta de Franquia;</p>
<p class="sub-clause">9.3.2 Prestar auxílio na implantação e manutenção da UNIDADE FRANQUEADA, desde a seleção de ponto comercial, layout, projetos, instalações físicas, treinamento de pessoal, marketing e em outras atividades necessárias à implementação e operacionalização da empresa;</p>
<p class="sub-clause">9.3.3 Disponibilizar materiais de marketing para uso do <strong>FRANQUEADO</strong>;</p>
<p class="sub-clause">9.3.4 Orientar e dar apoio ao <strong>FRANQUEADO</strong>, sempre que o mesmo requisitar em horário comercial;</p>
<p class="sub-clause">9.3.5 Prestar assistência para que a UNIDADE obtenha desempenho e resultados adequados à manutenção da empresa;</p>
<p class="sub-clause">9.3.6 Disponibilizar acesso ao portal do <strong>FRANQUEADO</strong>;</p>
<p class="sub-clause">9.3.7 Disponibilizar o site oficial da UNIDADE, bem como a Fanpage já configurada nos padrões VOLL PILATES STUDIOS.</p>
<p class="sub-clause">9.3.8 Realizar apoio nos processos de abertura da franquia;</p>
<p class="sub-clause">9.3.9 Realizar suporte comercial e de marketing de forma não presencial e com agendamento;</p>
<p class="sub-clause">9.3.10 Análise e orientação acerca da escolha da instalação do ponto comercial.</p>

<p class="clause-title">10. TRANSFERÊNCIA DA UNIDADE</p>
<p class="sub-clause">10.1 Caso o <strong>FRANQUEADO</strong> pretenda vender sua UNIDADE a terceiros, deverá antes oferecer à <strong>FRANQUEADORA</strong> a UNIDADE.</p>
<p class="sub-clause">10.2 Caso não se proceda a cessão da UNIDADE o próprio <strong>FRANQUEADO</strong>, deverá procurar o novo candidato a <strong>FRANQUEADO</strong>, que depois será avaliado para possível aprovação pela <strong>FRANQUEADORA</strong>.</p>
<p class="sub-clause">10.3 Fica estipulado que, no caso de transferência da unidade franqueada a terceiros, será devida pelo Franqueado (cedente) à Franqueadora uma Taxa de Revenda no valor fixo de R$ 8.000,00 (oito mil reais), a ser paga no ato da formalização da cessão dos direitos, independentemente de qualquer outra taxa administrativa ou contratual prevista. Este valor corresponde à remuneração da Franqueadora pelos serviços de análise, aprovação do novo franqueado (cessionário), suporte no processo de transição, e demais atividades relacionadas à cessão da unidade franqueada. A obrigatoriedade do pagamento desta taxa não exime o Franqueado da necessidade de obter anuência prévia e expressa da Franqueadora quanto ao cessionário, conforme já previsto nas cláusulas anteriores deste contrato.</p>

<p class="clause-title">11. INVESTIMENTO, RECEBIMENTOS E TAXAS</p>
<p class="sub-clause">11.1. Deverá ser pago o valor de KIT de equipamentos e serviços:</p>

<div class="value-box">
  <p style="text-align: center; margin: 0;"><strong>R$${formatCurrency(investment.valorTotalKit)}</strong> (${numberToWords(Math.floor(investment.valorTotalKit))} reais)</p>
</div>

<p style="text-align: center; margin: 20px 0;">Que será pago conforme a seguir:</p>

<div class="value-box-orange">
  <p class="value-box-title">VALORES PAGOS DIRETAMENTE PARA A FÁBRICA DE EQUIPAMENTOS:</p>
  <p><u>R$${formatCurrency(investment.valorTotalFabrica)}</u> (${numberToWords(Math.floor(investment.valorTotalFabrica))} reais) a serem pagos da seguinte forma:</p>
  <p>Entrada via pix no valor de R$${formatCurrency(investment.valorEntradaFabrica)} (${numberToWords(Math.floor(investment.valorEntradaFabrica))} reais) até o dia ${formatDate(investment.dataLimiteEntradaFabrica)} + ${investment.qtdParcelasFabrica}x no boleto de R$${formatCurrency(investment.valorParcelaFabrica)} (${numberToWords(Math.floor(investment.valorParcelaFabrica))} reais) <strong class="text-orange">para empresa dos equipamentos.</strong></p>
</div>

<div class="value-box-orange">
  <p class="value-box-title">VALORES PAGOS DIRETAMENTE PARA A FRANQUEADORA:</p>
  <p><u>R$${formatCurrency(investment.valorTotalFranqueadora)}</u> (${numberToWords(Math.floor(investment.valorTotalFranqueadora))} reais) a serem pagos da seguinte forma:</p>
  <p>Entrada via pix no valor de R$${formatCurrency(investment.valorEntradaFranqueadora)} (${numberToWords(Math.floor(investment.valorEntradaFranqueadora))} reais) até o dia ${formatDate(investment.dataLimiteEntradaFranqueadora)} + ${investment.qtdParcelasFranqueadora}x no boleto no valor de R$${formatCurrency(investment.valorParcelaFranqueadora)} (${numberToWords(Math.floor(investment.valorParcelaFranqueadora))} reais) com vencimento para todo dia 30 <strong class="text-orange">para a franqueadora.</strong></p>
</div>

<p class="sub-clause">11.2.1 As partes estabelecem que havendo atraso no pagamento, serão cobrados juros de mora na proporção de 1% (um por cento) ao mês pro rate die, multa moratória de 10% sobre o saldo devedor, cumulados esses a correção monetária pelo IGPM – Índice Geral de Preços do Mercado – da FGV, ou outro índice que o substituir, além das custas processuais e honorários advocatícios, caso ocorra a rescisão contratual por inadimplência e ação de execução judicial. Havendo inadimplência, poderão ser abatidos valores do recebimento de cursos da VOLL em seu respectivo studio, como comissão e pagamento referentes a indicação de cursos e prestação de serviços (caso o <strong>FRANQUEADO</strong> seja Treinador da VOLL).</p>

<p class="sub-clause">11.2.2 A (TAF) Taxa de Aquisição de Franquia de R$ ${formatCurrency(investment.taxaFranquia)} para esse contrato foi negociada e isentada, mas cabe esclarecer que tal valor é diferente dos valores de investimentos em equipamentos e de todo aquele chamado KIT INICIAL do <strong>FRANQUEADO</strong>.</p>

<p class="sub-clause"><strong>Produtos que o FRANQUEADO recebe no KIT INICIAL:</strong></p>
<p class="sub-clause">11.2.3 04 aparelhos principais: Cadillac, Reformer, Step Chair e Ladder Barrel da marca Equipilates;</p>
<p class="sub-clause">11.2.4 01 caixa do Reformer; 01 Prancha de salto, 01 Plataforma de extensão;</p>
<p class="sub-clause">11.2.5 01 bola suíça de 65cm da marca LiveUp, Odin ou similar;</p>
<p class="sub-clause">11.2.6 03 unidades de banda elástica, sendo uma na intensidade fraca, uma unidade na intensidade média e uma unidade na intensidade forte;</p>
<p class="sub-clause">11.2.7 02 tonning balls de 1kg ou 2kg de acordo com a disponibilidade, da marca LiveUp, Odin ou similar;</p>
<p class="sub-clause">11.2.8 01 overball de 25cm da marca Acte, LiveUp ou similar;</p>
<p class="sub-clause">11.2.9 2 latas de tinta de 3,6L na cor oficial VOLL PILATES STUDIOS da marca Coral, Suvinil ou similar;</p>
<p class="sub-clause">11.2.10 01 Painel interno para a recepção do studio ou local similar com a Logo VOLL PILATES STUDIOS.</p>

<p class="sub-clause">11.3 Na hipótese de rescisão contratual e/ou dissolução do negócio ora entabulado, os equipamentos, após a realização de todos os pagamentos dos valores de investimentos e royalties permanecerão com o <strong>FRANQUEADO</strong>.</p>

<p class="sub-clause">11.4 O <strong>FRANQUEADO</strong> após assinar o Contrato de Franquia, terá um prazo de até 12 meses, contados dessa assinatura, para solicitar a entrega dos equipamentos, sob pena, de pagar uma multa, no percentual de 2% incidente sobre o valor total dos equipamentos vigentes à época, bem como acrescidos das correções impostas pelos fornecedores;</p>

<p class="sub-clause">11.5 O <strong>FRANQUEADO</strong> para solicitar os equipamentos, deverá ter adimplido 70% do valor total descrito no item 11.1 (kit de equipamentos e serviços), bem como já estar com local apropriado para recebê-los e com o contrato de compra ou locação devidamente firmados. Assim, após recebê-los, terá um prazo de até 03 (três) meses para inaugurar o seu Studio FRANQUEADO, sob pena de iniciarem as cobranças dos royalties, independente da inauguração ocorrer.</p>

<p class="sub-clause"><strong>11.6 Serviços que o FRANQUEADO recebe:</strong></p>
<p class="sub-clause">11.6.1 Página Internet da UNIDADE do <strong>FRANQUEADO</strong> dentro do site oficial "VOLL PILATES STUDIOS" - https://vollstudios.com.br/SUA_UNIDADE;</p>
<p class="sub-clause">11.6.2 Acesso ao projeto arquitetônico padronizado da VOLL PILATES STUDIOS;</p>
<p class="sub-clause">11.6.3 Acesso a Plataforma de Marketing e Treinamentos da VOLL PILATES STUDIOS;</p>
<p class="sub-clause">11.6.4 Manual de Implantação do seu Studio;</p>
<p class="sub-clause">11.6.5 Direito de ser representante de vendas VOLL PILATES GROUP, para revender cursos e produtos VOLL PILATES, através da plataforma de representante, recebendo comissão de 10% sobre cada venda de curso presencial VOLL e 25% sobre cada venda de curso online VOLL;</p>
<p class="sub-clause">11.6.6 Serviço de Geolocalização.</p>

<p class="sub-clause"><strong>11.7 Curso Presencial que o FRANQUEADO recebe:</strong></p>
<p class="sub-clause">11.7.1 Formação em Pilates pela Espaço Vida Pilates (Grupo VOLL) ou 1 Bolsa 100% a outro curso da VOLL PILATES caso já tenha a Formação em Pilates;</p>
<p class="sub-clause">11.7.2 Dois cursos online:</p>
<p class="sub-clause">11.7.2.1 10 módulos do curso de avaliação;</p>
<p class="sub-clause">11.7.2.2 01 curso de Excelência em coluna.</p>

<p class="sub-clause"><strong>11.8 Royalties:</strong></p>

<p class="sub-clause">Royalties são cobrados no mês seguinte da Inauguração do Studio e são pagamentos mensais feitos pelo <strong>FRANQUEADO</strong> a <strong>FRANQUEADORA</strong>. Esses pagamentos garantem ao <strong>FRANQUEADO</strong> o uso contínuo da marca, produtos, serviços, treinamentos e suporte oferecidos. Os royalties garantem que o <strong>FRANQUEADO</strong> mantenha o acesso aos benefícios do sistema de franquia.</p>

<p class="sub-clause">Dentro da VOLL PILATES STUDIOS temos um sistema inovador de 3 possibilidades de Royalties:</p>
<p class="sub-clause">1. R$ 990,00 (novecentos e noventa reais) ao mês;</p>
<p class="sub-clause">2. R$ 1.490,00 (um mil quatrocentos e noventa reais) ao mês;</p>
<p class="sub-clause">3. Isenção de Royalties.</p>

<p class="sub-clause">Abaixo, explicaremos como funciona o sistema inovador de Royalties da VOLL STUDIOS:</p>

<p class="sub-clause">O <strong>FRANQUEADO</strong> VOLL Studios tem a possibilidade de escolher se deseja ou não receber cursos da VOLL PILATES em seu Studio e esta escolha interfere diretamente no valor de Royalties.</p>

<p class="sub-clause"><strong>• Quando o FRANQUEADO NÃO DESEJA RECEBER CURSOS VOLL:</strong></p>
<p class="sub-clause">Será obrigatório o pagamento de R$ 1.490,00 (um mil quatrocentos e noventa reais) ao mês durante todo o período de contrato para a UNIDADE FRANQUEADA que declarar na assinatura do contrato que NÃO quer receber Cursos de Pilates do Grupo VOLL em seu Studio ou que durante a vigência se negue a receber cursos; sendo que após 12 meses da inauguração, ocorrerá a incidência da variação positiva do IPCA ou IGP-M, mas sempre aplicando o índice de menor valor em prol do <strong>FRANQUEADO</strong>.</p>

<p class="sub-clause"><strong>• Quando o FRANQUEADO DESEJA RECEBER CURSOS VOLL:</strong></p>
<p class="sub-clause">O <strong>FRANQUEADO</strong> tem desconto: Será obrigatório o pagamento de R$ 990,00 (novecentos e noventa reais) ao mês durante todo o período de contrato para a hipótese em que a UNIDADE FRANQUEADA declare que SIM, deseja receber Cursos de Pilates do Grupo VOLL; sendo que após 12 meses da inauguração, ocorrerá a incidência da variação positiva do IPCA ou IGP-M, mas sempre aplicando o índice de menor valor em prol do <strong>FRANQUEADO</strong>.</p>

<p class="sub-clause"><strong>Parágrafo Primeiro.</strong> O valor acima estipulado poderá sofrer, após o transcurso de 12 (doze) meses da inauguração da unidade, a atualização monetária anual pela variação positiva do IPCA (Índice Nacional de Preços ao Consumidor Amplo) ou do IGP-M (Índice Geral de Preços do Mercado), sempre prevalecendo, em favor da UNIDADE FRANQUEADA, o índice de menor valor entre os mencionados.</p>

<p class="sub-clause"><strong>• Possibilidade de Isenção de Royalties:</strong></p>
<p class="sub-clause">Os Royalties serão 100% abatidos ou reembolsados no mês SUBSEQUENTE, quando o <strong>FRANQUEADO</strong> receber o curso presencial da VOLL Pilates na sua unidade. O reembolso ou abatimento sempre será no mês SUBSEQUENTE ao acontecimento do curso, ou seja, o <strong>FRANQUEADO</strong> terá isenção de royalties daquele determinado mês que receber cursos da VOLL. Quando não houver curso no mês vigente, o <strong>FRANQUEADO</strong> pagará normalmente o valor de R$ 990,00 de Royalties.</p>

<p class="sub-clause"><strong>Studio PRO:</strong> R$ 990,00 (novecentos e noventa reais), reajustáveis após 12 meses; os royalties serão pagos mensalmente, em data a ser combinada, iniciando no mês seguinte da inauguração. Caso a Unidade Franqueada declare que não quer receber cursos do Grupo VOLL em seu espaço ou se negue a receber em algum mês, o valor do Royalties passará para R$ 1.490,00 (um mil quatrocentos e noventa reais).</p>

<p class="sub-clause"><strong>11.9 O FRANQUEADO escolheu a seguinte opção de Royalties:</strong></p>
<p class="sub-clause">${royaltyTexto}</p>

<p class="sub-clause">11.9.1 O valor de royalties começará a ser cobrado no mês subsequente a realização da inauguração, e assim consequentemente nos meses posteriores.</p>
<p class="sub-clause">11.9.2 Em caso de atraso superior a 05 (cinco) dias úteis, os títulos não pagos poderão ser protestados;</p>
<p class="sub-clause">11.9.3 O inadimplemento por prazo superior a 60 (sessenta) dias fica sob pena de ter o presente CONTRATO rescindido.</p>
<p class="sub-clause">11.9.4 As partes estabelecem que havendo atraso no pagamento dos Royalties, serão cobrados juros de mora na proporção de 1% (um por cento) ao mês pro rate die, multa moratória de 10% sobre o saldo devedor, cumulados esses a correção monetária pelo IGPM – Índice Geral de Preços do Mercado – da FGV, ou outro índice que o substituir, além das custas processuais e honorários advocatícios, caso ocorra a rescisão contratual por inadimplência e ação de execução judicial.</p>

<p class="sub-clause"><strong>11.9.5 Sistemas de gestão:</strong></p>
<p class="sub-clause">11.9.6 O <strong>FRANQUEADO</strong> utilizará apenas o sistema de gestão homologado pela <strong>FRANQUEADORA</strong> (MARCA: SEUFISIO). O <strong>FRANQUEADO</strong> deverá obrigatoriamente abastecer o sistema com todas as informações do studio e mantê-lo atualizado diariamente.</p>
<p class="sub-clause">11.9.7 Sistemas de gestão possibilitam cadastrar clientes, atividades, grade de horários, contratos com os alunos, de forma geral possibilita ter o controle do Studio;</p>
<p class="sub-clause">11.9.8 O sistema de gestão varia de valor conforme o plano escolhido pelo <strong>FRANQUEADO</strong> perante o sistema SEUFISIO.</p>
<p class="sub-clause">11.9.9 O preenchimento com informações no sistema é obrigatório. (Lembrando que através dessas informações conseguimos ajudar e orientar melhor nossos FRANQUEADOS).</p>

<p class="clause-title">12. NÃO CONCORRÊNCIA E SIGILO DE INFORMAÇÕES</p>
<p class="sub-clause">12.1 Após o encerramento do contrato de franquia entre as partes, que pode ocorrer por rescisão ou término, o <strong>FRANQUEADO</strong>, na condição de EX-FRANQUEADO, por si e seu cônjuge ou companheiro(a), compromete-se a NÃO explorar a prestação de serviços de Studio de Pilates no mesmo ponto comercial em que está instalada a UNIDADE FRANQUEADA para que não haja crime de concorrência desleal;</p>
<p class="sub-clause">12.2 Com o encerramento do contrato de franquia, seja por término ou rescisão, o <strong>FRANQUEADO</strong> poderá atuar com serviços de Pilates em outros pontos comerciais, desde que não utilize marca similar, padrão visual e operacional da franquia, constante nos manuais e plataformas recebidos ou disponibilizados;</p>
<p class="sub-clause">12.3 A multa pelo descumprimento das cláusulas supracitadas, acarretará a incidência de multa de 3 (três) vezes o valor da taxa de franquia vigente à época da infração, podendo ser acrescido de valores adicionais a serem apurados em processo judicial, caso as perdas e danos sejam superiores ao valor da cláusula penal ajustada;</p>
<p class="sub-clause">12.4 Desde o recebimento da Circular de Oferta de Franquia, o <strong>FRANQUEADO</strong> teve acesso a informações sigilosas e segredos de negócio da <strong>FRANQUEADORA</strong>, não podendo reproduzir ou divulgar qualquer informação a terceiros, mantendo confidencialidade sobre todas as informações a que teve acesso, mesmo após a expiração do presente CONTRATO, sob pena de o infrator incorrer em crime de concorrência desleal, conforme claramente disposto no artigo 195 da Lei 9.279, de 14 de maio de 1996 (Lei de Propriedade Industrial).</p>

<p class="clause-title">13. DA EVENTUAL SUCESSÃO</p>
<p class="sub-clause">13.1 No caso de eventual sucessão ou saída de qualquer sócio do <strong>FRANQUEADO</strong>, a <strong>FRANQUEADORA</strong> precisa aprovar a entrada de um novo proprietário, que deve estar em sintonia com os valores e com os pré-requisitos exigidos pela <strong>FRANQUEADORA</strong>.</p>
<p class="sub-clause">13.2 O contrato de franquia não poderá ser cedido, total ou parcialmente, pelo <strong>FRANQUEADO</strong>, sem prévia e expressa autorização da <strong>FRANQUEADORA</strong>.</p>
<p class="sub-clause">13.3 É expressamente vedado ao <strong>FRANQUEADO</strong> transferir ou ceder para quem quer que seja e a que título for, os direitos e obrigações ajustados no contrato de franquia, exceto se houver prévia e expressa anuência da <strong>FRANQUEADORA</strong>.</p>
<p class="sub-clause">13.4 Na hipótese de alienação, onerosa ou gratuita de qualquer parcela de participação societária, retirada, sucessão, falência ou interdição de qualquer sócio do <strong>FRANQUEADO</strong>, a <strong>FRANQUEADORA</strong> poderá, a seu exclusivo critério, considerar rescindido o contrato de franquia, sem que disso resulte direito a indenização ao <strong>FRANQUEADO</strong>, seja a que título for.</p>
<p class="sub-clause">13.5 Exclui-se desta restrição a alteração em que a participação societária seja transferida para sócio já integrante do quadro social quando da assinatura do contrato de franquia.</p>

<p class="clause-title">14. HIPÓTESES DE INFRAÇÃO CONTRATUAL, RESCISÃO ANTECIPADA E CLÁUSULA PENAL</p>
<p class="sub-clause">14.1. O <strong>FRANQUEADO</strong> poderá rescindir o contrato em qualquer hipótese, desde que avise a <strong>FRANQUEADORA</strong> com antecedência mínima de 90 (noventa) dias;</p>
<p class="sub-clause">14.2. O valor de multa por rescisão antecipada nesta situação, será de 50% (cinquenta por cento) sobre os valores de royalties restantes até o final de contrato;</p>
<p class="sub-clause">14.3. Em caso de descumprimento pontual de qualquer cláusula deste contrato pelo <strong>FRANQUEADO</strong>, a <strong>FRANQUEADORA</strong> poderá, a seu critério, NOTIFICAR o <strong>FRANQUEADO</strong> da prática da infração apurada, e conceder prazo para sanar a atividade infratora;</p>
<p class="sub-clause">14.4. São consideradas infrações graves e suficientes motivos para rescisão imediata do presente contrato qualquer uma das seguintes situações:</p>
<p class="sub-clause-item">I. O uso inadequado da marca;</p>
<p class="sub-clause-item">II. A aquisição de PRODUTOS ou MATERIAIS de FORNECEDORES não homologados;</p>
<p class="sub-clause-item">III. O atraso no pagamento dos royalties com prazo superior a 2 (dois) meses;</p>
<p class="sub-clause-item">IV. A paralisação das atividades da UNIDADE sem aviso prévio e sem autorização da <strong>FRANQUEADORA</strong>;</p>
<p class="sub-clause-item">V. A suspensão da prestação de serviços na UNIDADE, sem autorização da <strong>FRANQUEADORA</strong>;</p>
<p class="sub-clause-item">VI. A falência, insolvência, pedido de recuperação judicial, intervenção, liquidação ou dissolução de qualquer uma das partes, ou ainda configuração de situação pré-falimentar ou pré-insolvência, inclusive com títulos vencidos e protestados, ou ações de execução, que comprometam a solidez financeira e a manutenção dos negócios;</p>
<p class="sub-clause-item">VII. A exposição vergonhosa da marca de forma que denigra a sua imagem.</p>
<p class="sub-clause">14.5. As rescisões de contrato por infrações ou penalidades acima descritas dão direito a aplicação de multa no valor de R$ 8.000,00 (oito mil reais);</p>
<p class="sub-clause">14.6. O presente contrato poderá ser rescindido por comum acordo entre as partes, mediante distrato, na presença de duas testemunhas. Neste caso, não há a incidência de multa contratual, mas o <strong>FRANQUEADO</strong> se obriga a pagar uma taxa de vistoria e encerramento das atividades que será a soma do valor de deslocamento, alimentação e estadia do fiscal da empresa que vier a realizar o ato;</p>
<p class="sub-clause">14.7. Em qualquer caso de rescisão de contrato, os efeitos serão imediatos, ou seja, o <strong>FRANQUEADO</strong>, na condição de EX-FRANQUEADO, deve imediatamente deixar de usar a marca e aplica-se de imediato todas as cláusulas deste contrato inerentes ao sigilo, know-how, segredo de marca e não concorrência.</p>

<p class="clause-title">15. DISPOSIÇÕES GERAIS</p>
<p class="sub-clause">15.1. A tolerância, por qualquer uma das partes, quanto ao inadimplemento das obrigações contratuais não implica em novação ou modificação das cláusulas aqui ajustadas, constituindo mera liberalidade;</p>
<p class="sub-clause">15.2. O presente contrato poderá ser alterado por comum acordo entre as partes, sendo feito por meio de aditivo por escrito;</p>
<p class="sub-clause">15.3. O presente contrato tem validade e vigência desde sua assinatura, independentemente de ser levado a registro;</p>
<p class="sub-clause">15.4. A cessão ou transferência dos direitos relativos a este CONTRATO, assim como as mudanças e alterações no quadro societário da UNIDADE, ou qualquer outra alteração no Contrato Social da EMPRESA FRANQUEADA, somente poderá se efetivar após prévio e expresso consentimento da <strong>FRANQUEADORA</strong>;</p>
<p class="sub-clause">15.5. O <strong>FRANQUEADO</strong> declara entender que o presente contrato tem caráter personalíssimo, sendo as obrigações e direitos aqui contidos vinculados exclusivamente à pessoa física do <strong>FRANQUEADO</strong>, bem como eventuais sócios que se obriguem solidariamente neste CONTRATO, de modo que a alteração no quadro societário não desvinculará o <strong>FRANQUEADO</strong> de nenhuma cláusula constante nesse CONTRATO.</p>

<p class="clause-title">16. ELEIÇÃO DE FORO</p>
<p class="sub-clause">16.1 As partes elegem o Foro da cidade (São Paulo/SP), para dirimir quaisquer dúvidas ou questões oriundas do presente instrumento, em detrimento a outros, por mais privilegiados que sejam ou venham a se tornar;</p>
<p class="sub-clause">16.2 A lei aplicável à controvérsia será a 13.966/2019 – Lei de Franquias, juntamente com o Código Civil Brasileiro e legislação aplicável. E estando assim acordadas, justas e contratadas, cientes do inteiro teor de todas as cláusulas a que se comprometem, as partes assinam o presente CONTRATO DE FRANQUIA, no mais estrito cumprimento à Lei nº 13.966/2019, na presença das testemunhas abaixo, para que produza imediatamente seus efeitos.</p>

<!-- ASSINATURAS -->
<div class="signature-section" style="page-break-before: always; text-align: center;">
  <p style="margin-top: 60px; font-weight: bold; text-align: center;">${signatures.cidadeAssinatura.toUpperCase()}, ${formatDateUpper(signatures.dataAssinatura)}</p>
  
  <!-- FRANQUEADORA -->
  <div style="margin-top: 70px; text-align: center;">
    <div style="width: 55%; margin: 0 auto; border-bottom: 1px solid #000;"></div>
    <p style="margin-top: 8px; margin-bottom: 0; font-weight: bold; line-height: 1.2; text-align: center;">WOLF GESTÃO DE ATIVOS LTDA – VOLL PILATES STUDIOS</p>
    <p style="margin: 0; line-height: 1.2; text-align: center;">CNPJ: 33.489.631/0001-75 – FRANQUEADORA</p>
  </div>

  <!-- FRANQUEADO -->
  <div style="margin-top: 70px; text-align: center;">
    <div style="width: 55%; margin: 0 auto; border-bottom: 1px solid #000;"></div>
    <p style="margin-top: 8px; margin-bottom: 0; font-weight: bold; color: #cc0000; line-height: 1.2; text-align: center;">${personalData.nomeCompleto.toUpperCase()}</p>
    <p style="margin: 0; color: #cc0000; line-height: 1.2; text-align: center;">RG Nº ${personalData.rg || 'XXXX'} CPF Nº ${personalData.cpf || 'XXXXXXX'}</p>
  </div>

  <!-- TESTEMUNHAS -->
  ${signatures.testemunhas.map((t, i) => `
  <div style="margin-top: 70px; text-align: center;">
    <div style="width: 55%; margin: 0 auto; border-bottom: 1px solid #000;"></div>
    <p style="margin-top: 8px; margin-bottom: 0; font-weight: bold; line-height: 1.2; text-align: center;">NOME TESTEMUNHA</p>
    <p style="margin: 0; line-height: 1.2; text-align: center;"><strong>${i + 1}</strong> CPF: ${t.cpf} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RG: ${t.rg}</p>
  </div>
  `).join('')}
</div>

</div>
</body>
</html>`

  return template
}
