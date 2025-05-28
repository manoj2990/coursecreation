
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Plus, X, BookOpen, Users, FileText, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublishStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onPrev: () => void;
}

const PublishStep = ({ data, onUpdate, onPrev }: PublishStepProps) => {
  const [linkedEntities, setLinkedEntities] = useState<any[]>([]);
  const [newOrganization, setNewOrganization] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const addOrganization = () => {
    if (!newOrganization.trim()) return;
    
    setLinkedEntities(prev => [
      ...prev,
      {
        organization: newOrganization.trim(),
        departments: []
      }
    ]);
    setNewOrganization("");
  };

  const addDepartment = (orgIndex: number) => {
    if (!newDepartment.trim()) return;
    
    setLinkedEntities(prev => prev.map((entity, index) => 
      index === orgIndex 
        ? {
            ...entity,
            departments: [...entity.departments, { _id: newDepartment.trim() }]
          }
        : entity
    ));
    setNewDepartment("");
  };

  const removeOrganization = (index: number) => {
    setLinkedEntities(prev => prev.filter((_, i) => i !== index));
  };

  const removeDepartment = (orgIndex: number, deptIndex: number) => {
    setLinkedEntities(prev => prev.map((entity, index) => 
      index === orgIndex 
        ? {
            ...entity,
            departments: entity.departments.filter((_, i) => i !== deptIndex)
          }
        : entity
    ));
  };

  const publishCourse = async () => {
    setIsPublishing(true);
    try {
      const payload = {
        courseId: data.id,
        status: "published",
        linked_entities: linkedEntities
      };

      const response = await fetch("https://workculture.onrender.com/api/v1/courses/publish-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({ 
          title: "Course Published!", 
          description: "Your course has been successfully published and is now available." 
        });
      } else {
        throw new Error("Failed to publish course");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const topics = data.topics || [];
  const totalSubtopics = topics.reduce((sum, topic) => sum + (topic.subtopics?.length || 0), 0);
  const assessments = data.assessments || [];
  const totalAssessments = assessments.reduce((sum, sa) => sum + (sa.assessments?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{data.title || "Course Title"}</h3>
                <p className="text-gray-600 mt-1">{data.description || "No description provided"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-blue-600">{topics.length}</div>
                  <div className="text-sm text-gray-600">Topics</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-green-600">{totalSubtopics}</div>
                  <div className="text-sm text-gray-600">Subtopics</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-purple-600">{totalAssessments}</div>
                  <div className="text-sm text-gray-600">Assessments</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-orange-600">{data.instructors?.length || 0}</div>
                  <div className="text-sm text-gray-600">Instructors</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Duration</Label>
                <p className="text-gray-600">{data.duration || "Not specified"}</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Skills Covered</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.skills?.length > 0 ? data.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  )) : <span className="text-gray-500 text-sm">No skills added</span>}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Instructors</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.instructors?.length > 0 ? data.instructors.map((instructor, index) => (
                    <Badge key={index} variant="outline">{instructor}</Badge>
                  )) : <span className="text-gray-500 text-sm">No instructors added</span>}
                </div>
              </div>
            </div>
          </div>

          {topics.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Course Content Structure</h4>
                <div className="space-y-3">
                  {topics.map((topic, index) => (
                    <div key={topic.id || index} className="border rounded-lg p-3">
                      <h5 className="font-medium">{topic.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                      <div className="mt-2 space-y-1">
                        {topic.subtopics?.map((subtopic, subIndex) => (
                          <div key={subtopic.id || subIndex} className="ml-4 text-sm">
                            <span className="text-gray-500">•</span> {subtopic.title}
                          </div>
                        ))}
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        {topic.subtopics?.length || 0} subtopic(s)
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Organization Linking */}
      <Card>
        <CardHeader>
          <CardTitle>Link to Organizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newOrganization}
              onChange={(e) => setNewOrganization(e.target.value)}
              placeholder="Enter organization ID"
              onKeyPress={(e) => e.key === "Enter" && addOrganization()}
            />
            <Button onClick={addOrganization}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {linkedEntities.map((entity, orgIndex) => (
            <Card key={orgIndex} className="border-dashed">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Label className="font-semibold">Organization ID:</Label>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                      {entity.organization}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOrganization(orgIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Department IDs:</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entity.departments.map((dept, deptIndex) => (
                      <Badge key={deptIndex} variant="outline">
                        {dept._id}
                        <button
                          onClick={() => removeDepartment(orgIndex, deptIndex)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="Enter department ID"
                      onKeyPress={(e) => e.key === "Enter" && addDepartment(orgIndex)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addDepartment(orgIndex)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={publishCourse} 
          disabled={isPublishing}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          {isPublishing ? "Publishing..." : "Publish Course"}
        </Button>
      </div>
    </div>
  );
};

export default PublishStep;
