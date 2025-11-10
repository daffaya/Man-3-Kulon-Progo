interface StudentStatsResponse {
  totalStudents: number;
}

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
};

const studentApi = {
  getStudentStats: async (): Promise<StudentStatsResponse> => {
    const url = `${API_URL}/api/studentStats/students`;

    try {
      const response = await fetch(url);

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default studentApi;
