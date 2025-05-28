// Updated BasicInfoStep Component
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Edit, Loader2 } from "lucide-react";

interface BasicInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const BasicInfoStep = ({ data, onUpdate, onNext }: BasicInfoStepProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    image_url: "",
    skills: [] as string[],
    instructors: [] as string[],
    ai_settings: {
      persona_prompt: "",
      ability_prompt: ""
    },
    ...data
  });
  
  const [newSkill, setNewSkill] = useState("");
  const [newInstructor, setNewInstructor] = useState("");
  const [isEditing, setIsEditing] = useState(!data.id); // Edit mode if no ID (new course)
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [authToken, setAuthToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODIwNzllZmE2NzgyMzlmNjA1NzRjNTMiLCJlbWFpbCI6ImFkbWluTmVsc19CYXVtYmFjaDg2QGV4YW1wbGUuY29tIiwiYWNjb3VudFR5cGUiOiJhZG1pbiIsImlhdCI6MTc0ODM0NTEwMCwiZXhwIjoxNzQ4OTQ5OTAwfQ.p4mO3YDtBeWC677MGTX_KppJP8O9Jan_cj0imI5f9sY"); // Replace with actual token

  // Update form data when props change
  useEffect(() => {
    setFormData(prev => ({ ...prev, ...data }));
  }, [data]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAISettingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      ai_settings: { ...prev.ai_settings, [field]: value }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addInstructor = () => {
    if (newInstructor.trim()) {
      setFormData(prev => ({
        ...prev,
        instructors: [...prev.instructors, newInstructor.trim()]
      }));
      setNewInstructor("");
    }
  };

  const removeInstructor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructors: prev.instructors.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setSaveMessage("Course title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setSaveMessage("Course description is required");
      return false;
    }
    return true;
  };

  // Create new course API handler
  const createCourse = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      console.log('Creating new course:', formData);
      
      const response = await fetch("https://workculture.onrender.com/api/v1/courses/create-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("result--->",result)
          console.log("result.data--->",result.data)
            console.log("result.data.course--->",result.data.course)
              console.log("result.data.course--->",result.data.course._id)
        const updatedData = { ...formData, id: result.data.course._id};
        setFormData(updatedData);
        onUpdate(updatedData);
        setIsEditing(false);
        setSaveMessage("Course created successfully!");
      } else {
        throw new Error(`Failed to create course: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Create course error:', error);
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing course API handler
  const updateCourse = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      console.log('Updating course old data:', formData);
      const editedData = {...formData,courseId:formData.id}
      console.log('Updating course new data:', editedData);
      const response = await fetch("https://workculture.onrender.com/api/v1/courses/course-update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(editedData),
      });

      if (response.ok) {
        const result = await response.json();
        onUpdate(editedData);
        setIsEditing(false);
        setSaveMessage("Course information updated successfully!");
      } else {
        throw new Error(`Failed to update course: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Update course error:', error);
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save action - create or update based on whether course has ID
  const handleSave = () => {
    if (formData.id) {
      updateCourse();
    } else {
      createCourse();
    }
  };

  // Handle edit mode toggle
  const handleEdit = () => {
    setIsEditing(true);
    setSaveMessage("");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData(prev => ({ ...prev, ...data })); // Reset to original data
    setIsEditing(false);
    setSaveMessage("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Information</CardTitle>
            <div className="flex gap-2">
              {/* Show Edit button when course exists and not in edit mode */}
              {!isEditing && formData.id && (
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course Info
                </Button>
              )}
              
              {/* Show Save/Cancel buttons when in edit mode */}
              {isEditing && (
                <>
                  {formData.id && (
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSaving 
                      ? "Saving..." 
                      : formData.id 
                        ? "Save Changes" 
                        : "Create Course"
                    }
                  </Button>
                </>
              )}
            </div>
          </div>
          {saveMessage && (
            <div className={`text-sm mt-2 ${
              saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}>
              {saveMessage}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Web Development Fundamentals"
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="e.g., 8 weeks"
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="A comprehensive course covering..."
              rows={3}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Course Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange("image_url", e.target.value)}
              placeholder="https://example.com/course-image.jpg"
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(index)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Instructors</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.instructors.map((instructor, index) => (
                <Badge key={index} variant="outline">
                  {instructor}
                  {isEditing && (
                    <button
                      onClick={() => removeInstructor(index)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  placeholder="Add an instructor"
                  onKeyPress={(e) => e.key === "Enter" && addInstructor()}
                />
                <Button type="button" variant="outline" onClick={addInstructor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Assistant Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona_prompt">Persona Prompt</Label>
            <Textarea
              id="persona_prompt"
              value={formData.ai_settings.persona_prompt}
              onChange={(e) => handleAISettingChange("persona_prompt", e.target.value)}
              placeholder="You are a web development instructor with 10 years of experience..."
              rows={3}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ability_prompt">Ability Prompt</Label>
            <Textarea
              id="ability_prompt"
              value={formData.ai_settings.ability_prompt}
              onChange={(e) => handleAISettingChange("ability_prompt", e.target.value)}
              placeholder="You can help students understand concepts, debug code..."
              rows={3}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          {/* Success message display */}
          {saveMessage && !saveMessage.includes('Error') && formData.id && (
            <div className="text-sm text-green-600 flex items-center">
              <span className="mr-2">✓</span>
              {saveMessage}
            </div>
          )}
        </div>
        <Button 
          onClick={onNext} 
          size="lg"
          disabled={!formData.id || isEditing} // Disable if no course ID or in edit mode
        >
          Continue to Content
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;