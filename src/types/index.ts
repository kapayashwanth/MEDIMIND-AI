export interface Medicine {
  id?: string; // Made optional as AI won't provide a stable ID
  name: string;
  description: string;
  usage: string;
  dosageForms: string[];
  commonSideEffects: string[];
  imageUrl?: string;
  imageHint?: string; // For data-ai-hint
}

// Add other common types here as needed
// e.g., User, AnalysisHistoryItem
