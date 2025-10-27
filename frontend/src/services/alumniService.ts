const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export const alumniService = {
  getAlumni: async (
    params: { search?: string; graduationYear?: string },
    token?: string | null
  ) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.graduationYear)
      query.append("graduationYear", params.graduationYear);

    const response = await fetch(`${API_URL}/api/alumni?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal memuat data alumni");
    }

    return response.json();
  },

  updateAlumni: async (
    id: number,
    data: {
      status?: string;
      workplace?: string;
      business?: string;
      university?: string;
    },
    token: string
  ) => {
    if (!token) throw new Error("Token is required");

    const response = await fetch(`${API_URL}/api/alumni/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal memperbarui data alumni");
    }

    return response.json();
  },
};
