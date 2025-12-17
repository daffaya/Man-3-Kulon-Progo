import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaff } from "../../../contexts/staffContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import StaffForm from "../../../components/forms/staffForm";
import { StaffFormData } from "../../../types/staffTypes";
import { staffApi } from "../../../api/staffApi";

const NewStaffPage: React.FC = () => {
  const { createStaff } = useStaff();
  const { showSuccessToast, showErrorToast } = useToastMessage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: StaffFormData) => {
    setIsLoading(true);
    try {
      await createStaff(formData);
      showSuccessToast("Data berhasil ditambahkan");
      navigate("/atmin/staff");
    } catch (error) {
      showErrorToast("Gagal menambahkan data");
      console.error("Error creating staff:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const testRoute = async () => {
    try {
      const result = await staffApi.testStaffRoute();
      alert("Test route berhasil: " + JSON.stringify(result));
    } catch (error) {
      if (error instanceof Error) {
        alert("Test route gagal: " + error.message);
      } else {
        alert("Test route gagal");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-8 text-foreground">
            Tambah Guru & Staf
          </h1>
          <div className="card p-6">
            <StaffForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
        <button
          type="button"
          onClick={testRoute}
          className="btn btn-secondary mb-4"
        >
          Test Route
        </button>
      </div>
    </AdminLayout>
  );
};

export default NewStaffPage;
