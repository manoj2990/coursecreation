
export const saveTopic = async (topicData: any, courseId: string, isEdit = false) => {
  try {
    console.log('Saving topic:', topicData);
    
    const endpoint = isEdit
      ? "https://workculture.onrender.com/api/v1/courses/update-topic"
      : "https://workculture.onrender.com/api/v1/courses/create-Topic";
    
    const method = isEdit ? "PUT" : "POST";
    const payload = isEdit 
      ? {
          title: topicData.title,
          description: topicData.description,
          topicId: topicData.id,
          courseId: courseId
        }
      : {
          courseId: courseId,
          title: topicData.title,
          description: topicData.description
        };

    const response = await fetch(endpoint, {
      method,
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      alert(`Topic ${isEdit ? 'updated' : 'created'} successfully!`);
      return { ...topicData, id: result.topicId || topicData.id };
    } else {
      throw new Error("Failed to save topic");
    }
  } catch (error) {
    console.error('Save topic error:', error);
    alert(`Failed to save topic: ${error.message}`);
    return null;
  }
};

export const saveSubtopic = async (subtopicData: any, topicId: string, courseId: string, isEdit = false) => {
  try {
    console.log('Saving subtopic:', subtopicData, 'for topic:', topicId);
    
    const endpoint = isEdit
      ? "https://workculture.onrender.com/api/v1/courses/update-subtopic"
      : "https://workculture.onrender.com/api/v1/courses/create-subtopic";
    
    const method = isEdit ? "PUT" : "POST";
    
    const formData = new FormData();
    formData.append("title", subtopicData.title);
    formData.append("description", subtopicData.description);
    formData.append("textContent", subtopicData.textContent);
    formData.append("topicId", topicId);
    formData.append("courseId", courseId);
    
    if (isEdit && subtopicData.id) {
      formData.append("subtopicId", subtopicData.id);
    }

    const response = await fetch(endpoint, {
      method,
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      alert(`Subtopic ${isEdit ? 'updated' : 'created'} successfully!`);
      return { ...subtopicData, id: result.subtopicId || subtopicData.id };
    } else {
      throw new Error("Failed to save subtopic");
    }
  } catch (error) {
    console.error('Save subtopic error:', error);
    alert(`Failed to save subtopic: ${error.message}`);
    return null;
  }
};
