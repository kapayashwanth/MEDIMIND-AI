import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <BrainCircuit className="h-7 w-7 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
      <span className="font-headline text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
        MediMind AI
      </span>
    </Link>
  );
}
