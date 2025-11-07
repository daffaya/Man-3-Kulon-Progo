import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Calendar,
  Award,
  Users,
  Image,
  MessageSquare,
  Bell,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import ArticleCard from "../components/article/ArticleCard";
import { useArticles } from "../contexts/ArticleContext";
import Carousel from "../components/ui/Carousel";
import Hero from "../components/ui/Hero";
import { useGallery } from "../contexts/GalleryContext";
import AlbumCard from "../components/gallery/AlbumCard";

const HomePage: React.FC = () => {
  const { state, fetchArticles } = useArticles();
  const { articles, loading } = state;
  const { state: galleryState, fetchAlbums } = useGallery();
  const { albums: galleryAlbums, loading: galleryLoading } = galleryState;

  useEffect(() => {
    fetchArticles({ limit: 10 });
    fetchAlbums({ limit: 6 });
  }, [fetchArticles, fetchAlbums]);

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

  return (
    <Layout>
      <Carousel />
      <Hero />

      {/* Quick Stats */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Siswa", value: "1,200+" },
              { label: "Guru & Staf", value: "80+" },
              { label: "Ekstrakurikuler", value: "15+" },
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
              <img
                src="/MAN 3.jpg"
                alt="MAN 3 Kulon Progo"
                className="rounded-lg shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center text-foreground">
              <Bell size={24} className="mr-2 text-accent" />
              Pengumuman
            </h2>
            <Link
              to="/pengumuman"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Pendaftaran PPDB 2023/2024 Dibuka",
                desc: "Pendaftaran peserta didik baru telah dibuka mulai 1 Mei 2023.",
                time: "2 hari yang lalu",
              },
              {
                title: "Libur Semester Ganjil",
                desc: "Libur semester ganjil dimulai dari 15 Desember hingga 2 Januari.",
                time: "1 minggu yang lalu",
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <div className="flex items-start">
                  <div className="bg-accent/10 p-2 rounded-full mr-4 flex-shrink-0">
                    <Bell className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-secondary mb-3">{item.desc}</p>
                    <span className="text-sm text-secondary/70">
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center text-foreground">
              <Calendar size={24} className="mr-2 text-accent" />
              Agenda Kegiatan
            </h2>
            <Link
              to="/agenda"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                date: "15",
                month: "Des 2023",
                title: "Ujian Semester Ganjil",
                desc: "Pelaksanaan ujian semester ganjil untuk semua tingkat.",
              },
              {
                date: "20",
                month: "Des 2023",
                title: "Perayaan Natal",
                desc: "Perayaan Natal bersama seluruh warga sekolah.",
              },
              {
                date: "5",
                month: "Jan 2024",
                title: "Masuk Semester Genap",
                desc: "Hari pertama masuk semester genap tahun ajaran baru.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-background border-l-4 border-accent p-5 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="text-accent font-bold text-lg">{item.date}</div>
                <div className="text-secondary text-sm">{item.month}</div>
                <h3 className="font-bold mt-2 mb-1 text-foreground">
                  {item.title}
                </h3>
                <p className="text-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <div className="text-center my-8 fade-in">
        <h1 className="text-4xl md:text-5xl sm:text-6xl font-serif font-bold mb-4 text-foreground">
          Artikel & Berita Pilihan
        </h1>
        <p className="text-lg text-secondary max-w-3xl mx-auto">
          Lihat sekilas cerita seru, prestasi keren, dan momen berharga di MAN 3
          Kulon Progo. Dari kegiatan sekolah sampai kabar terbaru, semua bisa
          kamu nikmati di sini! <br />
          Jangan sampai ketinggalan, ya!
        </p>
      </div>

      {featuredArticles.length > 0 && (
        <div className="mb-16 slide-up">
          <ArticleCard article={featuredArticles[0]} featured />
        </div>
      )}

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
              to="/prestasi"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Juara 1 Olimpiade Sains Nasional",
                desc: "Tim MAN 3 Kulon Progo berhasil meraih juara 1 OSN tingkat DIY.",
                time: "1 minggu yang lalu",
              },
              {
                title: "Juara 2 Futsal Antar Madrasah",
                desc: "Tim futsal MAN 3 Kulon Progo meraih juara 2 se-Kulon Progo.",
                time: "2 minggu yang lalu",
              },
            ].map((item) => (
              <div key={item.title} className="card p-6 flex items-start">
                <div className="bg-accent/10 p-3 rounded-full mr-4 flex-shrink-0">
                  <Award className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-secondary mb-2">{item.desc}</p>
                  <span className="text-sm text-secondary/70">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
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

      {/* Quick Actions */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-center text-foreground">
            Layanan Cepat
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Users size={24} />,
                title: "Portal Siswa",
                desc: "Akses portal siswa",
                link: "/portal-siswa",
              },
              {
                icon: <MessageSquare size={24} />,
                title: "E-Learning",
                desc: "Platform pembelajaran online",
                link: "/e-learning",
              },
              {
                icon: <Users size={24} />,
                title: "PPDB Online",
                desc: "Pendaftaran peserta didik baru",
                link: "/ppdb",
              },
              {
                icon: <MessageSquare size={24} />,
                title: "Kontak Kami",
                desc: "Hubungi kami",
                link: "/contact",
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
