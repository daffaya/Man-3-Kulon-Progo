// src/pages/layanan/pmbm/components/PmbmKontakSection.tsx

import React from "react";
import { Mail, Phone } from "lucide-react";
import Section from "../../../../components/ui/Section";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface KontakPerson {
  nama: string;
  wa: string;
  display: string;
}

interface PmbmKontakSectionProps {
  email: string;
  contacts: KontakPerson[];
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK = {
  email: "man3kulonprogo@gmail.com",
  contacts: [
    {
      nama: "Isti Wulandari",
      wa: "6285743881574",
      display: "+62 857-4388-1574",
    },
    { nama: "Wijiardani", wa: "6283189810114", display: "+62 831-8981-0114" },
  ],
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const PmbmKontakSection: React.FC<PmbmKontakSectionProps> = ({
  email,
  contacts,
}) => {
  const resolvedEmail = email || FALLBACK.email;
  const resolvedContacts = contacts.length > 0 ? contacts : FALLBACK.contacts;

  return (
    <Section id="kontak" title="Kontak Tim PMBM">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 md:p-8">
          <p className="text-center mb-6 text-secondary">
            Butuh bantuan? Hubungi tim PMBM kami:
          </p>
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <Mail className="text-accent" size={24} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <a
                  href={`mailto:${resolvedEmail}`}
                  className="text-accent hover:underline transition-colors"
                >
                  {resolvedEmail}
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <Phone className="text-accent" size={24} />
              </div>
              <div>
                <p className="font-semibold text-foreground">WhatsApp</p>
                <div className="flex flex-wrap items-center gap-x-2 text-sm">
                  {resolvedContacts.map((person, index) => (
                    <React.Fragment key={person.wa}>
                      <a
                        href={`https://wa.me/${person.wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline transition-colors"
                      >
                        {person.display}
                      </a>
                      <span className="text-secondary">({person.nama})</span>
                      {index < resolvedContacts.length - 1 && (
                        <span className="text-secondary">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default PmbmKontakSection;
