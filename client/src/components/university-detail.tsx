import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Eye, Bookmark, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewModal } from "./preview-modal";
import { type UniversityWithStats, type Paper } from "@shared/schema";

interface UniversityDetailProps {
  university: UniversityWithStats;
  onBack: () => void;
}

export function UniversityDetail({ university, onBack }: UniversityDetailProps) {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);
  
  const { data: papers = [], isLoading } = useQuery({
    queryKey: ["/api/universities", university.id, "papers"],
  });

  const subjects = ["all", ...new Set(papers.map((paper: Paper) => paper.subject))];
  
  const filteredPapers = selectedSubject === "all" 
    ? papers 
    : papers.filter((paper: Paper) => paper.subject === selectedSubject);

  const handleDownload = async (paperId: number) => {
    window.open(`/api/papers/${paperId}/download`, '_blank');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-600" />;
    }
    return <FileText className="h-6 w-6 text-blue-600" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-2xl">{university.name}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">Previous Year Question Papers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Subject Tabs */}
          <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="mb-6">
            <TabsList className="grid w-full grid-cols-auto">
              {subjects.map((subject) => (
                <TabsTrigger key={subject} value={subject} className="capitalize">
                  {subject === "all" ? "All Subjects" : subject}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Papers List */}
          <div className="space-y-3">
            {filteredPapers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No papers found for the selected criteria.</p>
              </div>
            ) : (
              filteredPapers.map((paper: Paper) => (
                <Card key={paper.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                          {getFileIcon(paper.mimeType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{paper.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>{paper.subject}</span>
                            <span>•</span>
                            <span>{paper.year}</span>
                            {paper.semester && (
                              <>
                                <span>•</span>
                                <span>Semester {paper.semester}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{formatFileSize(paper.fileSize)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-orange-500"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewPaper(paper)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDownload(paper.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination would go here if needed */}
          {filteredPapers.length > 0 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredPapers.length} result{filteredPapers.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {previewPaper && (
        <PreviewModal
          paper={previewPaper}
          isOpen={!!previewPaper}
          onClose={() => setPreviewPaper(null)}
        />
      )}
    </>
  );
}
