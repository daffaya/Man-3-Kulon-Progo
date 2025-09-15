import React from "react";
import Layout from "../../components/layout/Layout";

const KepalaMadrasahPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12">
          <img src="/kepalamadrasah.jpg" alt="Tabel Kepala Madrasah" />
        </section>
      </div>
    </Layout>
  );
};

export default KepalaMadrasahPage;
