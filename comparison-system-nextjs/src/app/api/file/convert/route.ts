import mammoth from 'mammoth';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response('File required', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const { value: html } = await mammoth.convertToHtml({
      buffer,
    });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    const pdfBuffer = Buffer.from(pdfUint8);

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"',
      },
    });
  } catch (error) {
    console.error(error);

    return new Response('Conversion error', {
      status: 500,
    });
  }
}

