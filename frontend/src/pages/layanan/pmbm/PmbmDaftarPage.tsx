import React from "react";
import Layout from "../../../components/layout/Layout";
import { PENDAFTARAN_DITUTUP, GELOMBANG_AKTIF } from "./pmbmConfig";
import PmbmTutupNotice from "./PmbmTutupNotice";
import G1Form from "./gelombang1/G1Form";
import G2Form from "./gelombang2/G2Form";

const PmbmDaftarPage: React.FC = () => {
  if (PENDAFTARAN_DITUTUP) return <PmbmTutupNotice />;

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground py-10 px-4">
        {GELOMBANG_AKTIF === 1 && <G1Form />}
        {GELOMBANG_AKTIF === 2 && <G2Form />}
      </div>
    </Layout>
  );
};

export default PmbmDaftarPage;
