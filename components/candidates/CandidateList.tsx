'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ApiService } from '@/lib/api';
import { User } from '@/lib/types';
import { CandidateCard } from './CandidateCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CandidateListSkeleton } from '@/components/ui/skeletons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export function CandidateList() {
  const { hasPermission } = useAuth();
  const [candidates, setCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCandidates();
  }, [currentPage]);

  // Remove the search effect that was causing re-renders
  // We'll handle search filtering in the component instead

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getUsers(currentPage, itemsPerPage);
      setCandidates(response.users);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
    } catch (err) {
      setError('Failed to load candidates');
      console.error('Load candidates error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove the searchCandidates function that was causing re-renders
  // We'll handle search filtering in the component instead

  // Filter and sort candidates with search
  const processedCandidates = useMemo(() => {
    let filtered = candidates;

    // Filter by search query
    if (debouncedSearchQuery) {
      filtered = filtered.filter(candidate => 
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        candidate.company?.department?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(candidate => 
        candidate.interviewStatus === filterStatus
      );
    }

    // Sort candidates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'department':
          return (a.company?.department || '').localeCompare(b.company?.department || '');
        case 'score':
          return (b.averageScore || 0) - (a.averageScore || 0);
        case 'status':
          return (a.interviewStatus || '').localeCompare(b.interviewStatus || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [candidates, debouncedSearchQuery, filterStatus, sortBy]);

  if (loading && candidates.length === 0) {
    return <CandidateListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadCandidates}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="score">Score</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Candidates Grid */}
      {processedCandidates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No candidates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              showActions={hasPermission('view_candidates')}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!debouncedSearchQuery && totalPages > 1 && processedCandidates.length > 0 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}