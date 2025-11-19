/**
 * @fileoverview React component for the website's main footer.
 * This component displays school information, navigation links, social media icons,
 * and contact details. It is structured into columns for better organization and
 * includes a copyright notice.
 */

import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

/**
 * Props for the SocialIcon component.
 * @typedef {object} SocialIconProps
 * @property {string} href - The URL the icon links to.
 * @property {React.ReactNode} icon - The icon element to display.
 * @property {string} label - The accessibility label for the link.
 */

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

/**
 * A component that renders a social media icon as a link.
 * It displays the icon within a styled circle and opens the link in a new tab.
 *
 * @param {SocialIconProps} props - The component props.
 * @returns {JSX.Element} The rendered social media icon link.
 */
const SocialIcon: React.FC<SocialIconProps> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="p-2 bg-background rounded-full hover:bg-secondary-hover text-foreground transition-colors"
  >
    {icon}
  </a>
);

/**
 * Props for the FooterLink component.
 * @typedef {object} FooterLinkProps
 * @property {string} to - The destination path for the internal link.
 * @property {string} label - The text to display for the link.
 */
interface FooterLinkProps {
  to: string;
  label: string;
}
/**
 * A component that renders a navigation link within the footer.
 * It uses React Router's Link component for internal navigation.
 *
 * @param {FooterLinkProps} props - The component props.
 * @returns {JSX.Element} The rendered footer navigation link.
 */
const FooterLink: React.FC<FooterLinkProps> = ({ to, label }) => (
  <Link to={to} className="text-secondary hover:text-hover transition-colors">
    {label}
  </Link>
);

/**
 * The main footer component for the website.
 * Displays school information, navigation links, social media icons, and contact info.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
const Footer: React.FC = () => {
  return (
    <footer className="bg-semibackground pt-12 pb-4">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* School Info & Social Media */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-serif font-bold mb-4 text-foreground">
              MAN 3 Kulon Progo
            </h3>
            <p className="text-secondary mb-4 max-w-md">
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
            <h4 className="text-lg font-bold mb-4 text-foreground">
              Navigation
            </h4>
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
            <h4 className="text-lg font-bold mb-4 text-foreground">Kontak</h4>
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
                  className="underline hover:text-hover transition-colors"
                >
                  man3kulonprogo@gmail.com
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-secondary">
          <p className="text-sm">
            Copyright &copy; MAN 3 Kulon Progo {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
