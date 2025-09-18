'use client';

import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarDays, Filter } from 'lucide-react';
import { FilterOptions } from '@/lib/types';
import { format } from 'date-fns';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  showRoleFilter?: boolean;
  showInterviewerFilter?: boolean;
  showDateRange?: boolean;
}

export const FilterBar = memo(function FilterBar({ 
  onFilterChange,
  showRoleFilter = true,
  showInterviewerFilter = true,
  showDateRange = true,
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [date, setDate] = useState<Date>();

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setDate(undefined);
    onFilterChange({});
  }, [onFilterChange]);

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {showRoleFilter && (
        <Select
          onValueChange={(value) => handleFilterChange('role', value)}
          value={filters.role}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="ta_member">TA Member</SelectItem>
            <SelectItem value="panelist">Panelist</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showInterviewerFilter && (
        <Select
          onValueChange={(value) => handleFilterChange('interviewer', value)}
          value={filters.interviewer}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Interviewer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="john_doe">John Doe</SelectItem>
            <SelectItem value="jane_smith">Jane Smith</SelectItem>
            <SelectItem value="mike_johnson">Mike Johnson</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Select
        onValueChange={(value) => handleFilterChange('status', value)}
        value={filters.status}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="no-show">No Show</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {showDateRange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarDays className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}

      <Button variant="outline" onClick={clearFilters}>
        Clear All
      </Button>
    </div>
  );
})