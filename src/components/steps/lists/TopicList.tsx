
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

interface Topic {
  id?: string;
  title: string;
  description: string;
  subtopics: any[];
}

interface TopicListProps {
  topics: Topic[];
  onEdit: (topic: Topic) => void;
  onSelectTopic: (index: number) => void;
  loading: boolean;
}

const TopicList = ({ topics, onEdit, onSelectTopic, loading }: TopicListProps) => {
  if (topics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No topics created yet. Click "Add Topic" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic, index) => (
        <Card key={topic.id || index} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{topic.title}</h4>
                <p className="text-gray-600 mt-1">{topic.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {topic.subtopics.length} subtopic(s)
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(topic)}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectTopic(index)}
                  disabled={loading}
                >
                  View Subtopics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TopicList;
