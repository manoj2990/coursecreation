


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assessment {
  _id: string;
  title: string;
  description: string;
  createdAt?: string; 
}

interface SubtopicAssessment {
  subtopicId: string;
  assessments: Assessment[];
}

interface AssessmentStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  authToken: string;
}

const AssessmentStep = ({ data, onUpdate, onNext, onPrev , authToken}: AssessmentStepProps) => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [selectedSubtopicIndex, setSelectedSubtopicIndex] = useState<number | null>(null);
  const [assessments, setAssessments] = useState<SubtopicAssessment[]>(data.assessments || []);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment>({ _id: "", title: "", description: "" });
  const { toast } = useToast();
 
  const topics = data.topics || [];

  const getSubtopicAssessments = (subtopicId: string) => {
    return assessments.find(sa => sa.subtopicId === subtopicId)?.assessments || [];
  };

  const saveCurrentAssessment = async () => {
    if (!currentAssessment.title.trim()) {
      toast({
        title: "Invalid Assessment",
        description: "Assessment needs a title.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTopicIndex === null || selectedSubtopicIndex === null) {
      toast({
        title: "Error",
        description: "Please select a topic and subtopic before saving.",
        variant: "destructive",
      });
      return;
    }

    const subtopicId = topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].id;

    try {
      const payload = {
        courseId: data.id,
        topicId: topics[selectedTopicIndex].id,
        subtopics: [
          {
            subtopicId,
            assessments: [{ title: currentAssessment.title, description: currentAssessment.description }]
          }
        ]
      };
      console.log("assessments payload --->", payload);
      const response = await fetch("https://workculture.onrender.com/api/v1/courses/save-CourseAssessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("responseData--->",responseData)
        const updatedAssessments = responseData.data; 
        // console.log("data--->", responseData.data[0])// Backend returns the full assessments array for the subtopic
        // console.log("updatedAssessments--->",responseData)
        setAssessments(prev => {
          const newAssessments = [...prev];
          const existing = newAssessments.find(sa => sa.subtopicId === subtopicId);
          if (existing) {
            existing.assessments = updatedAssessments;
          } else {
            newAssessments.push({ subtopicId, assessments: updatedAssessments });
          }
          return newAssessments;
        });

        toast({ title: "Success", description: "Assessment saved successfully for the subtopic!" });
        onUpdate({ assessments: [...assessments, { subtopicId, assessments: updatedAssessments }] });
        setCurrentAssessment({ _id: "", title: "", description: "" });
        setIsCreatingAssessment(false);
      } else {
        throw new Error("Failed to save assessment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Topic</Label>
              <div className="grid gap-2">
                {topics.map((topic: any, index: number) => (
                  <Card 
                    key={topic.id || index}
                    className={`cursor-pointer transition-colors ${
                      selectedTopicIndex === index ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedTopicIndex(index);
                      setSelectedSubtopicIndex(null);
                    }}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-medium">{topic.title}</h4>
                      <Badge variant="secondary" className="mt-1">
                        {topic.subtopics.length} subtopic(s)
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedTopicIndex !== null && (
              <div className="space-y-2">
                <Label>Select Subtopic</Label>
                <div className="grid gap-2">
                  {topics[selectedTopicIndex].subtopics.map((subtopic: any, index: number) => {
                    const subtopicAssessments = getSubtopicAssessments(subtopic.id || "");
                    return (
                      <Card 
                        key={subtopic.id || index}
                        className={`cursor-pointer transition-colors ${
                          selectedSubtopicIndex === index ? "border-green-500 bg-green-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedSubtopicIndex(index);
                          setIsCreatingAssessment(false);
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{subtopic.title}</h4>
                            <Badge variant="outline">
                              {subtopicAssessments.length} assessment(s)
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTopicIndex !== null && selectedSubtopicIndex !== null && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Assessments for: {topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].title}
                  </h3>
                  <Button onClick={() => setIsCreatingAssessment(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assessment
                  </Button>
                </div>

                {(() => {
                  const subtopicId = topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].id || "";
                  const subtopicAssessments = getSubtopicAssessments(subtopicId);
                  return subtopicAssessments.map((assessment: Assessment, assessmentIndex: number) => (
                    <Card key={assessment._id || assessmentIndex}>
                      <CardHeader>
                        <CardTitle className="text-base">{assessment.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm font-semibold">Description:</Label>
                            <p className="text-sm text-gray-600">{assessment.description || "No description provided"}</p>
                          </div>
                          {assessment.createdAt && (
                            <div>
                              <Label className="text-sm font-semibold">Created At:</Label>
                              <p className="text-sm text-gray-600">{new Date(assessment.createdAt).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ));
                })()}

                {isCreatingAssessment && (
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Create New Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Assessment Title</Label>
                        <Input
                          value={currentAssessment.title}
                          onChange={(e) => setCurrentAssessment(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter assessment title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={currentAssessment.description}
                          onChange={(e) => setCurrentAssessment(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter assessment description"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={saveCurrentAssessment}>Save Assessment</Button>
                        <Button variant="outline" onClick={() => setIsCreatingAssessment(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssessmentStep;