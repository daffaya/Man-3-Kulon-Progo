import React from "react";
import { Mail, Phone } from "lucide-react";
import Section from "../../../../components/ui/Section";

const PmbmKontakSection: React.FC = () => {
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
                  href="mailto:man3kulonprogo@gmail.com"
                  className="text-accent hover:underline transition-colors"
                >
                  man3kulonprogo@gmail.com
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
                  <a
                    href="https://wa.me/6285743881574"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline transition-colors"
                  >
                    +62 857-4388-1574
                  </a>
                  <span className="text-secondary">(Isti Wulandari)</span>
                  <span className="text-secondary">/</span>
                  <a
                    href="https://wa.me/6283189810114"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline transition-colors"
                  >
                    +62 831-8981-0114
                  </a>
                  <span className="text-secondary">(Wijiardani)</span>
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
