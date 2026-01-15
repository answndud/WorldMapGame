'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { countries } from '@/lib/datasets/countries';

interface CountrySelectProps {
  value: string;
  onChange: (iso3: string) => void;
  placeholder?: string;
}

export default function CountrySelect({ value, onChange, placeholder = '국가를 선택하세요' }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedCountry = countries.find((c) => c.iso3 === value);

  const filteredCountries = countries
    .filter((country) => {
      const searchLower = search.toLowerCase();
      return (
        country.name_en.toLowerCase().includes(searchLower) ||
        country.name_ko.includes(search) ||
        country.iso3.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => a.name_ko.localeCompare(b.name_ko, 'ko'));

  return (
    <>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between text-lg py-6 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
        onClick={() => setOpen(true)}
      >
        {selectedCountry ? (
          <span>
            {selectedCountry.name_ko} ({selectedCountry.name_en})
          </span>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 bg-slate-800 border-slate-700">
          <Command className="bg-slate-800 border-slate-700">
            <CommandInput
              placeholder="국가 검색..."
              value={search}
              onValueChange={setSearch}
              className="h-14 text-white"
            />
            <CommandEmpty className="py-6 text-center text-slate-400">
              검색 결과가 없습니다.
            </CommandEmpty>
            <CommandGroup className="max-h-[400px] overflow-auto">
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.iso3}
                  value={country.iso3}
                  onSelect={() => {
                    onChange(country.iso3);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="cursor-pointer text-white hover:bg-slate-700"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.iso3 ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div>
                    <div className="font-semibold">{country.name_ko}</div>
                    <div className="text-sm text-slate-400">{country.name_en}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
