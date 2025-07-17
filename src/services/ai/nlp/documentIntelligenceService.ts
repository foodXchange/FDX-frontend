// Document Intelligence Service for AI-powered document analysis
import { DocumentAnalysis } from '../types';
import { aiService } from '../aiService';
import { logger } from '../../logger';

interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: Array<{
    text: string;
    coordinates: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
}

interface DocumentClassification {
  type: 'invoice' | 'certificate' | 'contract' | 'rfq' | 'order' | 'other';
  confidence: number;
  suggestedFields: string[];
}

export class DocumentIntelligenceService {
  private static instance: DocumentIntelligenceService;

  private constructor() {}

  static getInstance(): DocumentIntelligenceService {
    if (!DocumentIntelligenceService.instance) {
      DocumentIntelligenceService.instance = new DocumentIntelligenceService();
    }
    return DocumentIntelligenceService.instance;
  }

  async analyzeDocument(
    file: File | string,
    options?: {
      expectedType?: string;
      extractFields?: string[];
      validateData?: boolean;
    }
  ): Promise<DocumentAnalysis> {
    try {
      // Step 1: Perform OCR
      const ocrResult = await this.performOCR(file);
      
      // Step 2: Classify document type
      const classification = await this.classifyDocument(ocrResult.text, options?.expectedType);
      
      // Step 3: Extract structured data
      const extractedData = await this.extractStructuredData(
        ocrResult.text,
        classification.type,
        options?.extractFields
      );
      
      // Step 4: Validate extracted data
      const validation = options?.validateData 
        ? await this.validateExtractedData(extractedData, classification.type)
        : { warnings: [], suggestions: [] };

      // Step 5: Enhance with AI analysis
      const aiAnalysis = await this.performAIAnalysis(
        ocrResult.text,
        classification.type,
        extractedData
      );

      return {
        documentType: classification.type,
        extractedData: {
          ...extractedData,
          ...aiAnalysis.enhancedData,
        },
        confidence: Math.min(ocrResult.confidence, classification.confidence),
        warnings: validation.warnings,
        suggestions: [
          ...validation.suggestions,
          ...aiAnalysis.suggestions,
        ],
      };
    } catch (error) {
      logger.error('Document analysis error:', error as Error);
      throw error;
    }
  }

  private async performOCR(file: File | string): Promise<OCRResult> {
    // In a real implementation, you would use:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract.js for client-side OCR
    
    if (typeof file === 'string') {
      // Already text - simulate OCR result
      return {
        text: file,
        confidence: 0.95,
        boundingBoxes: [],
      };
    }

    // For demonstration, simulate OCR processing
    const mockOCRResult: OCRResult = {
      text: await this.simulateOCR(file),
      confidence: 0.92,
      boundingBoxes: [],
    };

    return mockOCRResult;
  }

  private async simulateOCR(file: File): Promise<string> {
    // Simulate OCR processing
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // In real implementation, this would be actual OCR
        resolve(`
          INVOICE
          Invoice #: INV-2024-001
          Date: 2024-01-15
          
          Bill To:
          ABC Restaurant
          123 Main Street
          Anytown, ST 12345
          
          From:
          Fresh Foods Supplier
          456 Supply Ave
          Food City, ST 67890
          
          Items:
          - Organic Apples, 50 lbs @ $2.50/lb = $125.00
          - Fresh Salmon, 20 lbs @ $15.00/lb = $300.00
          - Organic Lettuce, 10 heads @ $3.00/head = $30.00
          
          Subtotal: $455.00
          Tax: $36.40
          Total: $491.40
          
          Payment Terms: Net 30
          Due Date: 2024-02-14
        `);
      };
      reader.readAsText(file);
    });
  }

  private async classifyDocument(
    text: string,
    expectedType?: string
  ): Promise<DocumentClassification> {
    const prompt = `
      Classify this document based on its content:
      
      Expected Type: ${expectedType || 'unknown'}
      
      Document Content:
      ${text}
      
      Classify as one of:
      - invoice
      - certificate (food safety, organic, etc.)
      - contract
      - rfq (request for quote)
      - order
      - other
      
      Also suggest relevant fields that should be extracted.
      
      Return JSON with: { type, confidence, suggestedFields }
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Document classification error:', error as Error);
      return {
        type: 'other',
        confidence: 0.5,
        suggestedFields: ['content'],
      };
    }
  }

  private async extractStructuredData(
    text: string,
    documentType: string,
    requestedFields?: string[]
  ): Promise<Record<string, any>> {
    const fieldPrompts = {
      invoice: [
        'invoice_number', 'date', 'due_date', 'vendor_name', 'vendor_address',
        'customer_name', 'customer_address', 'line_items', 'subtotal', 'tax', 'total',
        'payment_terms'
      ],
      certificate: [
        'certificate_type', 'issuing_authority', 'certificate_number', 'issue_date',
        'expiry_date', 'company_name', 'scope', 'standards'
      ],
      contract: [
        'contract_type', 'parties', 'effective_date', 'expiry_date', 'key_terms',
        'payment_terms', 'deliverables'
      ],
      rfq: [
        'rfq_number', 'issue_date', 'due_date', 'buyer', 'requirements',
        'quantities', 'specifications', 'delivery_terms'
      ],
      order: [
        'order_number', 'order_date', 'customer', 'items', 'quantities',
        'delivery_date', 'delivery_address', 'total_amount'
      ],
    };

    const fieldsToExtract = requestedFields || fieldPrompts[documentType as keyof typeof fieldPrompts] || ['content'];

    const prompt = `
      Extract structured data from this ${documentType} document:
      
      ${text}
      
      Extract the following fields: ${fieldsToExtract.join(', ')}
      
      For line items or lists, structure them as arrays.
      For dates, use ISO format (YYYY-MM-DD).
      For amounts, extract as numbers without currency symbols.
      
      Return as JSON object with the requested fields.
      If a field is not found, omit it or set to null.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Data extraction error:', error as Error);
      return { content: text };
    }
  }

  private async validateExtractedData(
    data: Record<string, any>,
    documentType: string
  ): Promise<{ warnings: string[]; suggestions: string[] }> {
    const prompt = `
      Validate the extracted data for a ${documentType} document:
      
      ${JSON.stringify(data, null, 2)}
      
      Check for:
      1. Missing required fields
      2. Invalid date formats
      3. Unrealistic values
      4. Inconsistencies
      5. Data quality issues
      
      Return JSON with arrays of 'warnings' and 'suggestions'.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Data validation error:', error as Error);
      return { warnings: [], suggestions: [] };
    }
  }

  private async performAIAnalysis(
    text: string,
    documentType: string,
    extractedData: Record<string, any>
  ): Promise<{ enhancedData: Record<string, any>; suggestions: string[] }> {
    const prompt = `
      Perform intelligent analysis on this ${documentType}:
      
      Original Text: ${text}
      Extracted Data: ${JSON.stringify(extractedData)}
      
      Enhance the data by:
      1. Inferring missing information
      2. Categorizing items
      3. Calculating derived values
      4. Identifying key insights
      5. Flagging potential issues
      
      For food industry documents, consider:
      - Perishability and shelf life
      - Seasonal factors
      - Compliance requirements
      - Quality standards
      - Safety certifications
      
      Return JSON with 'enhancedData' and 'suggestions' arrays.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('AI analysis error:', error as Error);
      return {
        enhancedData: {},
        suggestions: ['Consider manual review of extracted data'],
      };
    }
  }

  async extractTableData(
    ocrText: string,
    tableHeaders?: string[]
  ): Promise<Array<Record<string, any>>> {
    const prompt = `
      Extract table data from this text:
      
      ${ocrText}
      
      Expected headers: ${tableHeaders?.join(', ') || 'auto-detect'}
      
      Return as an array of objects, where each object represents a row.
      Handle merged cells and irregular formatting intelligently.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Table extraction error:', error as Error);
      return [];
    }
  }

  async summarizeDocument(text: string): Promise<string> {
    const prompt = `
      Create a concise summary of this document highlighting key information:
      
      ${text}
      
      Focus on:
      - Document purpose
      - Key parties involved
      - Important dates and deadlines
      - Financial information
      - Critical requirements or conditions
      
      Keep summary under 200 words.
    `;

    try {
      return await aiService.generateCompletion(prompt);
    } catch (error) {
      logger.error('Document summarization error:', error as Error);
      return 'Unable to generate summary';
    }
  }

  async compareDocuments(
    document1: string,
    document2: string,
    comparisonType: 'changes' | 'similarities' | 'compliance' = 'changes'
  ): Promise<{
    differences: string[];
    similarities: string[];
    analysis: string;
  }> {
    const prompt = `
      Compare these two documents and identify ${comparisonType}:
      
      Document 1:
      ${document1}
      
      Document 2:
      ${document2}
      
      Provide:
      1. Key differences
      2. Important similarities
      3. Overall analysis
      
      Focus on business-relevant changes like prices, terms, quantities, dates.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Document comparison error:', error as Error);
      return {
        differences: ['Unable to compare documents'],
        similarities: [],
        analysis: 'Comparison failed due to processing error',
      };
    }
  }

  async generateComplianceReport(
    documentAnalysis: DocumentAnalysis,
    regulations: string[]
  ): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
    score: number;
  }> {
    const prompt = `
      Analyze document compliance against regulations:
      
      Document: ${documentAnalysis.documentType}
      Extracted Data: ${JSON.stringify(documentAnalysis.extractedData)}
      
      Regulations to check: ${regulations.join(', ')}
      
      Evaluate compliance and provide:
      1. Overall compliance status
      2. Specific violations
      3. Recommendations for improvement
      4. Compliance score (0-100)
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Compliance analysis error:', error as Error);
      return {
        compliant: false,
        violations: ['Unable to assess compliance'],
        recommendations: ['Manual compliance review required'],
        score: 0,
      };
    }
  }

  async processInvoiceBatch(
    invoices: Array<{ id: string; content: string }>
  ): Promise<Array<{
    id: string;
    analysis: DocumentAnalysis;
    summary: string;
    anomalies: string[];
  }>> {
    const results = [];

    for (const invoice of invoices) {
      try {
        const analysis = await this.analyzeDocument(invoice.content, {
          expectedType: 'invoice',
          validateData: true,
        });

        const summary = await this.summarizeDocument(invoice.content);
        const anomalies = await this.detectInvoiceAnomalies(analysis.extractedData);

        results.push({
          id: invoice.id,
          analysis,
          summary,
          anomalies,
        });
      } catch (error) {
        logger.error(`Invoice processing error for ${invoice.id}:`, error as Error);
        results.push({
          id: invoice.id,
          analysis: {
            documentType: 'invoice',
            extractedData: {},
            confidence: 0,
            warnings: ['Processing failed'],
            suggestions: ['Manual review required'],
          },
          summary: 'Processing failed',
          anomalies: ['Unable to process'],
        });
      }
    }

    return results;
  }

  private async detectInvoiceAnomalies(invoiceData: Record<string, any>): Promise<string[]> {
    const prompt = `
      Analyze this invoice data for anomalies:
      
      ${JSON.stringify(invoiceData)}
      
      Look for:
      - Unusual pricing
      - Duplicate charges
      - Missing required information
      - Calculation errors
      - Unrealistic quantities
      - Suspicious patterns
      
      Return array of anomaly descriptions.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      return [];
    }
  }
}

export const documentIntelligenceService = DocumentIntelligenceService.getInstance();