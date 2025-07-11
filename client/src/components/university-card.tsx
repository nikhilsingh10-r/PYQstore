import { University, ArrowRight, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type UniversityWithStats } from "@shared/schema";

interface UniversityCardProps {
  university: UniversityWithStats;
  onViewPapers: (university: UniversityWithStats) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (universityId: number) => void;
}

export function UniversityCard({ 
  university, 
  onViewPapers, 
  isBookmarked = false,
  onToggleBookmark 
}: UniversityCardProps) {
  const getIconColor = (index: number) => {
    const colors = ['bg-primary', 'bg-orange-500', 'bg-green-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${getIconColor(university.id)} text-white rounded-lg p-3`}>
              <University className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {university.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{university.location}</p>
            </div>
          </div>
          {onToggleBookmark && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(university.id);
              }}
              className="text-gray-400 hover:text-orange-500"
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-orange-500' : ''}`} />
            </Button>
          )}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Papers</span>
            <span className="font-medium">{university.paperCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Latest Upload</span>
            <span className="font-medium text-green-600">
              {university.latestUpload || 'No uploads'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Years Available</span>
            <span className="font-medium">{university.yearRange}</span>
          </div>
        </div>

        {/* Recent Subjects */}
        {university.recentSubjects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recent Subjects:</p>
            <div className="flex flex-wrap gap-1">
              {university.recentSubjects.map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => onViewPapers(university)}
        >
          <span>View Papers</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
