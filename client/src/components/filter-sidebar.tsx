import { useQuery } from "@tanstack/react-query";
import { Filter, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterSidebarProps {
  selectedUniversities: number[];
  selectedYears: number[];
  onUniversityFilter: (universityIds: number[]) => void;
  onYearFilter: (years: number[]) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  selectedUniversities,
  selectedYears,
  onUniversityFilter,
  onYearFilter,
  onClearFilters,
}: FilterSidebarProps) {
  const { data: universities = [] } = useQuery({
    queryKey: ["/api/universities"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const availableYears = [2024, 2023, 2022, 2021, 2020, 2019];

  const handleUniversityChange = (universityId: number, checked: boolean) => {
    if (checked) {
      onUniversityFilter([...selectedUniversities, universityId]);
    } else {
      onUniversityFilter(selectedUniversities.filter(id => id !== universityId));
    }
  };

  const handleYearChange = (year: number, checked: boolean) => {
    if (checked) {
      onYearFilter([...selectedYears, year]);
    } else {
      onYearFilter(selectedYears.filter(y => y !== year));
    }
  };

  return (
    <aside className="space-y-6">
      {/* Filter Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* University Filter */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Universities</h4>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {universities.map((university: any) => (
                  <label
                    key={university.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                  >
                    <Checkbox
                      checked={selectedUniversities.includes(university.id)}
                      onCheckedChange={(checked) => 
                        handleUniversityChange(university.id, checked as boolean)
                      }
                    />
                    <span className="text-sm flex-1">{university.name}</span>
                    <span className="text-xs text-gray-500">({university.paperCount})</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Year Filter */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Year</h4>
            <div className="space-y-2">
              {availableYears.map((year) => (
                <label
                  key={year}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedYears.includes(year)}
                    onCheckedChange={(checked) => 
                      handleYearChange(year, checked as boolean)
                    }
                  />
                  <span className="text-sm">{year}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="mr-2 h-5 w-5 text-orange-500" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Universities</span>
            <span className="font-semibold">{stats?.totalUniversities || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Papers</span>
            <span className="font-semibold">{stats?.totalPapers || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Recent Uploads</span>
            <span className="font-semibold text-green-600">{stats?.recentUploads || 0}</span>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
