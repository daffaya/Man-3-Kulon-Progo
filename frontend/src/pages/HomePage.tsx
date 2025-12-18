/**
 * @fileoverview HomePage component for displaying the main landing page of the MAN 3 Kulon Progo website.
 * This component renders various sections including carousel, hero, statistics, school information,
 * integrity zone, survey results, featured articles, achievements, photo gallery, public complaint service, and quick actions.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Calendar,
  Award,
  Users,
  Image,
  MessageSquare,
  Bell,
  Shield,
  CheckCircle,
  Book,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import ArticleCard from "../components/article/ArticleCard";
import { useArticles } from "../contexts/ArticleContext";
import Carousel from "../components/ui/Carousel";
import Hero from "../components/ui/Hero";
import { useGallery } from "../contexts/GalleryContext";
import AlbumCard from "../components/gallery/AlbumCard";
import { Article, Category } from "../types/articleTypes";
import { useStudentStats } from "../contexts/StudentStatsContext";
import articleApi from "../api/articleApi";
import SurveySlider from "../components/ui/SurveySlider";

/**
 * Main home page component that displays various sections of the school website.
 * Fetches and displays articles, albums, and student statistics.
 */
const HomePage: React.FC = () => {
  const { state, fetchArticles, fetchCategories } = useArticles();
  const { articles, loading, categories } = state;
  const { state: galleryState, fetchAlbums } = useGallery();
  const { albums: galleryAlbums, loading: galleryLoading } = galleryState;
  const { state: studentStatsState } = useStudentStats();
  const [achievementArticles, setAchievementArticles] = useState<Article[]>([]);
  const [achievementLoading, setAchievementLoading] = useState(true);

  useEffect(() => {
    fetchArticles({ limit: 10 });
    fetchAlbums({ limit: 6 });
    fetchCategories();
  }, [fetchArticles, fetchAlbums, fetchCategories]);

  useEffect(() => {
    if (categories.length === 0) return;

    const fetchPrestasiArticles = async () => {
      setAchievementLoading(true);
      try {
        const prestasiCategory = categories.find(
          (cat: Category) => cat.name === "Prestasi"
        );

        if (prestasiCategory) {
          const data = await articleApi.getPublicArticles({
            category: prestasiCategory.slug,
            limit: 4,
          });
          setAchievementArticles(data.articles || []);
        }
        setAchievementLoading(false);
      } catch (error) {
        console.error("Error fetching achievement articles:", error);
        setAchievementLoading(false);
      }
    };

    fetchPrestasiArticles();
  }, [categories]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-foreground">Loading articles...</p>
        </div>
      </Layout>
    );
  }

  const featuredArticles = articles.filter((article) => article.featured);
  const recentArticles = articles.slice(0, 6);

  /**
   * Helper function to get the student statistics value.
   * @returns {string|JSX.Element} The formatted student count or loading spinner.
   */
  const getStudentStatValue = () => {
    if (studentStatsState.loading) {
      return (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
        </div>
      );
    }
    if (studentStatsState.error) {
      return "N/A";
    }
    return studentStatsState.totalStudents?.toLocaleString("id-ID") || "0";
  };

  return (
    <Layout>
      <Carousel />
      <Hero />

      {/* Quick Stats */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Siswa",
                value: getStudentStatValue(),
              },
              { label: "Guru & Staf", value: "50" },
              { label: "Ekstrakurikuler", value: "10+" },
              { label: "Prestasi", value: "50+" },
            ].map((item) => (
              <div key={item.label} className="card p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {item.value}
                </div>
                <div className="text-secondary">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About School Preview */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">
                Tentang MAN 3 Kulon Progo
              </h2>
              <p className="text-secondary mb-6">
                MAN 3 Kulon Progo adalah institusi pendidikan yang berkomitmen
                untuk mencetak generasi muslim yang unggul, berakhlak mulia, dan
                siap menghadapi tantangan global. Dengan kurikulum yang
                seimbang, kami siap membentuk siswa yang memiliki karakter kuat
                dan kompetensi tinggi.
              </p>
              <Link to="/profile/sejarah" className="btn btn-primary">
                Selengkapnya
              </Link>
            </div>
            <div className="md:w-1/2">
              {/* Mengganti gambar dengan video YouTube */}
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%" }}
              >
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://www.youtube.com/embed/Tpn9sT-VDCY"
                  title="Video Profile MAN 3 Kulon Progo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zona Integritas Section */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center text-foreground">
              <Shield size={24} className="mr-2 text-accent" />
              Zona Integritas
            </h2>
            <Link
              to="/layanan/zona-integritas"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Detail
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Description */}
            <div className="lg:col-span-2">
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  Mewujudkan WBK dan WBBM di MAN 3 Kulon Progo
                </h3>
                <p className="text-secondary mb-4">
                  Zona Integritas merupakan predikat yang diberikan kepada
                  instansi pemerintah yang pimpinan dan jajarannya mempunyai
                  komitmen untuk mewujudkan Wilayah Bebas dari Korupsi (WBK) dan
                  Wilayah Birokrasi Bersih dan Melayani (WBBM) melalui reformasi
                  birokrasi.
                </p>
                <p className="text-secondary mb-6">
                  MAN 3 Kulon Progo berkomitmen membangun budaya antikorupsi dan
                  meningkatkan kualitas pelayanan publik melalui 6 area
                  pembangunan Zona Integritas sesuai PermenPAN RB No 10 Tahun
                  2019.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/layanan/zona-integritas"
                    className="btn btn-primary"
                  >
                    Pelajari Lebih Lanjut
                  </Link>
                  <Link
                    to="/layanan/zona-integritas#pengaduan"
                    className="btn btn-secondary"
                  >
                    Layanan Pengaduan
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - 6 Areas */}
            <div>
              <div className="bg-background p-6 rounded-lg shadow-sm h-full">
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  6 Area Pembangunan ZI
                </h3>
                <ul className="space-y-3">
                  {[
                    "Manajemen Perubahan",
                    "Penataan Tatalaksana",
                    "Penataan Sistem Manajemen SDM",
                    "Penguatan Akuntabilitas",
                    "Penguatan Pengawasan",
                    "Peningkatan Kualitas Pelayanan Publik",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-accent/10 p-1 rounded-full mr-3 mt-1">
                        <CheckCircle size={16} className="text-accent" />
                      </div>
                      <span className="text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-bold mb-2 text-foreground">
                    Budaya Antikorupsi
                  </h4>
                  <p className="text-sm text-secondary">
                    Kami membangun nilai-nilai budaya kerja yang Smart,
                    Akuntabel, Integritas dan Loyalitas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Survey Results Section*/}
      <SurveySlider />

      {/* Featured Articles */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 fade-in">
            <h1 className="text-4xl md:text-5xl sm:text-6xl font-serif font-bold mb-4 text-foreground">
              Artikel & Berita Pilihan
            </h1>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Lihat sekilas cerita seru, prestasi keren, dan momen berharga di
              MAN 3 Kulon Progo. Dari kegiatan sekolah sampai kabar terbaru,
              semua bisa kamu nikmati di sini! <br />
              Jangan sampai ketinggalan, ya!
            </p>
          </div>

          {featuredArticles.length > 0 && (
            <div className="mb-16 slide-up">
              <ArticleCard article={featuredArticles[0]} featured />
            </div>
          )}
        </div>
      </section>

      {/* Recent News */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Berita Terbaru
            </h2>
            <Link
              to="/berita"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center text-foreground">
              <Award size={24} className="mr-2 text-accent" />
              Prestasi Terkini
            </h2>
            <Link
              to="/berita?category=prestasi"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>
          </div>

          {achievementLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
              <p className="mt-2 text-secondary">Memuat prestasi...</p>
            </div>
          ) : achievementArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievementArticles.map((article) => (
                <div
                  key={article.id}
                  className="card pl-2 pr-6 py-6 flex items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">
                      {article.title}
                    </h3>
                    <p className="text-secondary mb-2">{article.overview}</p>
                    <span className="text-sm text-secondary/70">
                      {new Date(
                        article.publishedDate || article.lastModified
                      ).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award size={48} className="mx-auto text-secondary/50 mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                Belum ada prestasi terbaru
              </h3>
              <p className="text-secondary">
                Prestasi siswa akan segera ditampilkan di sini
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center text-foreground">
              <Image size={24} className="mr-2 text-accent" />
              Galeri Foto
            </h2>
            <Link
              to="/galeri"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>
          </div>
          {galleryLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
              <p className="mt-2 text-secondary">Memuat galeri...</p>
            </div>
          ) : galleryAlbums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryAlbums.slice(0, 4).map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  showDescription={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Image size={48} className="mx-auto text-secondary/50 mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                Belum ada album foto
              </h3>
              <p className="text-secondary">
                Dokumentasi kegiatan akan segera tersedia
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Serapan Aduan Masyarakat (SEDUM) Section */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center text-foreground">
              <MessageSquare size={24} className="mr-2 text-accent" />
              Serapan Aduan Masyarakat
            </h2>
            <Link
              to="/layanan/sedum"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Detail
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Description */}
            <div className="lg:col-span-2">
              <div className="bg-semibackground p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  Layanan Pengaduan Masyarakat
                </h3>
                <p className="text-secondary mb-4">
                  MAN 3 Kulon Progo membuka ruang seluas-luasnya bagi masyarakat
                  (orang tua/wali, siswa, alumni, maupun publik) untuk
                  menyampaikan aduan, saran, atau masukan konstruktif demi
                  peningkatan kualitas layanan pendidikan.
                </p>
                <p className="text-secondary mb-6">
                  Setiap masukan akan ditindaklanjuti secara profesional dan
                  kerahasiaan identitas pelapor akan kami jaga. Aduan akan
                  diproses maksimal 3x24 jam kerja.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link to="/layanan/sedum" className="btn btn-primary">
                    Ajukan Aduan/Saran
                  </Link>
                  <a
                    href="https://forms.gle/HmxhgcbJvt8XB5P2A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    Formulir Online
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Options */}
            <div className="space-y-6">
              {/* --- Card 1: Primary Channels --- */}
              <div className="bg-semibackground p-6 rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold mb-4 text-foreground flex items-center">
                  <Zap
                    size={20}
                    className="mr-2 text-accent"
                    aria-hidden="true"
                  />
                  Saluran Utama
                </h3>
                <address className="not-italic space-y-4">
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start group hover:bg-accent/5 p-2 -m-2 rounded transition-colors"
                    aria-label="Hubungi via WhatsApp ke 0812-3456-7890"
                  >
                    <div className="bg-accent/10 p-2 rounded-full mr-3 flex-shrink-0">
                      <MessageCircle
                        className="text-accent"
                        size={18}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        WhatsApp
                      </span>
                      <p className="text-sm text-secondary">0812-3456-7890</p>
                    </div>
                  </a>
                  <a
                    href="mailto:man3kulonprogo@gmail.com"
                    className="flex items-start group hover:bg-accent/5 p-2 -m-2 rounded transition-colors"
                    aria-label="Kirim email ke man3kulonprogo@gmail.com"
                  >
                    <div className="bg-accent/10 p-2 rounded-full mr-3 flex-shrink-0">
                      <Mail
                        className="text-accent"
                        size={18}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Email</span>
                      <p className="text-sm text-secondary">
                        man3kulonprogo@gmail.com
                      </p>
                    </div>
                  </a>
                  <a
                    href="tel:02742821138"
                    className="flex items-start group hover:bg-accent/5 p-2 -m-2 rounded transition-colors"
                    aria-label="Telepon ke 0274-2821138"
                  >
                    <div className="bg-accent/10 p-2 rounded-full mr-3 flex-shrink-0">
                      <Phone
                        className="text-accent"
                        size={18}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        Hotline
                      </span>
                      <p className="text-sm text-secondary">0274-2821138</p>
                    </div>
                  </a>
                </address>
              </div>

              {/* --- Card 2: Other Channels --- */}
              <div className="bg-semibackground p-6 rounded-lg shadow-sm border border-border/50">
                <h3 className="text-lg font-bold mb-4 text-foreground">
                  Saluran Lainnya
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">
                      Kotak Pengaduan Fisik
                    </h4>
                    <p className="text-sm text-secondary">
                      Tersedia di depan ruang Tata Usaha sekolah.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Pengaduan Nasional
                    </h4>
                    <ul className="space-y-2">
                      <li>
                        <a
                          href="https://sippn.menpan.go.id/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline flex items-center transition-colors"
                        >
                          <ExternalLink
                            size={14}
                            className="mr-1"
                            aria-hidden="true"
                          />
                          SIPPN
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.lapor.go.id/instansi/man-3-kulon-progo"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline flex items-center transition-colors"
                        >
                          <ExternalLink
                            size={14}
                            className="mr-1"
                            aria-hidden="true"
                          />
                          SP4N Lapor
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-center text-foreground">
            Layanan Cepat
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Users size={24} />,
                title: "PPDB Online",
                desc: "Pendaftaran peserta didik baru",
                link: "/layanan/ppdb",
              },
              {
                icon: <Shield size={24} />,
                title: "Zona Integritas",
                desc: "Layanan pengaduan",
                link: "/layanan/zona-integritas",
              },
              {
                icon: <MessageSquare size={24} />,
                title: "Sedum",
                desc: "Serapan Aduan Masyarakat",
                link: "/layanan/sedum",
              },
              {
                icon: <Book size={24} />,
                title: "Perpustakaan",
                desc: "Perpustakaan Digital Online",
                link: "https://perpustakaan.man3kulonprogo.sch.id/",
              },
            ].map((item) => (
              <Link to={item.link} key={item.title} className="block">
                <div className="card p-6 text-center">
                  <div className="flex justify-center mb-4 text-accent">
                    {item.icon}
                  </div>
                  <div className="font-bold mb-1 text-foreground">
                    {item.title}
                  </div>
                  <div className="text-sm text-secondary">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
