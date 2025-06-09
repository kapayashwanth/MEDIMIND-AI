'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { MedicineInfoCard } from '@/components/cards/MedicineInfoCard';
import { medicines as allMedicines } from '@/lib/data/medicines';
import type { Medicine } from '@/types';
import { Search, Frown } from 'lucide-react';

export default function MedicineSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>(allMedicines);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMedicines(allMedicines);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = allMedicines.filter(medicine =>
        medicine.name.toLowerCase().includes(lowercasedFilter) ||
        medicine.description.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredMedicines(filtered);
    }
  }, [searchTerm]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <PageHeader title="Medicine Search" />
      <main className="flex-1 p-6">
        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for medicines by name or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 py-3 text-base rounded-lg shadow-sm"
            />
          </div>
        </div>

        {filteredMedicines.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMedicines.map(medicine => (
              <MedicineInfoCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No medicines found matching your search.</p>
            <p className="text-sm text-muted-foreground">Try a different search term or browse all medicines.</p>
          </div>
        )}
      </main>
    </>
  );
}
