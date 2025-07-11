import { Download, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Paper } from "@shared/schema";

interface PreviewModalProps {
  paper: Paper;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ paper, isOpen, onClose }: PreviewModalProps) {
  const handleDownload = () => {
    window.open(`/api/papers/${paper.id}/download`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Preview Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{paper.title}</DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {paper.subject} • {paper.year} • {paper.examType}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {/* Preview Content */}
        <div className="h-96 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">PDF Preview</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Preview functionality will be implemented with PDF.js in a future update
            </p>
            <Button className="mt-4" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download to View
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
