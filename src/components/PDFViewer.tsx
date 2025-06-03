'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Copy, RotateCw } from 'lucide-react';

// Dynamically import react-pdf to avoid SSR issues
let Document: any = null;
let Page: any = null;
let pdfjs: any = null;

interface PDFViewerProps {
  file: File | null;
  onTextSelect?: (selectedText: string) => void;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, onTextSelect, className = '' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState<boolean>(false);

  // Initialize PDF.js dynamically
  useEffect(() => {
    const initializePDF = async () => {
      try {
        const reactPdf = await import('react-pdf');
        Document = reactPdf.Document;
        Page = reactPdf.Page;
        pdfjs = reactPdf.pdfjs;
        
        // Set up PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        setPdfLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load PDF.js:', err);
        setError('Failed to load PDF viewer. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializePDF();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: any) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document. Please try uploading again.');
  }, []);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleTextSelection = () => {
    try {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const text = selection.toString().trim();
        setSelectedText(text);
        if (onTextSelect) {
          onTextSelect(text);
        }
      }
    } catch (err) {
      console.error('Text selection error:', err);
    }
  };

  const copySelectedText = async () => {
    try {
      if (selectedText && navigator.clipboard) {
        await navigator.clipboard.writeText(selectedText);
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading PDF viewer...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // No file state
  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 mb-2">No PDF uploaded</p>
          <p className="text-sm text-gray-400">Upload a PDF to view it here</p>
        </div>
      </div>
    );
  }

  // PDF not loaded yet
  if (!pdfLoaded || !Document || !Page) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing PDF viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-sm font-medium px-3 py-1 bg-white rounded border">
            {pageNumber} / {numPages}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          
          <span className="text-sm px-2 py-1 bg-white rounded border min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          
          <button
            onClick={rotate}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {selectedText && (
            <button
              onClick={copySelectedText}
              className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
              title="Copy selected text"
            >
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Text Display */}
      {selectedText && (
        <div className="p-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900 mb-1">Selected Text:</p>
              <p className="text-sm text-blue-800 bg-white px-2 py-1 rounded border max-h-20 overflow-y-auto">
                {selectedText}
              </p>
            </div>
            <button
              onClick={() => setSelectedText('')}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800"
              title="Clear selection"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div className="flex justify-center">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading PDF...</span>
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8 text-red-600">
                <p>Failed to load PDF. Please try uploading again.</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              loading={
                <div className="flex items-center justify-center p-4">
                  <div className="animate-pulse bg-gray-200 w-full h-96 rounded"></div>
                </div>
              }
              onGetTextSuccess={() => {
                // Enable text selection
                setTimeout(handleTextSelection, 100);
              }}
              className="shadow-lg border border-gray-300"
            />
          </Document>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Select text in the PDF to copy to form fields • Use controls above to navigate and zoom
        </p>
      </div>
    </div>
  );
};

export default PDFViewer; 