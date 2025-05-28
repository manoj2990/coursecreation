
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Topic {
  id?: string;
  title: string;
  description: string;
  subtopics: any[];
}

interface TopicFormProps {
  topic?: Topic | null;
  isEdit?: boolean;
  onSave: (topic: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const TopicForm = ({ topic, isEdit = false, onSave, onCancel, loading }: TopicFormProps) => {
  const [formData, setFormData] = useState({
    title: topic?.title || "",
    description: topic?.description || "",
    id: topic?.id
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Card className={isEdit ? "border-orange-200" : "border-blue-200"}>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEdit ? "Edit Topic" : "Create New Topic"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Topic Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter topic title"
          />
        </div>
        <div className="space-y-2">
          <Label>Topic Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter topic description"
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update Topic" : "Save Topic")}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicForm;
