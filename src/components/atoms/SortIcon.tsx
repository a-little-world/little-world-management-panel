import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React from 'react';

export function SortIcon({
  field,
  sortBy,
  sortOrder,
}: {
  field: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  if (sortBy !== field) return <ArrowsUpDownIcon className="ml-2 h-4 w-4" />;
  return sortOrder === 'asc' ? (
    <ChevronUpIcon size={14} className="ml-2" />
  ) : (
    <ChevronDownIcon size={14} className="ml-2" />
  );
}
