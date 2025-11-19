/**
 * @fileoverview KontakPage component for displaying contact information and location map.
 * This component renders the school's contact details including address, phone, email,
 * and WhatsApp number, along with an embedded Google Map showing the school's location.
 */

import React from "react";
import Layout from "../components/layout/Layout";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

/**
 * Array containing contact information items with their values and corresponding icons.
 * Each item represents a different method of contacting the school.
 */
const CONTACT_INFO = [
  {
    value:
      "Pantog Wetan, Banjaroyo, Kalibawang, Kulon Progo, Daerah Istimewa Yogyakarta 55672",
    icon: MapPin,
  },
  {
    value: "0274-2821138",
    icon: Phone,
  },
  {
    value: "man3kulonprogo@gmail.com",
    icon: Mail,
  },
  {
    value: "081328233869",
    icon: MessageCircle,
  },
];

/**
 * Component that displays contact information and location map for MAN 3 Kulon Progo.
 * Renders a list of contact details with appropriate icons and an embedded Google Map
 * showing the school's physical location.
 */
const KontakPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
              Informasi Kontak
            </h2>
            <ul className="space-y-4 text-secondary mx-auto">
              {CONTACT_INFO.map((info, index) => (
                <li key={`contact-${index}`} className="flex items-start">
                  <info.icon className="h-6 w-6 text-accent mr-8 flex-shrink-0 mt-1" />
                  <div>{info.value}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
              Lokasi Kami
            </h2>
            <div className="relative w-full h-96">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg border border-semibackground/20"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.0744573108414!2d110.2594281741187!3d-7.67514477597144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7af4f4fe705b17%3A0x5b73d00e24eb705!2sMan%203%20Kulon%20Progo%2C%20Pantok%20Wetan%2C%20Banjaroyo%2C%20Kec.%20Kalibawang%2C%20Kabupaten%20Kulon%20Progo%2C%20Daerah%20Istimewa%20Yogyakarta!5e0!3m2!1sen!2sid!4v1757911841017!5m2!1sen!2sid"
                allowFullScreen
                loading="lazy"
                title="Lokasi MAN 3 Kulon Progo"
              ></iframe>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default KontakPage;
