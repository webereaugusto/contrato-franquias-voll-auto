import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { fillContractTemplate } from '@/lib/pdf-generator'
import { ContractData } from '@/lib/contract-data'

export async function POST(request: NextRequest) {
  try {
    const data: ContractData = await request.json()

    // Validar dados básicos
    if (!data.personalData || !data.investment || !data.royalties || !data.signatures) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Preencher template HTML
    const htmlContent = fillContractTemplate(data)

    // Gerar PDF com Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
      ],
      timeout: 60000,
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '2.5cm',
        right: '2cm',
        bottom: '2.5cm',
        left: '2cm',
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; color: #888; text-align: right; padding-right: 1.5cm;">
          <span class="pageNumber"></span>
        </div>
      `,
      timeout: 60000,
    })

    await browser.close()

    // Retornar PDF
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="contrato-franquia.pdf"',
      },
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

