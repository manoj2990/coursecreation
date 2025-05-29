

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Plus, X, BookOpen, Users, FileText, Award, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublishStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onPrev: () => void;
  authToken:string;
}

const PublishStep = ({ data, onUpdate, onPrev,authToken }: PublishStepProps) => {
  const [linkedEntities, setLinkedEntities] = useState<any[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedCourse, setPublishedCourse] = useState<any>(null);
  const { toast } = useToast();
  // const [authToken] = useState(
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODIwNzllZmE2NzgyMzlmNjA1NzRjNTMiLCJlbWFpbCI6ImFkbWluTmVsc19CYXVtYmFjaDg2QGV4YW1wbGUuY29tIiwiYWNjb3VudFR5cGUiOiJhZG1pbiIsImlhdCI6MTc0ODM0NTEwMCwiZXhwIjoxNzQ4OTQ5OTAwfQ.p4mO3YDtBeWC677MGTX_KppJP8O9Jan_cj0imI5f9sY"
  // );

  const organizations = [
    {
      name: "Kessler, Marks and Botsford",
      id: "68208700f2b634ae4425598e",
      departments: [
        { name: "Toys Department", id: "68208821f2b634ae442559a1" },
        { name: "Games Department", id: "68208847f2b634ae442559aa" },
      ],
    },
    {
      name: "Will - Hudson",
      id: "6820873ef2b634ae44255995",
      departments: [
        { name: "Computers Department", id: "6820886ff2b634ae442559b3" },
      ],
    },
  ];

  const addOrganization = () => {
    if (!selectedOrganization) return;

    const org = organizations.find((o) => o.id === selectedOrganization);
    if (!org) return;

    setLinkedEntities((prev) => [
      ...prev,
      {
        organization: org.id,
        organizationName: org.name,
        departments: [],
      },
    ]);
    setSelectedOrganization("");
  };

  const addDepartment = (orgIndex: number) => {
    if (!selectedDepartment) return;

    const org = organizations.find((o) => o.id === linkedEntities[orgIndex].organization);
    const dept = org?.departments.find((d) => d.id === selectedDepartment);
    if (!dept) return;

    setLinkedEntities((prev) =>
      prev.map((entity, index) =>
        index === orgIndex
          ? {
              ...entity,
              departments: [...entity.departments, { _id: dept.id, name: dept.name }],
            }
          : entity
      )
    );
    setSelectedDepartment("");
  };

  const removeOrganization = (index: number) => {
    setLinkedEntities((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDepartment = (orgIndex: number, deptIndex: number) => {
    setLinkedEntities((prev) =>
      prev.map((entity, index) =>
        index === orgIndex
          ? {
              ...entity,
              departments: entity.departments.filter((_, i) => i !== deptIndex),
            }
          : entity
      )
    );
  };

  const publishCourse = async () => {
    setIsPublishing(true);
    try {
      const payload = {
        courseId: data.id,
        status: "published",
        linked_entities: linkedEntities.map((entity) => ({
          organization: entity.organization,
          departments: entity.departments.map((dept) => ({ _id: dept._id })),
        })),
      };
      console.log("publish payload-->", payload);
      const response = await fetch("https://workculture.onrender.com/api/v1/courses/publish-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      console.log("publish resp --->", response);

      if (response.ok) {
        const result = await response.json();
        console.log("publish result --->", result);
        const courseData = result.data.course;
        setPublishedCourse(courseData);
        toast({
          title: "Course Published!",
          description: "Your course has been successfully published and is now available.",
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
      {/* Published Course Details */}
      {publishedCourse && (
        <Card className="border-green-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Course Published Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {publishedCourse.title} ({publishedCourse._id})
              </p>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Linked Organizations:</Label>
                {publishedCourse.linked_entities?.length > 0 ? (
                  publishedCourse.linked_entities.map((entity, index) => {
                    const org = organizations.find((o) => o.id === entity.organization);
                    return (
                      <div key={index} className="ml-2">
                        <p className="text-sm font-medium">
                          {org ? `${org.name}(${org.id})` : entity.organization}
                        </p>
                        <div className="ml-4 space-y-1">
                          {entity.departments?.length > 0 ? (
                            entity.departments.map((dept, deptIndex) => {
                              const deptData = org?.departments.find((d) => d.id === dept);
                              return (
                                <p key={deptIndex} className="text-sm">
                                  - {deptData ? `${deptData.name}(${deptData.id})` : dept}
                                </p>
                              );
                            })
                          ) : (
                            <p className="text-sm text-gray-500">No departments linked</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No organizations linked</p>
                )}
              </div>
              <p className="text-sm">
                <span className="font-semibold">Status:</span>{" "}
                <span className="text-green-600">{publishedCourse.status}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                  {data.skills?.length > 0 ? (
                    data.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No skills added</span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Instructors</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.instructors?.length > 0 ? (
                    data.instructors.map((instructor, index) => (
                      <Badge key={index} variant="outline">{instructor}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No instructors added</span>
                  )}
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
            <Select onValueChange={setSelectedOrganization} value={selectedOrganization}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {`${org.name}(${org.id})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addOrganization}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {linkedEntities.map((entity, orgIndex) => {
            const org = organizations.find((o) => o.id === entity.organization);
            return (
              <Card key={orgIndex} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Label className="font-semibold">Organization ID:</Label>
                      <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                        {`${entity.organizationName}(${entity.organization})`}
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
                          {`${dept.name}(${dept._id})`}
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
                      <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {org?.departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {`${dept.name}(${dept.id})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            );
          })}
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