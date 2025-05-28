
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface Subtopic {
  id?: string;
  title: string;
  description: string;
  textContent: string;
  uploadTestFile: string;
}

interface SubtopicListProps {
  subtopics: Subtopic[];
  onEdit: (subtopic: Subtopic) => void;
  loading: boolean;
}

const SubtopicList = ({ subtopics, onEdit, loading }: SubtopicListProps) => {
  if (subtopics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No subtopics created yet. Click "Add Subtopic" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subtopics.map((subtopic, index) => (
        <Card key={subtopic.id || index}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">{subtopic.title}</h4>
                <p className="text-gray-600 mt-1">{subtopic.description}</p>
                {subtopic.textContent && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {subtopic.textContent}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(subtopic)}
                disabled={loading}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubtopicList;
