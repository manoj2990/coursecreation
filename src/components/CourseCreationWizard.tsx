import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import BasicInfoStep from "@/components/steps/BasicInfoStep";
import ContentStep from "@/components/steps/ContentStep";
import AssessmentStep from "@/components/steps/AssessmentStep";
import PublishStep from "@/components/steps/PublishStep";

const LOGO_URL = "/logo.png";

const CourseCreationWizard = ({authToken, setAuthToken, setIsAuthenticated}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({});

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
   
    localStorage.clear();
  };

  const steps = [
    { id: 1, title: "Basic Info", description: "Course details" },
    { id: 2, title: "Content", description: "Topics & Subtopics" },
    { id: 3, title: "Assessments", description: "Questions & Tests" },
    { id: 4, title: "Publish", description: "Review & Publish" },
  ];

  const updateCourseData = (stepData) => {
    setCourseData((prev) => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId) => {
    setCurrentStep(stepId);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={courseData}
            onUpdate={updateCourseData}
            onNext={nextStep}
            authToken={authToken}
          />
        );
      case 2:
        return (
          <ContentStep
            data={courseData}
            onUpdate={updateCourseData}
            onNext={nextStep}
            onPrev={prevStep}
            authToken={authToken}
          />
        );
      case 3:
        return (
          <AssessmentStep
            data={courseData}
            onUpdate={updateCourseData}
            onNext={nextStep}
            onPrev={prevStep}
            authToken={authToken}
          />
        );
      case 4:
        return (
          <PublishStep
            data={courseData}
            onUpdate={updateCourseData}
            onPrev={prevStep}
            authToken={authToken}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black border-b sticky top-0 z-40">
        <div className="container mx-auto relative flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={LOGO_URL}
              alt="Company Logo"
              className="h-20 w-auto"
            />
            <h1 className="text-2xl font-bold text-white absolute left-1/2 transform -translate-x-1/2">
              Create New Course
            </h1>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:text-gray-200 hover:bg-gray-800"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Steps Indicator */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors cursor-pointer",
                      currentStep === step.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                    )}
                    onClick={() => goToStep(step.id)}
                  >
                    {step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4 transition-colors",
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">{renderStep()}</div>
      </div>
    </div>
  );
};

export default CourseCreationWizard;