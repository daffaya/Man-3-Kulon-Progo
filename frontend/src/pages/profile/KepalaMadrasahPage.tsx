/**
 * @fileoverview KepalaMadrasahPage component for displaying information about the head of the madrasah.
 * This page renders a specific image, likely a table or chart, related to the madrasah leadership.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

/**
 * Component that renders the "Kepala Madrasah" page.
 * This page is primarily used to display a static image containing information about the head of the madrasah.
 */
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
