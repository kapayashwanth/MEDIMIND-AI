import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-medical-report.ts';
import '@/ai/flows/interpret-prescription.ts';
import '@/ai/flows/search-medicine-flow.ts';
