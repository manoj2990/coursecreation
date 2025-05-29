
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Save,
  Edit,
  Loader2,
  ChevronDown,
  ChevronRight,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Topic {
  id?: string;
  title: string;
  description: string;
  subtopics: Subtopic[];
}

interface Subtopic {
  id?: string;
  title: string;
  description: string;
  contentType?: "text" | "video" | "file" | "link";
  textContent?: string;
  image?: File | null | string;
  videoName?: string;
  video?: File | null;
  videoUrl?: string;
  filenames?: { name: string; file?: File }[];
  links?: { title: string; url: string }[];
}

interface ContentStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
   authToken: string;
}

// Subtopic Form Component
const SubtopicForm = ({
  topicIndex,
  subtopic,
  isEdit = false,
  onSave,
  onCancel,
  isSaving,
}: {
  topicIndex: number;
  subtopic?: Subtopic;
  isEdit?: boolean;
  onSave: (topicIndex: number, subtopicData: Subtopic) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const [formData, setFormData] = useState<Subtopic>(() => {
    // Initialize formData with existing subtopic data when editing, or default values
    if (isEdit && subtopic) {
      return {
        id: subtopic.id,
        title: subtopic.title || "",
        description: subtopic.description || "",
        contentType: subtopic.contentType || "text",
        textContent: subtopic.textContent || "",
        image: subtopic.image || null,
        videoName: subtopic.videoName || "",
        video: subtopic.video || null,
        videoUrl: subtopic.videoUrl || "",
        filenames: subtopic.filenames || [],
        links: subtopic.links || [],
      };
    }
    return {
      title: "",
      description: "",
      contentType: "text",
      textContent: "",
      image: null,
      videoName: "",
      video: null,
      videoUrl: "",
      filenames: [],
      links: [],
    };
  });
  const [error, setError] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  // Clear fields of other content types when contentType changes
  useEffect(() => {
    setFormData((prev) => {
      const base = { ...prev };
      if (prev.contentType === "text") {
        base.textContent = "";
        base.image = null;
      } else if (prev.contentType === "video") {
        base.videoName = "";
        base.video = null;
        base.videoUrl = "";
      } else if (prev.contentType === "file") {
        base.filenames = [];
      } else if (prev.contentType === "link") {
        base.links = [];
      }
      return base;
    });
  }, [formData.contentType]);

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFormData((prev) => ({ ...prev, textContent: text }));
      };
      reader.readAsText(file);
    } else {
      setError("Please upload a valid .txt file");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }));
    } else {
      setError("Please upload a valid image file");
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setFormData((prev) => ({ ...prev, video: file, videoUrl: "" }));
    } else {
      setError("Please upload a valid video file");
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, videoUrl: e.target.value, video: null }));
  };

  const addFile = () => {
    if (!newFileName.trim() || !newFile) return;
    setFormData((prev) => ({
      ...prev,
      filenames: [...(prev.filenames || []), { name: newFileName, file: newFile }],
    }));
    setNewFileName("");
    setNewFile(null);
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      filenames: prev.filenames?.filter((_, i) => i !== index),
    }));
  };

  const addLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    setFormData((prev) => ({
      ...prev,
      links: [...(prev.links || []), newLink],
    }));
    setNewLink({ title: "", url: "" });
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }
    if (formData.contentType === "text" && !formData.textContent?.trim()) {
      setError("Text content is required for Text type");
      return;
    }
    if (
      formData.contentType === "video" &&
      (!formData.videoName?.trim() || (!formData.video && !formData.videoUrl?.trim()))
    ) {
      setError("Video name and either a video file or URL are required for Video type");
      return;
    }
    if (formData.contentType === "file" && formData.filenames?.length === 0) {
      setError("At least one file is required for File type");
      return;
    }
    if (formData.contentType === "link" && formData.links?.length === 0) {
      setError("At least one link is required for Link type");
      return;
    }

    setError(null);
    onSave(topicIndex, formData);
  };

  return (
    <div className="space-y-4 mb-4 p-4 border border-dashed rounded">
      <h5 className="font-medium">
        {isEdit ? `Edit Subtopic: ${subtopic?.title}` : "New Subtopic"}
      </h5>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`subtopic-title-${topicIndex}`}>Subtopic Title *</Label>
          <Input
            id={`subtopic-title-${topicIndex}`}
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g., React Hooks"
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`subtopic-description-${topicIndex}`}>
            Description *
          </Label>
          <Input
            id={`subtopic-description-${topicIndex}`}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Brief description of the subtopic"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Content Type Tabs */}
      <Tabs
        value={formData.contentType}
        onValueChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            contentType: value as "text" | "video" | "file" | "link",
          }))
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="file">Files</TabsTrigger>
          <TabsTrigger value="link">Links</TabsTrigger>
        </TabsList>

        {/* Text Content */}
        <TabsContent value="text" className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor={`subtopic-textContent-${topicIndex}`}>
              Text Content *
            </Label>
            <Input
              id={`subtopic-textContent-${topicIndex}`}
              value={formData.textContent || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, textContent: e.target.value }))
              }
              placeholder="Enter text content"
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`subtopic-textFile-${topicIndex}`}>
              Upload Text File (.txt)
            </Label>
            <Input
              id={`subtopic-textFile-${topicIndex}`}
              type="file"
              accept=".txt"
              onChange={handleTextFileUpload}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`subtopic-image-${topicIndex}`}>
              Upload Image
            </Label>
            <Input
              id={`subtopic-image-${topicIndex}`}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isSaving}
            />
            {formData.image && (
              <p className="text-sm text-gray-500">
                Selected image: {typeof formData.image === "string" ? formData.image : formData.image.name}
              </p>
            )}
          </div>
        </TabsContent>

        {/* Video Content */}
        <TabsContent value="video" className="space-y-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`subtopic-videoName-${topicIndex}`}>
                Video Name *
              </Label>
              <Input
                id={`subtopic-videoName-${topicIndex}`}
                value={formData.videoName || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    videoName: e.target.value,
                  }))
                }
                placeholder="e.g., n8 basic"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`subtopic-videoUrl-${topicIndex}`}>
                Video URL (or upload below)
              </Label>
              <Input
                id={`subtopic-videoUrl-${topicIndex}`}
                value={formData.videoUrl || ""}
                onChange={handleVideoUrlChange}
                placeholder="e.g., https://www.youtube.com/watch?v=..."
                disabled={isSaving || !!formData.video}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`subtopic-videoFile-${topicIndex}`}>
              Upload Video (or provide URL above)
            </Label>
            <Input
              id={`subtopic-videoFile-${topicIndex}`}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={isSaving || !!formData.videoUrl}
            />
            {formData.video && (
              <p className="text-sm text-gray-500">
                Selected video: {formData.video.name}
              </p>
            )}
          </div>
        </TabsContent>

        {/* Files Content */}
        <TabsContent value="file" className="space-y-2">
          <div className="space-y-2">
            <Label>Add File</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="File Name"
                disabled={isSaving}
              />
              <Input
                type="file"
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                disabled={isSaving}
              />
            </div>
            <Button onClick={addFile} disabled={isSaving}>
              Add File
            </Button>
            {formData.filenames?.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-100 rounded"
              >
                <span>
                  {file.name}: {file.file?.name || "Existing file"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isSaving}
                  className="text-red-600"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Links Content */}
        <TabsContent value="link" className="space-y-2">
          <div className="space-y-2">
            <Label>Add Link</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                value={newLink.title}
                onChange={(e) =>
                  setNewLink((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Link Title"
                disabled={isSaving}
              />
              <Input
                value={newLink.url}
                onChange={(e) =>
                  setNewLink((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="Link URL"
                disabled={isSaving}
              />
            </div>
            <Button onClick={addLink} disabled={isSaving}>
              Add Link
            </Button>
            {formData.links?.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-100 rounded"
              >
                <span>
                  {link.title}: {link.url}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLink(index)}
                  disabled={isSaving}
                  className="text-red-600"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Saving..." : "Creating Subtopic..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Save Changes" : "Create Subtopic"}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

const ContentStep = ({ data, onUpdate, onNext, onPrev,authToken }: ContentStepProps) => {
  const [topics, setTopics] = useState<Topic[]>(data.topics || []);
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [savingTopic, setSavingTopic] = useState<string | null>(null);
  const [savingSubtopic, setSavingSubtopic] = useState<string | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    isCreating: false,
  });
  const [error, setError] = useState<string | null>(null);
  // const [authToken] = useState(
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODIwNzllZmE2NzgyMzlmNjA1NzRjNTMiLCJlbWFpbCI6ImFkbWluTmVsc19CYXVtYmFjaDg2QGV4YW1wbGUuY29tIiwiYWNjb3VudFR5cGUiOiJhZG1pbiIsImlhdCI6MTc0ODM0NTEwMCwiZXhwIjoxNzQ4OTQ5OTAwfQ.p4mO3YDtBeWC677MGTX_KppJP8O9Jan_cj0imI5f9sY"
  // );

  // Update parent data when topics change
  useEffect(() => {
    onUpdate({ ...data, topics });
  }, [topics]);

  // Create Topic API Handler
  const createTopic = async (topicData: any) => {
    try {
      console.log("Creating topic:", topicData);
      const response = await fetch("https://workculture.onrender.com/api/v1/courses/create-Topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          courseId: data.id,
          title: topicData.title,
          description: topicData.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("topic result--->", result);
        console.log("result.data--->", result.data);
        return {
          success: true,
          data: {
            id: result.data.id,
            title: result.data.title,
            description: result.data.description,
            courseId: result.data.courseId,
            subtopics: [],
          },
        };
      } else {
        throw new Error(`Failed to create topic: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("Create topic error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update Topic API Handler
  const updateTopic = async (topicData: any) => {
    try {
      console.log("Updating topic:", topicData);
      const response = await fetch("https://workculture.onrender.com/api/v1/courses/update-topic", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: topicData.title,
          description: topicData.description,
          topicId: topicData.id,
          courseId: data.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: topicData };
      } else {
        throw new Error(`Failed to update topic: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("Update topic error:", error);
      return { success: false, error: error.message };
    }
  };

  // Create Subtopic API Handler
  const createSubtopic = async (subtopicData: any, topicId: string) => {
    try {
      console.log("Creating subtopic:", subtopicData);
      const formData = new FormData();
      formData.append("courseId", data.id);
      formData.append("topicId", topicId);
      formData.append("title", subtopicData.title);
      formData.append("description", subtopicData.description);
      formData.append("contentType", subtopicData.contentType);

      if (subtopicData.contentType === "text") {
        formData.append("text_content", subtopicData.textContent || "");
        if (subtopicData.image && typeof subtopicData.image !== "string") {
          formData.append("image", subtopicData.image);
        }
      } else if (subtopicData.contentType === "video") {
        formData.append("videoName", subtopicData.videoName || "");
        if (subtopicData.video) {
          formData.append("video", subtopicData.video);
        } else if (subtopicData.videoUrl) {
          formData.append("videoUrl", subtopicData.videoUrl);
        }
      } else if (subtopicData.contentType === "file") {
        formData.append(
          "filenames",
          JSON.stringify(
            subtopicData.filenames?.map((f: any) => ({ name: f.name })) || []
          )
        );
        subtopicData.filenames?.forEach((f: any, index: number) => {
          if (f.file) {
            formData.append(`files`, f.file);
          }
        });
      } else if (subtopicData.contentType === "link") {
        formData.append("links", JSON.stringify(subtopicData.links || []));
      }

      const response = await fetch("https://workculture.onrender.com/api/v1/courses/create-subtopic", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("subtopic result--->", result);
        console.log("result.data--->", result.data);
        const lastItem = result.data.subtopics[result.data.subtopics.length - 1];
        console.log("lastItem---->", lastItem);
        return {
          success: true,
          data: {
            id: lastItem._id,
            title: lastItem.title,
            description: lastItem.description,
            contentType: lastItem.contentType,
            textContent: lastItem?.text_content,
            image: lastItem.imageUrl?.url,
            videoName: lastItem?.video?.name || "dummy",
            video: null,
            videoUrl: lastItem?.video?.url,
            filenames: lastItem?.files,
            links: lastItem.links,
          },
        };
      } else {
        throw new Error(`Failed to create subtopic: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("Create subtopic error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update Subtopic API Handler
  const updateSubtopic = async (subtopicData: any, topicId: string) => {
    try {
      console.log("Updating subtopic:", subtopicData);
      const formData = new FormData();
      formData.append("courseId", data.id);
      formData.append("topicId", topicId);
      formData.append("subtopicId", subtopicData.id);
      formData.append("title", subtopicData.title);
      formData.append("description", subtopicData.description);
      formData.append("contentType", subtopicData.contentType);

      if (subtopicData.contentType === "text") {
        formData.append("text_content", subtopicData.textContent || "");
        if (subtopicData.image && typeof subtopicData.image !== "string") {
          formData.append("image", subtopicData.image);
        }
      } else if (subtopicData.contentType === "video") {
        formData.append("videoName", subtopicData.videoName || "");
        if (subtopicData.video) {
          formData.append("video", subtopicData.video);
          // formData.append("videoUrl", ""); // Clear videoUrl if a new video is uploaded
        } else if (subtopicData.videoUrl) {
          formData.append("videoUrl", subtopicData.videoUrl);
        }
      } else if (subtopicData.contentType === "file") {
        formData.append(
          "filenames",
          JSON.stringify(
            subtopicData.filenames?.map((f: any) => ({ name: f.name })) || []
          )
        );
        subtopicData.filenames?.forEach((f: any, index: number) => {
          if (f.file) {
            formData.append(`files`, f.file);
          }
        });
      } else if (subtopicData.contentType === "link") {
        formData.append("links", JSON.stringify(subtopicData.links || []));
      }

      const response = await fetch("https://workculture.onrender.com/api/v1/courses/update-subtopic", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("update subtopic result--->", result);
        console.log("result.data-->",result.data)
         console.log("updatedSubtopic-->",result.data.subtopic)
         const updatedSubtopic = result.data.subtopic;
        return {
          success: true,
          data: {
            id: subtopicData.id || updatedSubtopic._id ,
            title: subtopicData.title || updatedSubtopic.title,
            description: subtopicData.description || updatedSubtopic.description,
            contentType: subtopicData.contentType || updatedSubtopic.contentType,
            textContent: subtopicData.textContent || updatedSubtopic.text_content,
            image: updatedSubtopic?.imageUrl?.url || subtopicData?.image,
            videoName: subtopicData.videoName || updatedSubtopic?.video?.name,
            video:  updatedSubtopic?.video?.url,
            videoUrl: updatedSubtopic?.video?.url || subtopicData.videoUrl ,
            filenames: subtopicData.filenames ,
            links: subtopicData.links,
          },
        };
      } else {
        throw new Error(`Failed to update subtopic: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("Update subtopic error:", error);
      return { success: false, error: error.message };
    }
  };

  // Handle new topic creation
  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.description.trim()) {
      setError("Title and description are required");
      return;
    }

    setNewTopic((prev) => ({ ...prev, isCreating: true }));
    setError(null);

    const result = await createTopic(newTopic);
    console.log("create topic result--->", result);
    if (result.success) {
      setTopics((prev) => [...prev, result.data]);
      setNewTopic({ title: "", description: "", isCreating: false });
      console.log("total topics--->", topics);
      setError(null);
    } else {
      setError(`Failed to create topic: ${result.error}`);
      setNewTopic((prev) => ({ ...prev, isCreating: false }));
    }
  };

  // Handle topic edit save
  const handleSaveTopicEdit = async (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic?.title.trim() || !topic?.description.trim()) {
      setError("Title and description are required");
      return;
    }

    setSavingTopic(topicId);
    setError(null);

    const result = await updateTopic(topic);

    if (result.success) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId ? { ...t, title: topic.title, description: topic.description } : t
        )
      );
      setEditingTopic(null);
      setError(null);
    } else {
      setError(`Failed to update topic: ${result.error}`);
    }

    setSavingTopic(null);
  };

  // Handle topic field changes
  const handleTopicChange = (topicId: string, field: string, value: string) => {
    setTopics((prev) =>
      prev.map((topic) => (topic.id === topicId ? { ...topic, [field]: value } : topic))
    );
  };

  // Handle edit mode toggle
  const handleEditTopic = (topicId: string) => {
    setEditingTopic(topicId);
    setError(null);
  };

  // Handle cancel edit
  const handleCancelEdit = (topicId: string) => {
    setEditingTopic(null);
    setError(null);
  };

  // Handle new subtopic creation
  const handleCreateSubtopic = async (topicIndex: number, subtopicData: Subtopic) => {
    const topic = topics[topicIndex];
    if (!topic?.id) {
      setError("Topic must be saved before adding subtopics");
      return;
    }

    setSavingSubtopic(`new-${topicIndex}`);
    setError(null);

    const result = await createSubtopic(subtopicData, topic.id);
    console.log("create subtopic result--->", result);
    if (result.success) {
      setTopics((prev) =>
        prev.map((t, index) =>
          index === topicIndex ? { ...t, subtopics: [...t.subtopics, result.data] } : t
        )
      );
      setIsCreatingSubtopic(false);
      setError(null);
    } else {
      setError(`Failed to create subtopic: ${result.error}`);
    }

    setSavingSubtopic(null);
  };

  // Handle subtopic edit save
  const handleSaveSubtopicEdit = async (topicIndex: number, subtopicData: Subtopic) => {
    const topic = topics[topicIndex];
    if (!topic?.id || !subtopicData.id) {
      setError("Invalid topic or subtopic");
      return;
    }

    setSavingSubtopic(subtopicData.id);
    setError(null);

    const result = await updateSubtopic(subtopicData, topic.id);

    if (result.success) {
      setTopics((prev) =>
        prev.map((t, index) =>
          index === topicIndex
            ? {
                ...t,
                subtopics: t.subtopics.map((s) =>
                  s.id === subtopicData.id ? { ...s, ...result.data } : s
                ),
              }
            : t
        )
      );
      setEditingSubtopic(null);
      setError(null);
    } else {
      setError(`Failed to update subtopic: ${result.error}`);
    }

    setSavingSubtopic(null);
  };

  // Toggle topic expansion
  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
        if (selectedTopicIndex !== null && topics[selectedTopicIndex]?.id === topicId) {
          setSelectedTopicIndex(null);
          setIsCreatingSubtopic(false);
          setEditingSubtopic(null);
        }
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  // Select topic for subtopic management
  const handleSelectTopic = (index: number) => {
    setSelectedTopicIndex(index);
    setIsCreatingSubtopic(false);
    setEditingSubtopic(null);
    setError(null);
  };

  // Delete topic
  const handleDeleteTopic = (topicId: string) => {
    if (confirm("Are you sure you want to delete this topic and its subtopics?")) {
      setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
      if (selectedTopicIndex !== null && topics[selectedTopicIndex]?.id === topicId) {
        setSelectedTopicIndex(null);
        setIsCreatingSubtopic(false);
        setEditingSubtopic(null);
      }
      setError(null);
    }
  };

  // Delete subtopic
  const handleDeleteSubtopic = (topicIndex: number, subtopicId: string) => {
    if (confirm("Are you sure you want to delete this subtopic?")) {
      setTopics((prev) =>
        prev.map((topic, index) =>
          index === topicIndex
            ? { ...topic, subtopics: topic.subtopics.filter((sub) => sub.id !== subtopicId) }
            : topic
        )
      );
      if (editingSubtopic?.id === subtopicId) {
        setEditingSubtopic(null);
      }
      setError(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Content Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Create topics and subtopics to organize your course content.
          </p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* New Topic Creation Form */}
          <Card className="mb-6 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Add New Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-topic-title">Topic Title *</Label>
                  <Input
                    id="new-topic-title"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Introduction to React"
                    disabled={newTopic.isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-topic-description">Description *</Label>
                  <Input
                    id="new-topic-description"
                    value={newTopic.description}
                    onChange={(e) =>
                      setNewTopic((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of the topic"
                    disabled={newTopic.isCreating}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateTopic}
                disabled={newTopic.isCreating}
                className="w-full md:w-auto"
              >
                {newTopic.isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Topic...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Topic
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Topics List */}
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <Card key={topic.id || index} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleTopicExpansion(topic.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedTopics.has(topic.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold">
                          Topic {index + 1}: {topic.title}
                        </h3>
                        <Badge variant="outline">{topic.subtopics?.length || 0} subtopics</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingTopic === topic.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelEdit(topic.id)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveTopicEdit(topic.id)}
                            disabled={savingTopic === topic.id}
                          >
                            {savingTopic === topic.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTopic(topic.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Topic
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectTopic(index)}
                            disabled={selectedTopicIndex === index}
                          >
                            Manage Subtopics
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedTopics.has(topic.id) && (
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Topic Title *</Label>
                        <Input
                          value={topic.title}
                          onChange={(e) => handleTopicChange(topic.id, "title", e.target.value)}
                          disabled={editingTopic !== topic.id}
                          className={editingTopic !== topic.id ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Input
                          value={topic.description}
                          onChange={(e) =>
                            handleTopicChange(topic.id, "description", e.target.value)
                          }
                          disabled={editingTopic !== topic.id}
                          className={editingTopic !== topic.id ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                      </div>
                    </div>

                    {/* Subtopics Section */}
                    {selectedTopicIndex === index && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTopicIndex(null);
                                setIsCreatingSubtopic(false);
                                setEditingSubtopic(null);
                              }}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Back to Topics
                            </Button>
                            <h4 className="font-medium text-gray-700">
                              Subtopics for: {topic.title}
                            </h4>
                          </div>
                          <Button
                            onClick={() => setIsCreatingSubtopic(true)}
                            disabled={isCreatingSubtopic || editingSubtopic !== null || !topic.id}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subtopic
                          </Button>
                        </div>

                        {isCreatingSubtopic && (
                          <SubtopicForm
                            topicIndex={index}
                            onSave={handleCreateSubtopic}
                            onCancel={() => setIsCreatingSubtopic(false)}
                            isSaving={savingSubtopic === `new-${index}`}
                          />
                        )}

                        {editingSubtopic && (
                          <SubtopicForm
                            topicIndex={index}
                            subtopic={editingSubtopic}
                            isEdit={true}
                            onSave={handleSaveSubtopicEdit}
                            onCancel={() => setEditingSubtopic(null)}
                            isSaving={savingSubtopic === editingSubtopic.id}
                          />
                        )}

                        <div className="space-y-2">
                          {topic.subtopics.length === 0 ? (
                            <p className="text-sm text-gray-500">No subtopics created yet.</p>
                          ) : (
                            topic.subtopics.map((subtopic, subIndex) => (
                              <div
                                key={subtopic.id || subIndex}
                                className="flex items-center justify-between p-2 bg-white rounded shadow-sm"
                              >
                                <div>
                                  <p className="font-medium">
                                    Subtopic {subIndex + 1}: {subtopic.title}
                                  </p>
                                  <p className="text-sm text-gray-600">{subtopic.description}</p>
                                  {subtopic.contentType === "text" && subtopic.textContent && (
                                    <p className="text-sm text-gray-500">
                                      Content: {subtopic.textContent}
                                    </p>
                                  )}
                                  {subtopic.contentType === "text" && subtopic.image && (
                                    <p className="text-sm text-gray-500">
                                      Image: {typeof subtopic.image === "string" ? subtopic.image : subtopic.image.name}
                                    </p>
                                  )}
                                  {subtopic.contentType === "video" && (
                                    <>
                                      {subtopic.videoName && (
                                        <p className="text-sm text-gray-500">
                                          Video Name: {subtopic.videoName}
                                        </p>
                                      )}
                                      {subtopic.videoUrl && (
                                        <p className="text-sm text-gray-500">
                                          Video URL: {subtopic.videoUrl}
                                        </p>
                                      )}
                                    </>
                                  )}
                                  {subtopic.contentType === "file" && subtopic.filenames?.length > 0 && (
                                    <p className="text-sm text-gray-500">
                                      Files: {subtopic.filenames.map((file) => file.name).join(", ")}
                                    </p>
                                  )}
                                  {subtopic.contentType === "link" && subtopic.links?.length > 0 && (
                                    <p className="text-sm text-gray-500">
                                      Links:{" "}
                                      {subtopic.links
                                        .map((link) => `${link.title} (${link.url})`)
                                        .join(", ")}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingSubtopic(subtopic)}
                                    disabled={savingSubtopic === subtopic.id || isCreatingSubtopic}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteSubtopic(index, subtopic.id)}
                                    className="text-red-600 hover:text-red-700"
                                    disabled={savingSubtopic === subtopic.id || isCreatingSubtopic}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {topics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No topics created yet. Create your first topic above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Previous: Basic Info
        </Button>
        <Button onClick={onNext} disabled={topics.length === 0}>
          Continue to Assessments
        </Button>
      </div>
    </div>
  );
};

export default ContentStep;