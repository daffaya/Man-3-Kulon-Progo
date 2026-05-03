import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaff } from "../../../contexts/StaffContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import StaffForm from "../../../components/forms/StaffForm";
import { StaffFormData } from "../../../types/staffTypes";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Link
              to="/atmin/staff"
              className="text-sm text-secondary hover:text-accent flex items-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Kembali ke Manajemen Guru & Staf
            </Link>
          </div>
          <div className="card p-6">
            <h1 className="text-3xl font-serif font-bold mb-8 text-foreground">
              Tambah Guru & Staf
            </h1>
            <StaffForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewStaffPage;
