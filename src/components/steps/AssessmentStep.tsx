
// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// interface Question {
//   questionType: "multiple_choice" | "descriptive";
//   questionText: string;
//   options?: string[];
//   correctAnswer?: string;
//   sampleAnswer?: string;
// }

// interface Assessment {
//   title: string;
//   description: string;
//   questions: Question[];
// }

// interface SubtopicAssessment {
//   subtopicId: string;
//   assessments: Assessment[];
// }

// interface AssessmentStepProps {
//   data: any;
//   onUpdate: (data: any) => void;
//   onNext: () => void;
//   onPrev: () => void;
// }

// const AssessmentStep = ({ data, onUpdate, onNext, onPrev }: AssessmentStepProps) => {
//   const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
//   const [selectedSubtopicIndex, setSelectedSubtopicIndex] = useState<number | null>(null);
//   const [assessments, setAssessments] = useState<SubtopicAssessment[]>(data.assessments || []);
//   const [tempAssessments, setTempAssessments] = useState<{ [subtopicId: string]: Assessment[] }>({}); // Temporary assessments per subtopic
//   const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
//   const [currentAssessment, setCurrentAssessment] = useState<Assessment>({ title: "", description: "", questions: [] });
//   const [currentQuestion, setCurrentQuestion] = useState<Question>({
//     questionType: "multiple_choice",
//     questionText: "",
//     options: ["", "", "", ""],
//     correctAnswer: ""
//   });
//   const { toast } = useToast();
//   const [authToken] = useState(
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODIwNzllZmE2NzgyMzlmNjA1NzRjNTMiLCJlbWFpbCI6ImFkbWluTmVsc19CYXVtYmFjaDg2QGV4YW1wbGUuY29tIiwiYWNjb3VudFR5cGUiOiJhZG1pbiIsImlhdCI6MTc0ODM0NTEwMCwiZXhwIjoxNzQ4OTQ5OTAwfQ.p4mO3YDtBeWC677MGTX_KppJP8O9Jan_cj0imI5f9sY"
//   );
//   const topics = data.topics || [];

//   const getSubtopicAssessments = (subtopicId: string) => {
//     return tempAssessments[subtopicId] || [];
//   };

//   const addQuestion = () => {
//     if (!currentQuestion.questionText.trim()) {
//       toast({
//         title: "Invalid Question",
//         description: "Question text cannot be empty.",
//         variant: "destructive",
//       });
//       return;
//     }

//     const question = { ...currentQuestion };
//     if (question.questionType === "multiple_choice") {
//       question.options = question.options?.filter(opt => opt.trim());
//       if (!question.options?.length || !question.correctAnswer) {
//         toast({
//           title: "Invalid Question",
//           description: "Multiple choice questions need options and a correct answer.",
//           variant: "destructive",
//         });
//         return;
//       }
//     }

//     setCurrentAssessment(prev => ({
//       ...prev,
//       questions: [...prev.questions, question]
//     }));

//     setCurrentQuestion({
//       questionType: "multiple_choice",
//       questionText: "",
//       options: ["", "", "", ""],
//       correctAnswer: ""
//     });
//   };

//   const removeQuestion = (index: number) => {
//     setCurrentAssessment(prev => ({
//       ...prev,
//       questions: prev.questions.filter((_, i) => i !== index)
//     }));
//   };

//   const saveCurrentAssessment = () => {
//     if (!currentAssessment.title.trim() || !currentAssessment.questions.length) {
//       toast({
//         title: "Invalid Assessment",
//         description: "Assessment needs a title and at least one question.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (selectedTopicIndex === null || selectedSubtopicIndex === null) return;

//     const subtopicId = topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].id;
    
//     setTempAssessments(prev => ({
//       ...prev,
//       [subtopicId]: [...(prev[subtopicId] || []), currentAssessment]
//     }));

//     setCurrentAssessment({ title: "", description: "", questions: [] });
//     setIsCreatingAssessment(false);
//     toast({ title: "Success", description: "Assessment added to subtopic. Add more or continue to publish!" });
//   };

//   const publishAssessments = async () => {
//     if (selectedTopicIndex === null) {
//       toast({
//         title: "Error",
//         description: "Please select a topic before publishing.",
//         variant: "destructive",
//       });
//       return;
//     }

//     // Prepare the subtopics array for the payload
//     const subtopics = Object.keys(tempAssessments).map(subtopicId => ({
//       subtopicId,
//       assessments: tempAssessments[subtopicId]
//     }));

//     if (subtopics.length === 0) {
//       toast({
//         title: "Error",
//         description: "No assessments created to publish.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       const payload = {
//         courseId: data.id,
//         topicId: topics[selectedTopicIndex].id,
//         subtopics
//       };
//       console.log("assessments payload --->", payload);
//       const response = await fetch("https://workculture.onrender.com/api/v1/courses/course-assessments", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authToken}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         // Update the assessments state with the temporary assessments
//         setAssessments(prev => {
//           const newAssessments = [...prev];
//           subtopics.forEach(subtopic => {
//             const existing = newAssessments.find(sa => sa.subtopicId === subtopic.subtopicId);
//             if (existing) {
//               existing.assessments = [...existing.assessments, ...subtopic.assessments];
//             } else {
//               newAssessments.push(subtopic);
//             }
//           });
//           return newAssessments;
//         });

//         toast({ title: "Success", description: "Assessments published successfully!" });
//         onUpdate({ assessments: [...assessments, ...subtopics] });
//         onNext();
//       } else {
//         throw new Error("Failed to publish assessments");
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to publish assessments. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const updateQuestionOption = (index: number, value: string) => {
//     setCurrentQuestion(prev => ({
//       ...prev,
//       options: prev.options?.map((opt, i) => i === index ? value : opt) || []
//     }));
//   };

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Course Assessments</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {/* Topic Selection */}
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Select Topic</Label>
//               <div className="grid gap-2">
//                 {topics.map((topic, index) => (
//                   <Card 
//                     key={topic.id || index}
//                     className={`cursor-pointer transition-colors ${
//                       selectedTopicIndex === index ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
//                     }`}
//                     onClick={() => {
//                       setSelectedTopicIndex(index);
//                       setSelectedSubtopicIndex(null);
//                       setTempAssessments({}); // Reset temp assessments when changing topic
//                     }}
//                   >
//                     <CardContent className="p-3">
//                       <h4 className="font-medium">{topic.title}</h4>
//                       <Badge variant="secondary" className="mt-1">
//                         {topic.subtopics.length} subtopic(s)
//                       </Badge>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </div>

//             {/* Subtopic Selection */}
//             {selectedTopicIndex !== null && (
//               <div className="space-y-2">
//                 <Label>Select Subtopic</Label>
//                 <div className="grid gap-2">
//                   {topics[selectedTopicIndex].subtopics.map((subtopic, index) => {
//                     const subtopicAssessments = getSubtopicAssessments(subtopic.id || "");
//                     return (
//                       <Card 
//                         key={subtopic.id || index}
//                         className={`cursor-pointer transition-colors ${
//                           selectedSubtopicIndex === index ? "border-green-500 bg-green-50" : "hover:bg-gray-50"
//                         }`}
//                         onClick={() => setSelectedSubtopicIndex(index)}
//                       >
//                         <CardContent className="p-3">
//                           <div className="flex justify-between items-center">
//                             <h4 className="font-medium">{subtopic.title}</h4>
//                             <Badge variant="outline">
//                               {subtopicAssessments.length} assessment(s)
//                             </Badge>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     );
//                   })}
//                 </div>
//                 {/* Publish Button for All Subtopics */}
//                 <Button 
//                   onClick={publishAssessments} 
//                   disabled={Object.keys(tempAssessments).length === 0}
//                   className="mt-4"
//                 >
//                   Publish Assessments for All Subtopics
//                   <ChevronRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </div>
//             )}

//             {/* Assessment Creation */}
//             {selectedTopicIndex !== null && selectedSubtopicIndex !== null && (
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-lg font-semibold">
//                     Assessments for: {topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].title}
//                   </h3>
//                   <Button onClick={() => setIsCreatingAssessment(true)}>
//                     <Plus className="mr-2 h-4 w-4" />
//                     Add Assessment
//                   </Button>
//                 </div>

//                 {/* Existing Temporary Assessments */}
//                 {(() => {
//                   const subtopicId = topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].id || "";
//                   const subtopicAssessments = getSubtopicAssessments(subtopicId);
//                   return subtopicAssessments.map((assessment, assessmentIndex) => (
//                     <Card key={assessmentIndex}>
//                       <CardHeader>
//                         <CardTitle className="text-base">{assessment.title}</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="space-y-2">
//                           <div>
//                             <Label className="text-sm font-semibold">Description:</Label>
//                             <p className="text-sm text-gray-600">{assessment.description || "No description provided"}</p>
//                           </div>
//                           {assessment.questions.map((question, qIndex) => (
//                             <div key={qIndex} className="p-3 bg-gray-50 rounded">
//                               <p className="font-medium">{question.questionText}</p>
//                               <Badge variant="outline" className="mt-1">
//                                 {question.questionType === "multiple_choice" ? "Multiple Choice" : "Descriptive"}
//                               </Badge>
//                               {question.options && (
//                                 <div className="mt-2 space-y-1">
//                                   {question.options.map((option, oIndex) => (
//                                     <div key={oIndex} className="text-sm text-gray-600">
//                                       • {option} {option === question.correctAnswer && "✓"}
//                                     </div>
//                                   ))}
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ));
//                 })()}

//                 {/* Create New Assessment */}
//                 {isCreatingAssessment && (
//                   <Card className="border-blue-200">
//                     <CardHeader>
//                       <CardTitle className="text-lg">Create New Assessment</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="space-y-2">
//                         <Label>Assessment Title</Label>
//                         <Input
//                           value={currentAssessment.title}
//                           onChange={(e) => setCurrentAssessment(prev => ({ ...prev, title: e.target.value }))}
//                           placeholder="Enter assessment title"
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <Label>Description</Label>
//                         <Textarea
//                           value={currentAssessment.description}
//                           onChange={(e) => setCurrentAssessment(prev => ({ ...prev, description: e.target.value }))}
//                           placeholder="Enter assessment description"
//                           rows={3}
//                         />
//                       </div>

//                       {/* Question Form */}
//                       <div className="border rounded-lg p-4 space-y-4">
//                         <h4 className="font-semibold">Add Question</h4>
                        
//                         <div className="space-y-2">
//                           <Label>Question Type</Label>
//                           <Select
//                             value={currentQuestion.questionType}
//                             onValueChange={(value: "multiple_choice" | "descriptive") => 
//                               setCurrentQuestion(prev => ({ 
//                                 ...prev, 
//                                 questionType: value,
//                                 options: value === "multiple_choice" ? ["", "", "", ""] : undefined,
//                                 correctAnswer: value === "multiple_choice" ? "" : undefined,
//                                 sampleAnswer: value === "descriptive" ? "" : undefined
//                               }))
//                             }
//                           >
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
//                               <SelectItem value="descriptive">Descriptive</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div className="space-y-2">
//                           <Label>Question Text</Label>
//                           <Textarea
//                             value={currentQuestion.questionText}
//                             onChange={(e) => setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }))}
//                             placeholder="Enter your question"
//                             rows={2}
//                           />
//                         </div>

//                         {currentQuestion.questionType === "multiple_choice" && (
//                           <>
//                             <div className="space-y-2">
//                               <Label>Options</Label>
//                               {currentQuestion.options?.map((option, index) => (
//                                 <Input
//                                   key={index}
//                                   value={option}
//                                   onChange={(e) => updateQuestionOption(index, e.target.value)}
//                                   placeholder={`Option ${index + 1}`}
//                                 />
//                               ))}
//                             </div>
//                             <div className="space-y-2">
//                               <Label>Correct Answer</Label>
//                               <Select
//                                 value={currentQuestion.correctAnswer}
//                                 onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: value }))}
//                               >
//                                 <SelectTrigger>
//                                   <SelectValue placeholder="Select correct answer" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   {currentQuestion.options?.filter(opt => opt.trim()).map((option, index) => (
//                                     <SelectItem key={index} value={option}>{option}</SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                           </>
//                         )}

//                         {currentQuestion.questionType === "descriptive" && (
//                           <div className="space-y-2">
//                             <Label>Sample Answer</Label>
//                             <Textarea
//                               value={currentQuestion.sampleAnswer || ""}
//                               onChange={(e) => setCurrentQuestion(prev => ({ ...prev, sampleAnswer: e.target.value }))}
//                               placeholder="Provide a sample answer"
//                               rows={3}
//                             />
//                           </div>
//                         )}

//                         <Button onClick={addQuestion}>
//                           <Plus className="mr-2 h-4 w-4" />
//                           Add Question
//                         </Button>
//                       </div>

//                       {/* Questions Preview */}
//                       {currentAssessment.questions.length > 0 && (
//                         <div className="space-y-2">
//                           <Label>Questions ({currentAssessment.questions.length})</Label>
//                           {currentAssessment.questions.map((question, index) => (
//                             <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded">
//                               <div className="flex-1">
//                                 <p className="font-medium">{question.questionText}</p>
//                                 <Badge variant="outline" className="mt-1">
//                                   {question.questionType === "multiple_choice" ? "Multiple Choice" : "Descriptive"}
//                                 </Badge>
//                               </div>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => removeQuestion(index)}
//                               >
//                                 <X className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       <div className="flex gap-2">
//                         <Button onClick={saveCurrentAssessment}>Save Assessment</Button>
//                         <Button variant="outline" onClick={() => setIsCreatingAssessment(false)}>
//                           Cancel
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       <div className="flex justify-between">
//         <Button variant="outline" onClick={onPrev}>
//           <ChevronLeft className="mr-2 h-4 w-4" />
//           Previous
//         </Button>
//         {/* Removed the Publish button from here */}
//       </div>
//     </div>
//   );
// };

// export default AssessmentStep;


////////////////////////////////////////////////////////////////////////////////////////

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// interface Assessment {
//   title: string;
//   description: string;
// }

// interface SubtopicAssessment {
//   subtopicId: string;
//   assessments: Assessment[];
// }

// interface AssessmentStepProps {
//   data: any;
//   onUpdate: (data: any) => void;
//   onNext: () => void;
//   onPrev: () => void;
// }

// const AssessmentStep = ({ data, onUpdate, onNext, onPrev }: AssessmentStepProps) => {
//   const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
//   const [selectedSubtopicIndex, setSelectedSubtopicIndex] = useState<number | null>(null);
//   const [assessments, setAssessments] = useState<SubtopicAssessment[]>(data.assessments || []);
//   const [tempAssessments, setTempAssessments] = useState<Assessment[]>([]); // Temporary assessments for the current subtopic
//   const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
//   const [currentAssessment, setCurrentAssessment] = useState<Assessment>({ title: "", description: "" });
//   const { toast } = useToast();
//   const [authToken] = useState(
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODIwNzllZmE2NzgyMzlmNjA1NzRjNTMiLCJlbWFpbCI6ImFkbWluTmVsc19CYXVtYmFjaDg2QGV4YW1wbGUuY29tIiwiYWNjb3VudFR5cGUiOiJhZG1pbiIsImlhdCI6MTc0ODM0NTEwMCwiZXhwIjoxNzQ4OTQ5OTAwfQ.p4mO3YDtBeWC677MGTX_KppJP8O9Jan_cj0imI5f9sY"
//   );
//   const topics = data.topics || [];

//   const getSubtopicAssessments = (subtopicId: string) => {
//     const savedAssessments = assessments.find(sa => sa.subtopicId === subtopicId)?.assessments || [];
//     if (selectedTopicIndex !== null && selectedSubtopicIndex !== null) {
//       const currentSubtopicId = topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].id;
//       if (subtopicId === currentSubtopicId) {
//         return [...savedAssessments, ...tempAssessments];
//       }
//     }
//     return savedAssessments;
//   };

//   const saveCurrentAssessment = () => {
//     if (!currentAssessment.title.trim()) {
//       toast({
//         title: "Invalid Assessment",
//         description: "Assessment needs a title.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setTempAssessments(prev => [...prev, currentAssessment]);
//     setCurrentAssessment({ title: "", description: "" });
//     setIsCreatingAssessment(false);
//     toast({ title: "Success", description: "Assessment added to subtopic. Add more or publish!" });
//   };

//   const publishAssessments = async () => {
//     if (selectedTopicIndex === null || selectedSubtopicIndex === null) {
//       toast({
//         title: "Error",
//         description: "Please select a topic and subtopic before publishing.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (tempAssessments.length === 0) {
//       toast({
//         title: "Error",
//         description: "No assessments created to publish for this subtopic.",
//         variant: "destructive",
//       });
//       return;
//     }

//     const subtopicId = topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].id;

//     try {
//       const payload = {
//         courseId: data.id,
//         topicId: topics[selectedTopicIndex].id,
//         subtopics: [
//           {
//             subtopicId,
//             assessments: tempAssessments
//           }
//         ]
//       };
//       console.log("assessments payload --->", payload);
//       const response = await fetch("http://localhost:4000/api/v1/courses/save-assessments", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authToken}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         setAssessments(prev => {
//           const newAssessments = [...prev];
//           const existing = newAssessments.find(sa => sa.subtopicId === subtopicId);
//           if (existing) {
//             existing.assessments = [...existing.assessments, ...tempAssessments];
//           } else {
//             newAssessments.push({ subtopicId, assessments: tempAssessments });
//           }
//           return newAssessments;
//         });

//         toast({ title: "Success", description: "Assessments published successfully for the subtopic!" });
//         onUpdate({ assessments: [...assessments, { subtopicId, assessments: tempAssessments }] });
//         setTempAssessments([]);
//         setSelectedSubtopicIndex(null);
//       } else {
//         throw new Error("Failed to publish assessments");
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to publish assessments. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Course Assessments</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Select Topic</Label>
//               <div className="grid gap-2">
//                 {topics.map((topic, index) => (
//                   <Card 
//                     key={topic.id || index}
//                     className={`cursor-pointer transition-colors ${
//                       selectedTopicIndex === index ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
//                     }`}
//                     onClick={() => {
//                       setSelectedTopicIndex(index);
//                       setSelectedSubtopicIndex(null);
//                       setTempAssessments([]);
//                     }}
//                   >
//                     <CardContent className="p-3">
//                       <h4 className="font-medium">{topic.title}</h4>
//                       <Badge variant="secondary" className="mt-1">
//                         {topic.subtopics.length} subtopic(s)
//                       </Badge>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </div>

//             {selectedTopicIndex !== null && (
//               <div className="space-y-2">
//                 <Label>Select Subtopic</Label>
//                 <div className="grid gap-2">
//                   {topics[selectedTopicIndex].subtopics.map((subtopic, index) => {
//                     const subtopicAssessments = getSubtopicAssessments(subtopic.id || "");
//                     return (
//                       <Card 
//                         key={subtopic.id || index}
//                         className={`cursor-pointer transition-colors ${
//                           selectedSubtopicIndex === index ? "border-green-500 bg-green-50" : "hover:bg-gray-50"
//                         }`}
//                         onClick={() => {
//                           setSelectedSubtopicIndex(index);
//                           setTempAssessments([]);
//                           setIsCreatingAssessment(false);
//                         }}
//                       >
//                         <CardContent className="p-3">
//                           <div className="flex justify-between items-center">
//                             <h4 className="font-medium">{subtopic.title}</h4>
//                             <Badge variant="outline">
//                               {subtopicAssessments.length} assessment(s)
//                             </Badge>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {selectedTopicIndex !== null && selectedSubtopicIndex !== null && (
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-lg font-semibold">
//                     Assessments for: {topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].title}
//                   </h3>
//                   <Button onClick={() => setIsCreatingAssessment(true)}>
//                     <Plus className="mr-2 h-4 w-4" />
//                     Add Assessment
//                   </Button>
//                 </div>

//                 {(() => {
//                   const subtopicId = topics[selectedTopicIndex].subtopics[selectedSubtopicIndex].id || "";
//                   const subtopicAssessments = getSubtopicAssessments(subtopicId);
//                   return subtopicAssessments.map((assessment, assessmentIndex) => (
//                     <Card key={assessmentIndex}>
//                       <CardHeader>
//                         <CardTitle className="text-base">{assessment.title}</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="space-y-2">
//                           <div>
//                             <Label className="text-sm font-semibold">Description:</Label>
//                             <p className="text-sm text-gray-600">{assessment.description || "No description provided"}</p>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ));
//                 })()}

//                 {isCreatingAssessment && (
//                   <Card className="border-blue-200">
//                     <CardHeader>
//                       <CardTitle className="text-lg">Create New Assessment</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="space-y-2">
//                         <Label>Assessment Title</Label>
//                         <Input
//                           value={currentAssessment.title}
//                           onChange={(e) => setCurrentAssessment(prev => ({ ...prev, title: e.target.value }))}
//                           placeholder="Enter assessment title"
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <Label>Description</Label>
//                         <Textarea
//                           value={currentAssessment.description}
//                           onChange={(e) => setCurrentAssessment(prev => ({ ...prev, description: e.target.value }))}
//                           placeholder="Enter assessment description"
//                           rows={3}
//                         />
//                       </div>

//                       <div className="flex gap-2">
//                         <Button onClick={saveCurrentAssessment}>Save Assessment</Button>
//                         <Button variant="outline" onClick={() => setIsCreatingAssessment(false)}>
//                           Cancel
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 <Button 
//                   onClick={publishAssessments} 
//                   disabled={tempAssessments.length === 0}
//                   className="mt-4"
//                 >
//                   Publish Assessments for This Subtopic
//                   <ChevronRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       <div className="flex justify-between">
//         <Button variant="outline" onClick={onPrev}>
//           <ChevronLeft className="mr-2 h-4 w-4" />
//           Previous
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AssessmentStep;




/////////////////////////////////////////////


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
  // const [authToken] = useState(
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODIwNzllZmE2NzgyMzlmNjA1NzRjNTMiLCJlbWFpbCI6ImFkbWluTmVsc19CYXVtYmFjaDg2QGV4YW1wbGUuY29tIiwiYWNjb3VudFR5cGUiOiJhZG1pbiIsImlhdCI6MTc0ODM0NTEwMCwiZXhwIjoxNzQ4OTQ5OTAwfQ.p4mO3YDtBeWC677MGTX_KppJP8O9Jan_cj0imI5f9sY"
  // );
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