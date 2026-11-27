export interface User {
  id: string;
  email: string;
  full_name: string;
  designation: string;
  subsidiary: string;
  location: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  category: string;
  subsidiary: string;
  mine_name: string;
  reporting_year: string;
  classification: string;
  processing_status: string;
  page_count: number;
  uploaded_by: string;
  uploader_name?: string;
  created_at: string;
}

export interface DocumentPage {
  id: string;
  page_number: number;
  text_content: string;
  ocr_confidence?: number;
  extraction_method: string;
  has_tables: boolean;
}

export interface ExtractedEntity {
  id: string;
  document_id: string;
  page_number?: number;
  entity_type: string;
  entity_value: string;
  original_text: string;
  confidence: number;
  verification_status: string;
}

export interface ExtractedMetric {
  id: string;
  document_id: string;
  page_number?: number;
  metric_name: string;
  original_value: string;
  normalized_value?: number;
  unit: string;
  reporting_period: string;
  mine_name: string;
  supporting_text: string;
  confidence: number;
  verification_status: string;
}

export interface Citation {
  document_id: string;
  document_title: string;
  page_number?: number;
  excerpt: string;
  relevance_score: number;
}

export interface AIAnswer {
  answer: string;
  conversation_id: string;
  citations: Citation[];
  confidence: number;
  evidence_sufficient: boolean;
}

export interface ConflictEvidence {
  id: string;
  metric_id?: string;
  document_id: string;
  document_title: string;
  page_number?: number;
  extracted_value: string;
  unit: string;
  supporting_text: string;
}

export interface ConflictItem {
  id: string;
  conflict_type: string;
  metric_name: string;
  mine_name: string;
  reporting_year: string;
  status: string;
  severity: string;
  description: string;
  evidence: ConflictEvidence[];
  created_at: string;
}

export interface DashboardStats {
  total_documents: number;
  processed_documents: number;
  pending_verification: number;
  total_conflicts: number;
  open_conflicts: number;
  total_entities: number;
  total_metrics: number;
  total_users: number;
  recent_documents: DocumentItem[];
  processing_rate: number;
  category_breakdown: Record<string, number>;
}

export interface ReportItem {
  id: string;
  title: string;
  report_type: string;
  format: string;
  status: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}
