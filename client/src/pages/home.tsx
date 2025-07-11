import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";
import { Header } from "@/components/header";
import { FilterSidebar } from "@/components/filter-sidebar";
import { UniversityCard } from "@/components/university-card";
import { UniversityDetail } from "@/components/university-detail";
import { type UniversityWithStats } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversities, setSelectedUniversities] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityWithStats | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["/api/universities"],
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/papers/search", searchQuery],
    enabled: searchQuery.length > 0,
  });

  // Filter universities based on search and filters
  const filteredUniversities = universities.filter((university: UniversityWithStats) => {
    // Search filter
    if (searchQuery && !university.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // University filter
    if (selectedUniversities.length > 0 && !selectedUniversities.includes(university.id)) {
      return false;
    }
    
    return true;
  });

  // Sort universities
  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "papers":
        return b.paperCount - a.paperCount;
      case "recent":
        // Sort by latest upload (most recent first)
        if (!a.latestUpload && !b.latestUpload) return 0;
        if (!a.latestUpload) return 1;
        if (!b.latestUpload) return -1;
        return a.latestUpload.localeCompare(b.latestUpload);
      default:
        return 0;
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUniversityFilter = (universityIds: number[]) => {
    setSelectedUniversities(universityIds);
  };

  const handleYearFilter = (years: number[]) => {
    setSelectedYears(years);
  };

  const handleClearFilters = () => {
    setSelectedUniversities([]);
    setSelectedYears([]);
    setSearchQuery("");
  };

  const handleViewPapers = (university: UniversityWithStats) => {
    setSelectedUniversity(university);
  };

  const handleBackToGrid = () => {
    setSelectedUniversity(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={handleSearch} searchQuery={searchQuery} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Filter Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <FilterSidebar
              selectedUniversities={selectedUniversities}
              selectedYears={selectedYears}
              onUniversityFilter={handleUniversityFilter}
              onYearFilter={handleYearFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9">
            {selectedUniversity ? (
              <UniversityDetail
                university={selectedUniversity}
                onBack={handleBackToGrid}
              />
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Universities</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Browse question papers by university
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Sort Options */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="papers">Sort by Papers Count</SelectItem>
                        <SelectItem value="recent">Sort by Recent</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* View Toggle */}
                    <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* University Grid */}
                {sortedUniversities.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No universities found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  <div className={`grid gap-6 mb-8 ${
                    viewMode === "grid" 
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                      : "grid-cols-1"
                  }`}>
                    {sortedUniversities.map((university: UniversityWithStats) => (
                      <UniversityCard
                        key={university.id}
                        university={university}
                        onViewPapers={handleViewPapers}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
