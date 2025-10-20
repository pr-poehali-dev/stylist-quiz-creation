import { API_CONFIG } from "@/config/api";

const USE_API = true;

const getApiUrl = (path: string) => {
  return `${API_CONFIG.quiz}?path=${path}`;
};

export const quizApi = {
  async getTemplate() {
    if (!USE_API) {
      const stored = localStorage.getItem("publicQuizTemplate");
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const response = await fetch(getApiUrl("/template"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Backend not available, using localStorage");
        const stored = localStorage.getItem("publicQuizTemplate");
        return stored ? JSON.parse(stored) : null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching template:", error);
      const stored = localStorage.getItem("publicQuizTemplate");
      return stored ? JSON.parse(stored) : null;
    }
  },

  async saveTemplate(template: any) {
    const mapped = {
      title: template.name || template.title || 'Новый тест',
      description: template.description || '',
      welcomeTitle: template.welcomeTitle || 'Добро пожаловать',
      welcomeSubtitle: template.welcomeSubtitle || 'Пройдите короткий тест',
      questions: template.questions || []
    };

    console.log('[API] Saving template:', mapped);
    console.log('[API] URL:', getApiUrl("/template"));

    if (!USE_API) {
      localStorage.setItem("publicQuizTemplate", JSON.stringify(mapped));
      return mapped;
    }

    try {
      const response = await fetch(getApiUrl("/template"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mapped),
      });

      console.log('[API] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Error response:', errorText);
        throw new Error("Failed to save template");
      }

      const result = await response.json();
      console.log('[API] Success result:', result);
      return result;
    } catch (error) {
      console.error("Error saving template, using localStorage:", error);
      localStorage.setItem("publicQuizTemplate", JSON.stringify(mapped));
      return mapped;
    }
  },

  async updateTemplate(template: any) {
    const mapped = {
      id: template.id,
      title: template.name || template.title || 'Новый тест',
      description: template.description || '',
      welcomeTitle: template.welcomeTitle || 'Добро пожаловать',
      welcomeSubtitle: template.welcomeSubtitle || 'Пройдите короткий тест',
      questions: template.questions || []
    };

    if (!USE_API) {
      localStorage.setItem("publicQuizTemplate", JSON.stringify(mapped));
      return mapped;
    }

    try {
      const response = await fetch(getApiUrl("/template"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mapped),
      });

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating template, using localStorage:", error);
      localStorage.setItem("publicQuizTemplate", JSON.stringify(mapped));
      return mapped;
    }
  },

  async submitResponse(data: any) {
    console.log('[API] Submitting response:', data);
    console.log('[API] URL:', getApiUrl("/response"));
    
    if (!USE_API) {
      const responses = JSON.parse(
        localStorage.getItem("quizResponses") || "[]",
      );
      const newResponse = {
        ...data,
        id: Date.now(),
        completed_at: new Date().toISOString(),
      };
      responses.push(newResponse);
      localStorage.setItem("quizResponses", JSON.stringify(responses));
      return { success: true };
    }

    try {
      const response = await fetch(getApiUrl("/response"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log('[API] Submit response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Submit error:', errorText);
        throw new Error("Failed to submit response");
      }

      const result = await response.json();
      console.log('[API] Submit success:', result);
      return result;
    } catch (error) {
      console.error("Error submitting response, using localStorage:", error);
      const responses = JSON.parse(
        localStorage.getItem("quizResponses") || "[]",
      );
      const newResponse = {
        ...data,
        id: Date.now(),
        completed_at: new Date().toISOString(),
      };
      responses.push(newResponse);
      localStorage.setItem("quizResponses", JSON.stringify(responses));
      return { success: true };
    }
  },

  async getResponses() {
    if (!USE_API) {
      return JSON.parse(localStorage.getItem("quizResponses") || "[]");
    }

    try {
      const response = await fetch(getApiUrl("/admin/responses"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch responses");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching responses, using localStorage:", error);
      return JSON.parse(localStorage.getItem("quizResponses") || "[]");
    }
  },

  async deleteTemplate(quizId?: string) {
    console.log('[API] Deleting template, id:', quizId);
    
    if (!USE_API) {
      localStorage.removeItem("publicQuizTemplate");
      return { success: true };
    }

    try {
      const response = await fetch(getApiUrl("/template"), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log('[API] Delete response status:', response.status);

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      localStorage.removeItem("publicQuizTemplate");
      return await response.json();
    } catch (error) {
      console.error("Error deleting template:", error);
      localStorage.removeItem("publicQuizTemplate");
      return { success: true };
    }
  },
};