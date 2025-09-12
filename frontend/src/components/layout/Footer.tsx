import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useArticles } from "../../contexts/ArticleContext";
// Tambahkan baris ini di paling atas file
import { FaTiktok } from "react-icons/fa"; // Jika pakai FontAwesome

const Footer: React.FC = () => {
  const [dynamicTags, setDynamicTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const BACKEND_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001/api";
  // const { publicCategories, publicCategoriesLoading, publicCategoriesError } =
  useArticles();

  return (
    <footer className="bg-gray-100 dark:bg-semibackground pt-12 pb-4 mt-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
          {/* Navigation */}
          <div>
            <h4 className="text-lg font-bold mb-4">Navigation</h4>
            <nav className="flex flex-col space-y-2">
              <FooterLink to="/" label="Beranda" />
              <FooterLink to="/blog" label="Blog" />
              <FooterLink to="/Profile" label="Tentang MAN 3" />
              <FooterLink to="/contact" label="Kontak" />
              <FooterLink to="/atmin" label="Admin" />
            </nav>
          </div>
          {/* Categories */}
          {/* Categories */}{" "}
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
          <div className="flex flex-col items-center">
            <p className="text-sm">
              Copyright &copy; MAN 3 Kulon Progo {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, icon, label }) => {
  return (
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
};

interface FooterLinkProps {
  to: string;
  label: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, label }) => {
  return (
    <Link
      to={to}
      className="text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
    >
      {label}
    </Link>
  );
};

export default Footer;
