'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FeedbackListSkeleton } from '@/components/ui/skeletons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiService } from '@/lib/api';
import { User, Post } from '@/lib/types';
import { 
  FileText, 
  Search, 
  Filter, 
  Star,
  Calendar,
  User as UserIcon,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';

interface FeedbackItem {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  panelistName: string;
  overallScore: number;
  strengths: string;
  areasForImprovement: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function FeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadFeedbackData();
  }, []);

  // Remove the search effect that was causing full page re-renders
  // We'll handle search filtering in the component instead

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      
      // Load candidates to get their information
      const candidatesResponse = await ApiService.getUsers(1, 100);
      setCandidates(candidatesResponse.users);
      
      // Generate mock feedback data based on candidates
      const mockFeedback: FeedbackItem[] = candidatesResponse.users.slice(0, 10).map((candidate, index) => ({
        id: index + 1,
        candidateId: candidate.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: candidate.email,
        panelistName: `Panelist ${index + 1}`,
        overallScore: Math.floor(Math.random() * 5) + 1,
        strengths: `Strong technical skills in ${candidate.company?.department || 'Engineering'}. Excellent communication and problem-solving abilities.`,
        areasForImprovement: `Could benefit from more experience in team leadership and project management.`,
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)] as 'pending' | 'approved' | 'rejected',
      }));
      
      setFeedbackItems(mockFeedback);
    } catch (error) {
      console.error('Failed to load feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove the filterFeedback function that was causing re-renders

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < score ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Memoize the filtered feedback to prevent unnecessary re-renders
  const filteredFeedback = useMemo(() => {
    return feedbackItems.filter(item => {
      const matchesSearch = !debouncedSearchQuery || 
        item.candidateName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.panelistName.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      const matchesScore = scoreFilter === 'all' || 
        (scoreFilter === 'high' && item.overallScore >= 4) ||
        (scoreFilter === 'medium' && item.overallScore >= 3 && item.overallScore < 4) ||
        (scoreFilter === 'low' && item.overallScore < 3);
      
      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [feedbackItems, debouncedSearchQuery, statusFilter, scoreFilter]);

  if (loading) {
    return <FeedbackListSkeleton />;
  }

  return (
    <ProtectedRoute requiredPermission="view_feedback">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Feedback</h1>
          <p className="text-gray-600 mt-2">
            Review and manage interview feedback from panelists.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold">{feedbackItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold">
                    {feedbackItems.filter(item => item.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold">
                    {(feedbackItems.reduce((sum, item) => sum + item.overallScore, 0) / feedbackItems.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">
                    {feedbackItems.filter(item => item.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by candidate or panelist name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (4-5)</SelectItem>
                  <SelectItem value="medium">Medium (3-4)</SelectItem>
                  <SelectItem value="low">Low (1-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Feedback Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No feedback records found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Panelist</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.candidateName}</p>
                          <p className="text-sm text-gray-600">{item.candidateEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.panelistName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {renderStars(item.overallScore)}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({item.overallScore}/5)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(item.status)}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/candidates/${item.candidateId}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
