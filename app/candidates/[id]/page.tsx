'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { ApiService } from '@/lib/api';
import { User, Todo, Post } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CandidateDetailSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  Phone, 
  Mail,
  Calendar,
  FileText,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function CandidateDetailPage() {
  const params = useParams();
  const { role, hasPermission } = useAuth();
  
  // Validate and parse candidate ID
  const candidateId = params?.id ? Number(params.id) : null;
  
  const [candidate, setCandidate] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    if (candidateId && candidateId > 0) {
      loadCandidateData();
    } else {
      setError('Invalid candidate ID');
      setLoading(false);
    }
  }, [candidateId]);

  const loadCandidateData = async () => {
    if (!candidateId) {
      setError('Invalid candidate ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [candidateData, todosData, postsData] = await Promise.all([
        ApiService.getUserById(candidateId),
        ApiService.getUserTodos(candidateId),
        ApiService.getUserPosts(candidateId),
      ]);
      
      setCandidate(candidateData);
      setTodos(todosData || []);
      setPosts(postsData || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load candidate data';
      setError(errorMessage);
      console.error('Load candidate error:', err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <CandidateDetailSkeleton />;
  }

  if (error || !candidate) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Candidate not found'}</p>
          <Link href="/candidates">
            <Button>Back to Candidates</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'no-show':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <ProtectedRoute requiredPermission="view_candidates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/candidates">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Button>
            </Link>
          </div>
          
          {hasPermission('submit_feedback') && (
            <Button onClick={() => setShowFeedbackForm(!showFeedbackForm)}>
              {showFeedbackForm ? 'Cancel' : 'Submit Feedback'}
            </Button>
          )}
        </div>

        {/* Candidate Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={candidate.image} alt={`${candidate.firstName} ${candidate.lastName}`} />
                <AvatarFallback className="text-lg">
                  {candidate.firstName[0]}{candidate.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  {candidate.firstName} {candidate.lastName}
                </h1>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {candidate.company?.title || 'No Title'} at {candidate.company?.name || 'No Company'}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {candidate.email || 'No email provided'}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {candidate.address?.city && candidate.address?.state 
                      ? `${candidate.address.city}, ${candidate.address.state}`
                      : 'Location not specified'
                    }
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {candidate.phone || 'No phone provided'}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center space-x-4">
                  <Badge variant={getStatusVariant(candidate.interviewStatus || '')}>
                    {candidate.interviewStatus?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                  </Badge>
                  
                  {candidate.averageScore && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {renderStars(candidate.averageScore)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({candidate.averageScore}/5)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        {showFeedbackForm && hasPermission('submit_feedback') && candidateId && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackForm 
                candidateId={candidateId}
                onSuccess={() => setShowFeedbackForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="feedback" disabled={!hasPermission('view_all_feedback') && !hasPermission('view_own_feedback')}>
              Feedback
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1">{candidate.company?.department || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company</label>
                    <p className="mt-1">{candidate.company?.name || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1">{candidate.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1">{candidate.phone}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1">
                    {candidate.address?.city && candidate.address?.state 
                      ? `${candidate.address.city}, ${candidate.address.state}`
                      : 'Location not specified'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Interview Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(candidate.interviewStatus || '')}>
                      {candidate.interviewStatus?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Interview Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todos.length === 0 ? (
                  <p className="text-gray-500">No scheduled interviews</p>
                ) : (
                  <div className="space-y-3">
                    {todos.map((todo) => (
                      <div 
                        key={todo.id} 
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">{todo.todo}</p>
                          <p className="text-sm text-gray-600">
                            Status: {todo.completed ? 'Completed' : 'Pending'}
                          </p>
                        </div>
                        <Badge variant={todo.completed ? 'default' : 'secondary'}>
                          {todo.completed ? 'Done' : 'Scheduled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Interview Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasPermission('view_all_feedback') && !hasPermission('view_own_feedback') ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have permission to view feedback</p>
                  </div>
                ) : posts.length === 0 ? (
                  <p className="text-gray-500">No feedback available</p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border rounded p-4">
                        <h4 className="font-semibold">{post.title}</h4>
                        <p className="text-gray-600 mt-2">{post.body}</p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>👍 {post.reactions.likes}</span>
                            <span>👎 {post.reactions.dislikes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}