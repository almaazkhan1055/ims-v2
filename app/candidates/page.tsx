'use client';

import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { CandidateList } from '@/components/candidates/CandidateList';

export default function CandidatesPage() {
  return (
    <ProtectedRoute requiredPermission="view_candidates">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-2">
            Manage and view candidate information for interviews.
          </p>
        </div>
        
        <CandidateList />
      </div>
    </ProtectedRoute>
  );
}