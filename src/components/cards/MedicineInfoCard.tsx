import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Medicine } from '@/types';
import { Pill, ListChecks, AlertTriangle } from 'lucide-react';

interface MedicineInfoCardProps {
  medicine: Medicine;
}

export function MedicineInfoCard({ medicine }: MedicineInfoCardProps) {
  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        {medicine.imageUrl && (
          <div className="relative h-40 w-full mb-4 rounded-t-lg overflow-hidden">
            <Image
              src={medicine.imageUrl}
              alt={medicine.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint={medicine.imageHint || 'medicine pills'}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-xl">{medicine.name}</CardTitle>
        </div>
        <CardDescription>{medicine.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-1"><ListChecks className="h-4 w-4" /> Recommended Usage</h4>
          <p className="text-sm text-muted-foreground">{medicine.usage}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-1">Dosage Forms</h4>
          <div className="flex flex-wrap gap-2">
            {medicine.dosageForms.map((form) => (
              <Badge key={form} variant="secondary">{form}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-destructive" /> Common Side Effects</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {medicine.commonSideEffects.map((effect) => (
              <li key={effect}>{effect}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          This information is for general knowledge only and not a substitute for professional medical advice. Always consult your doctor or pharmacist.
        </p>
      </CardFooter>
    </Card>
  );
}
