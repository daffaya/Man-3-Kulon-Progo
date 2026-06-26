import React from "react";
import Layout from "../../../components/layout/Layout";
import { usePmbmConfig } from "./usePmbmConfig";
import PmbmTutupNotice from "./PmbmTutupNotice";
import G1Form from "./gelombang1/G1Form";
import G2Form from "./gelombang2/G2Form";

const PmbmDaftarPage: React.FC = () => {
  const { config, loading } = usePmbmConfig();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      </Layout>
    );
  }

  if (config.PENDAFTARAN_DITUTUP) {
    return <PmbmTutupNotice gelombangTerakhir={config.GELOMBANG_TAMPIL} />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground py-10 px-4">
        {config.GELOMBANG_AKTIF === 1 && <G1Form />}
        {config.GELOMBANG_AKTIF === 2 && <G2Form />}
      </div>
    </Layout>
  );
};

export default PmbmDaftarPage;
