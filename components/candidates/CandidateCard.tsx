import { memo } from 'react';
import { User } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Building, Eye } from 'lucide-react';
import Link from 'next/link';

interface CandidateCardProps {
  candidate: User;
  showActions?: boolean;
}

export const CandidateCard = memo(function CandidateCard({ candidate, showActions = true }: CandidateCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={candidate.image} alt={`${candidate.firstName} ${candidate.lastName}`} />
            <AvatarFallback>
              {candidate.firstName[0]}{candidate.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">
              {candidate.firstName} {candidate.lastName}
            </h3>
            
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-1" />
                {candidate.company?.title || 'No Title'} at {candidate.company?.department || 'No Department'}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {candidate.address?.city}, {candidate.address?.state}
              </div>
              
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
        
        <div className="mt-4">
          <Badge variant={getStatusVariant(candidate.interviewStatus || '')}>
            {candidate.interviewStatus?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="p-6 pt-0">
          <Link href={`/candidates/${candidate.id}`} className="w-full">
            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
});