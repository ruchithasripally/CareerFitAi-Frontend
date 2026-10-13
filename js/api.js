/**
 * CareerFit AI - REST API Client Module
 * Communicates with backend Spring Boot service via fetch().
 */

const CareerFitApi = (function () {

  /**
   * Helper to format human-readable error messages from HTTP response.
   */
  async function parseErrorResponse(response) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      // Non-JSON response
    }

    if (errorData && errorData.message) {
      return errorData.message;
    }

    switch (response.status) {
      case 400:
        return 'Invalid request or unsupported document file.';
      case 404:
        return 'Resume analysis not found.';
      case 413:
        return 'Uploaded document exceeds the 5 MB size limit.';
      case 415:
        return 'Unsupported file media type. Please upload a PDF or DOCX resume.';
      case 422:
        return 'The document could not be processed. Please check if it contains readable text.';
      case 500:
        return 'Internal server error occurred while processing the resume.';
      case 503:
        return 'Backend service is temporarily unavailable. Please verify backend status.';
      default:
        return `Request failed with status code ${response.status}.`;
    }
  }

  /**
   * Uploads resume file to POST /api/v1/resumes/analyze.
   */
  async function uploadResume(file) {
    const baseUrl = CareerFitConfig.getApiBaseUrl();
    const endpoint = `${baseUrl}/api/v1/resumes/analyze`;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorMsg = await parseErrorResponse(response);
        throw new Error(errorMsg);
      }

      const json = await response.json();
      return json.data; // Returns ResumeResponseDto
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Unable to connect to backend service at ${baseUrl}. Please ensure the Spring Boot server is running and CORS is permitted.`);
      }
      throw error;
    }
  }

  /**
   * Retrieves saved resume analysis from GET /api/v1/resumes/{id}.
   */
  async function getResumeById(id) {
    const baseUrl = CareerFitConfig.getApiBaseUrl();
    const endpoint = `${baseUrl}/api/v1/resumes/${encodeURIComponent(id)}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorMsg = await parseErrorResponse(response);
        throw new Error(errorMsg);
      }

      const json = await response.json();
      return json.data; // Returns ResumeResponseDto
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Unable to connect to backend service at ${baseUrl}. Please check your connection or service status.`);
      }
      throw error;
    }
  }

  /**
   * Checks backend health via GET /api/v1/health.
   */
  async function checkHealth() {
    const baseUrl = CareerFitConfig.getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/api/v1/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  return {
    uploadResume,
    getResumeById,
    checkHealth
  };
})();

// Attach to window
window.CareerFitApi = CareerFitApi;
