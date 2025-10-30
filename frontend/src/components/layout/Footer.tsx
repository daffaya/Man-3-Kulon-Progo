import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

/**
 * Footer component.
 * Displays school information, navigation links, social media icons, and contact info.
 */
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-semibackground pt-12 pb-4 mt-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* School Info & Social Media */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-serif font-bold mb-4">
              MAN 3 Kulon Progo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Tempat di mana mimpi dirangkum dengan doa, tawa pecah di sela
              pelajaran, dan kebersamaan jadi fondasi kita. Bukan sekadar
              sekolah—ini rumah untuk belajar menjadi diri yang lebih baik,
              bersama-sama.
            </p>
            <div className="flex space-x-4">
              <SocialIcon
                href="https://www.instagram.com/mantigakp.official/"
                icon={<Instagram size={20} />}
                label="Instagram"
              />
              <SocialIcon
                href="https://www.tiktok.com/@mantigakp.official"
                icon={<FaTiktok size={20} />}
                label="Tiktok"
              />
              <SocialIcon
                href="https://www.facebook.com/mantigakp.official/"
                icon={<Facebook size={20} />}
                label="Facebook"
              />
              <SocialIcon
                href="mailto:man3kulonprogo@gmail.com"
                icon={<Mail size={20} />}
                label="Email"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Navigation</h4>
            <nav className="flex flex-col space-y-2">
              <FooterLink to="/" label="Beranda" />
              <FooterLink to="/berita" label="Berita" />
              <FooterLink to="/Profile" label="Tentang MAN 3" />
              <FooterLink to="/contact" label="Kontak" />
              <FooterLink to="/atmin" label="Admin" />
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Kontak</h4>
            <address className="not-italic space-y-2 text-sm text-foreground">
              <p className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                <span>
                  Pantog Wetan Banjaroyo Kalibawang Kulon Progo Daerah Istimewa
                  Yogyakarta 55672
                </span>
              </p>

              <p className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-accent" />
                <span>0274.2821138</span>
              </p>

              <p className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-accent" />
                <a
                  href="mailto:man3kulonprogo@gmail.com"
                  className="underline hover:text-accent-dark"
                >
                  man3kulonprogo@gmail.com
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Copyright &copy; MAN 3 Kulon Progo {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

/**
 * Social media icon link component.
 */
interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}
const SocialIcon: React.FC<SocialIconProps> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="p-2 bg-white dark:bg-background rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
  >
    {icon}
  </a>
);

/**
 * Footer navigation link component.
 */
interface FooterLinkProps {
  to: string;
  label: string;
}
const FooterLink: React.FC<FooterLinkProps> = ({ to, label }) => (
  <Link
    to={to}
    className="text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
  >
    {label}
  </Link>
);

export default Footer;
