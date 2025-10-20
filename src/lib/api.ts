import { API_CONFIG } from '@/config/api';

const getApiUrl = (path: string) => {
  if (API_CONFIG.quiz.startsWith('http')) {
    return `${API_CONFIG.quiz}${path}`;
  }
  return `${API_CONFIG.quiz}${path}`;
};

export const quizApi = {
  async getTemplate() {
    try {
      const response = await fetch(getApiUrl('/template'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  },

  async saveTemplate(template: any) {
    try {
      const response = await fetch(getApiUrl('/template'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save template');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  },

  async updateTemplate(template: any) {
    try {
      const response = await fetch(getApiUrl('/template'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  async submitResponse(data: any) {
    try {
      const response = await fetch(getApiUrl('/response'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit response');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  },

  async getResponses() {
    try {
      const response = await fetch(getApiUrl('/admin/responses'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch responses');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching responses:', error);
      throw error;
    }
  },
};