/**
 * @fileoverview KontakPage — migrated to CMS.
 * Fetches contact info dynamically from site_contents (page: kontak, section: content).
 */

import React from "react";
import Layout from "../components/layout/Layout";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useCmsSection } from "../hooks/useCmsPage";

interface KontakContent {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  maps_embed_url: string;
}

// Fallback — ditampilkan kalau API gagal atau sedang loading
const FALLBACK: KontakContent = {
  address:
    "Jl.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaKulon Progo, Daerah Istimewa Yogyakarta 55672",
  phone: "0274-2821138",
  email: "man3kulonprogo@gmail.com",
  whatsapp: "+62-878-5810-2393",
  maps_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.0744573108414!2d110.2594281741187!3d-7.67514477597144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7af4f4fe705b17%3A0x5b73d00e24eb705!2sMan%203%20Kulon%20Progo!5e0!3m2!1sen!2sid!4v1757911841017!5m2!1sen!2sid",
};

const KontakPage: React.FC = () => {
  const { data, loading } = useCmsSection<KontakContent>("kontak", "content");

  // Merge CMS data with fallback — setiap field aman meski API gagal
  const content: KontakContent = {
    address: data?.address ?? FALLBACK.address,
    phone: data?.phone ?? FALLBACK.phone,
    email: data?.email ?? FALLBACK.email,
    whatsapp: data?.whatsapp ?? FALLBACK.whatsapp,
    maps_embed_url: data?.maps_embed_url ?? FALLBACK.maps_embed_url,
  };

  const contactItems = [
    { value: content.address, icon: MapPin },
    { value: content.phone, icon: Phone },
    { value: content.email, icon: Mail },
    { value: content.whatsapp, icon: MessageCircle },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12">
          {/* Contact Info */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
              Informasi Kontak
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <ul className="space-y-4 text-secondary mx-auto">
                {contactItems.map((item, index) => (
                  <li key={`contact-${index}`} className="flex items-start">
                    <item.icon className="h-6 w-6 text-accent mr-8 flex-shrink-0 mt-1" />
                    <div>{item.value}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Maps */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
              Lokasi Kami
            </h2>
            <div className="relative w-full h-96">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg border border-semibackground/20"
                src={content.maps_embed_url}
                allowFullScreen
                loading="lazy"
                title="Lokasi MAN 3 Kulon Progo"
              />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default KontakPage;
