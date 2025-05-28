
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Subtopic {
  id?: string;
  title: string;
  description: string;
  textContent: string;
  uploadTestFile: string;
}

interface SubtopicFormProps {
  subtopic?: Subtopic | null;
  isEdit?: boolean;
  onSave: (subtopic: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const SubtopicForm = ({ subtopic, isEdit = false, onSave, onCancel, loading }: SubtopicFormProps) => {
  const [formData, setFormData] = useState({
    title: subtopic?.title || "",
    description: subtopic?.description || "",
    textContent: subtopic?.textContent || "",
    uploadTestFile: subtopic?.uploadTestFile || "",
    id: subtopic?.id
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Card className={isEdit ? "border-orange-200" : "border-blue-200"}>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEdit ? "Edit Subtopic" : "Create New Subtopic"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Subtopic Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter subtopic title"
            />
          </div>
          <div className="space-y-2">
            <Label>Upload Test File</Label>
            <Input
              value={formData.uploadTestFile}
              onChange={(e) => setFormData(prev => ({ ...prev, uploadTestFile: e.target.value }))}
              placeholder="File path or URL"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Subtopic Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter subtopic description"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Text Content</Label>
          <Textarea
            value={formData.textContent}
            onChange={(e) => setFormData(prev => ({ ...prev, textContent: e.target.value }))}
            placeholder="Enter detailed content for this subtopic"
            rows={4}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update Subtopic" : "Save Subtopic")}
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

export default SubtopicForm;
