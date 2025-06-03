import { NextRequest, NextResponse } from 'next/server';
import OCRProcessor from '@/lib/ocr-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process PDF with OCR
    const processor = new OCRProcessor();
    
    try {
      const result = await processor.extractFromPDF(buffer);
      
      // Clean up the processor
      await processor.cleanup();
      
      return NextResponse.json({
        success: true,
        data: result.data,
        rawText: result.rawText,
        message: 'PDF processed successfully'
      });
      
    } catch (processingError) {
      console.error('PDF processing error:', processingError);
      await processor.cleanup();
      
      return NextResponse.json(
        { 
          error: 'Failed to extract data from PDF',
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (not allowed)
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 