/**
 * @fileoverview PtspPage component for displaying all available PTSP services.
 * This page fetches a static list of services from a JSON file, groups them by category,
 * and displays them in a clean, organized grid layout. Each service is rendered as a ServiceCard.
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import ServiceCard from "../../components/ptsp/PtspServiceCard";
import ptspServices from "../../data/ptstpService.json"; // Import the static data
import { PtspService } from "../../types/ptspTypes";

/**
 * The main PTSP page component.
 * It organizes and displays all PTSP services, grouped by their respective categories.
 */
const PtspPage: React.FC = () => {
  /**
   * Groups the flat list of services by their category.
   * @param {PtspService[]} services - The flat list of services.
   * @returns {Record<string, PtspService[]>} An object where keys are category names and values are arrays of services.
   */
  const groupServicesByCategory = (
    services: PtspService[]
  ): Record<string, PtspService[]> => {
    return services.reduce((acc, service) => {
      // If the category is not yet a key in the accumulator, create it with an empty array.
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      // Push the current service into the correct category array.
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, PtspService[]>);
  };

  const groupedServices = groupServicesByCategory(ptspServices);

  return (
    <Layout>
      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
            Pelayanan Terpadu Satu Pintu (PTSP) Online
          </h1>
          <p className="text-lg text-secondary max-w-3xl mx-auto">
            Selamat datang di layanan digital kami. Silakan pilih jenis layanan
            yang Anda butuhkan. Kami berkomitmen untuk memberikan pelayanan yang
            cepat, mudah, dan transparan.
          </p>
        </div>

        {/* Services Grid by Category */}
        {Object.entries(groupedServices).map(([category, services]) => (
          <section key={category} className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground border-b border-[rgb(var(--color-border))] pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </Layout>
  );
};

export default PtspPage;
