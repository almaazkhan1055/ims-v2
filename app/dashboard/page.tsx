'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { DashboardMetrics, FilterOptions } from '@/lib/types';
import { 
  Calendar, 
  Star, 
  UserX, 
  Users, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { role } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Load data only once on mount, not on every filter change
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock dashboard metrics
      const mockMetrics: DashboardMetrics = {
        interviewsThisWeek: 24,
        averageFeedbackScore: 4.2,
        noShows: 3,
        totalCandidates: 156,
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the filter change handler to prevent unnecessary re-renders
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    // Don't reload data, just update the filter state
    // The metrics should remain the same, only the display logic changes
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <ProtectedRoute requiredPermission="view_dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's your interview management overview.
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          onFilterChange={handleFilterChange}
          showRoleFilter={role === 'admin'}
          showInterviewerFilter={role !== 'panelist'}
        />

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="Interviews This Week"
              value={metrics.interviewsThisWeek}
              description="from last week"
              icon={Calendar}
              trend={{ value: 12, isPositive: true }}
            />
            
            <MetricsCard
              title="Average Feedback Score"
              value={metrics.averageFeedbackScore.toFixed(1)}
              description="out of 5.0"
              icon={Star}
              trend={{ value: 0.3, isPositive: true }}
            />
            
            <MetricsCard
              title="No Shows"
              value={metrics.noShows}
              description="this week"
              icon={UserX}
              trend={{ value: 8, isPositive: false }}
            />
            
            <MetricsCard
              title="Total Candidates"
              value={metrics.totalCandidates}
              description="in pipeline"
              icon={Users}
              trend={{ value: 15, isPositive: true }}
            />
          </div>
        )}

        {/* Role-specific widgets */}
        {role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Weekly Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Interviews Completed</span>
                  <span className="font-medium">18/24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Feedback Submitted</span>
                  <span className="font-medium">15/18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-medium">2.4 hours</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Interviews
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">Senior Developer</p>
                  </div>
                  <span className="text-sm text-gray-500">Today 2:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-gray-600">Product Manager</p>
                  </div>
                  <span className="text-sm text-gray-500">Tomorrow 10:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {role === 'panelist' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              My Interview Queue
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-600">Frontend Developer • Today 3:00 PM</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Pending Feedback
                </span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-medium">Mike Chen</p>
                  <p className="text-sm text-gray-600">Backend Developer • Tomorrow 11:00 AM</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Scheduled
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}