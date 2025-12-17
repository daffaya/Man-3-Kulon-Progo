import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStaff } from "../../../contexts/staffContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import StaffForm from "../../../components/forms/staffForm";
import { StaffFormData } from "../../../types/staffTypes";

const EditStaffPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, fetchStaffById, updateStaff } = useStaff();
  const { showSuccessToast, showErrorToast } = useToastMessage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStaffById(parseInt(id));
    }
  }, [id, fetchStaffById]);

  const handleSubmit = async (formData: StaffFormData) => {
    if (!id) return;

    setIsLoading(true);
    try {
      await updateStaff(parseInt(id), formData);
      showSuccessToast("Data berhasil diperbarui");
      navigate("/atmin/staff");
    } catch (error) {
      showErrorToast("Gagal memperbarui data");
      console.error("Error updating staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-8 text-foreground">
            Edit Guru & Staf
          </h1>
          <div className="card p-6">
            {state.currentStaff ? (
              <StaffForm
                staff={state.currentStaff}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary">Memuat data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditStaffPage;
