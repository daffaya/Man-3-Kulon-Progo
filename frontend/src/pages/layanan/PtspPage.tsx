/**
 * @fileoverview PtspPage — migrated to CMS.
 * Fetches content from site_contents (page: ptsp, sections: header, services).
 * Services are grouped by category client-side, same as before.
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import ServiceCard from "../../components/ptsp/PtspServiceCard";
import { useCmsPage } from "../../hooks/useCmsPage";
import { PtspService } from "../../types/ptspTypes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PtspData {
  header: { title: string; description: string };
  services: { items: PtspService[] };
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK: PtspData = {
  header: {
    title: "Pelayanan Terpadu Satu Pintu (PTSP) Online",
    description:
      "Selamat datang di layanan digital kami. Silakan pilih jenis layanan yang Anda butuhkan. Kami berkomitmen untuk memberikan pelayanan yang cepat, mudah, dan transparan.",
  },
  services: { items: [] },
};

// ─────────────────────────────────────────────
// Helper — group services by category
// ─────────────────────────────────────────────

const groupByCategory = (
  services: PtspService[],
): Record<string, PtspService[]> =>
  services.reduce(
    (acc, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
    },
    {} as Record<string, PtspService[]>,
  );

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const PtspPage: React.FC = () => {
  const { data, loading } = useCmsPage<PtspData>("ptsp");

  const header = data?.header ?? FALLBACK.header;
  const services = data?.services?.items ?? FALLBACK.services.items;
  const grouped = groupByCategory(services);

  return (
    <Layout>
      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          {loading ? (
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mx-auto" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
                {header.title}
              </h1>
              <p className="text-lg text-secondary max-w-3xl mx-auto">
                {header.description}
              </p>
            </>
          )}
        </div>

        {/* Services */}
        {loading ? (
          <div className="space-y-16">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="card p-6">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="mb-16">
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground border-b border-[rgb(var(--color-border))] pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </Layout>
  );
};

export default PtspPage;
