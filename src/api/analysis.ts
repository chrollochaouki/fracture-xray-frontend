import { Analysis, ApiResponse, User, Report, EnrichedReport } from '../types';

const API_URL = 'http://localhost:3000/api';

// Generic request handler
const handleRequest = async (request: Promise<Response>): Promise<ApiResponse<any>> => {
  try {
    const response = await request;
    const data = await response.json();
    if (!response.ok) {
      return { data: null, error: data.error || `HTTP error! status: ${response.status}`, status: response.status };
    }
    return { data, error: null, status: response.status };
  } catch (error: any) {
    return { data: null, error: error.message || 'An unexpected network error occurred', status: 500 };
  }
};

// Get all patients for the logged-in doctor
export const getPatients = async (token: string): Promise<ApiResponse<User[]>> => {
  try {
    const response = await fetch('http://localhost:3000/api/patients', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to fetch patients', status: response.status };
    }
    const data = await response.json();
    return { data, error: null, status: 200 };
  } catch (error) {
    return { data: null, error: 'An unexpected error occurred', status: 500 };
  }
};

export const getReports = async (token: string): Promise<ApiResponse<EnrichedReport[]>> => {
  try {
    const response = await fetch('http://localhost:3000/api/reports', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to fetch reports', status: response.status };
    }
    const data = await response.json();
    return { data, error: null, status: 200 };
  } catch (error) {
    return { data: null, error: 'An unexpected error occurred', status: 500 };
  }
};

export const getReportById = async (reportId: string, token: string): Promise<ApiResponse<Report>> => {
  try {
    const response = await fetch(`http://localhost:3000/api/reports/${reportId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to fetch report', status: response.status };
    }
    const data = await response.json();
    return { data, error: null, status: 200 };
  } catch (error) {
    return { data: null, error: 'An unexpected error occurred', status: 500 };
  }
};

export const deleteReport = async (reportId: string, token: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`http://localhost:3000/api/reports/${reportId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to delete report', status: response.status };
    }
    return { data: null, error: null, status: 204 };
  } catch (error) {
    return { data: null, error: 'An unexpected error occurred', status: 500 };
  }
};

// Create a new report by uploading an image and patient data
export const createReport = async (formData: FormData, token: string): Promise<ApiResponse<{ analysis: Analysis; report: Report }>> => {
  try {
    const response = await fetch('http://localhost:3000/api/reports/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      return { data: null, error: data.error || 'Failed to create report', status: response.status };
    }
    return { data, error: null, status: response.status };
  } catch (error) {
    return { data: null, error: 'An unexpected error occurred during report creation', status: 500 };
  }
};

export const getMyReports = async (patientId: string, token: string) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId: patientId }),
    };
    return await handleRequest(fetch(`${API_URL}/reports/my-reports`, requestOptions));
};