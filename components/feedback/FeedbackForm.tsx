'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormLoadingSkeleton } from '@/components/ui/loading-states';
import { ApiService } from '@/lib/api';
import { FeedbackForm as FeedbackFormType } from '@/lib/types';
import { Star, CheckCircle } from 'lucide-react';

interface FeedbackFormProps {
  candidateId: number;
  onSuccess?: () => void;
}

export function FeedbackForm({ candidateId, onSuccess }: FeedbackFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<FeedbackFormType>>({
    overallScore: 0,
    strengths: '',
    areasForImprovement: '',
    candidateId,
    panelId: user?.user.id || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.overallScore || formData.overallScore < 1 || formData.overallScore > 5) {
      newErrors.overallScore = 'Please select a score between 1 and 5';
    }

    if (!formData.strengths?.trim()) {
      newErrors.strengths = 'Please provide candidate strengths';
    } else if (formData.strengths.length < 10) {
      newErrors.strengths = 'Strengths should be at least 10 characters';
    }

    if (!formData.areasForImprovement?.trim()) {
      newErrors.areasForImprovement = 'Please provide areas for improvement';
    } else if (formData.areasForImprovement.length < 10) {
      newErrors.areasForImprovement = 'Areas for improvement should be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Sanitize input data
      const sanitizedData = {
        ...formData,
        strengths: formData.strengths?.trim(),
        areasForImprovement: formData.areasForImprovement?.trim(),
      };

      await ApiService.submitFeedback(sanitizedData);
      setSubmitted(true);
      
      // Call success callback after a brief delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setErrors({ submit: 'Failed to submit feedback. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FeedbackFormType, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStars = (currentScore: number, onScoreChange: (score: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onScoreChange(i + 1)}
            className="focus:outline-none transition-colors"
            disabled={submitting}
          >
            <Star
              className={`h-6 w-6 ${
                i < currentScore 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentScore > 0 ? `${currentScore}/5` : 'Click to rate'}
        </span>
      </div>
    );
  };

  if (submitting) {
    return <FormLoadingSkeleton />;
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Feedback Submitted Successfully!
        </h3>
        <p className="text-gray-600">
          Thank you for your valuable feedback. It has been recorded and will be reviewed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <Alert variant="destructive">
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Overall Score */}
      <div className="space-y-2">
        <Label htmlFor="overallScore">Overall Score *</Label>
        {renderStars(
          formData.overallScore || 0, 
          (score) => handleInputChange('overallScore', score)
        )}
        {errors.overallScore && (
          <p className="text-sm text-red-600">{errors.overallScore}</p>
        )}
      </div>

      {/* Strengths */}
      <div className="space-y-2">
        <Label htmlFor="strengths">Candidate Strengths *</Label>
        <Textarea
          id="strengths"
          value={formData.strengths || ''}
          onChange={(e) => handleInputChange('strengths', e.target.value)}
          placeholder="Describe the candidate's key strengths and positive qualities..."
          rows={4}
          disabled={submitting}
          maxLength={1000}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{errors.strengths && <span className="text-red-600">{errors.strengths}</span>}</span>
          <span>{formData.strengths?.length || 0}/1000</span>
        </div>
      </div>

      {/* Areas for Improvement */}
      <div className="space-y-2">
        <Label htmlFor="areasForImprovement">Areas for Improvement *</Label>
        <Textarea
          id="areasForImprovement"
          value={formData.areasForImprovement || ''}
          onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
          placeholder="Suggest areas where the candidate could improve or develop further..."
          rows={4}
          disabled={submitting}
          maxLength={1000}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{errors.areasForImprovement && <span className="text-red-600">{errors.areasForImprovement}</span>}</span>
          <span>{formData.areasForImprovement?.length || 0}/1000</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onSuccess?.()} 
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    </form>
  );
}