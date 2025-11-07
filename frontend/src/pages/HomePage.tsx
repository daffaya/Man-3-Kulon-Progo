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
          <p>Loading articles...</p>
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
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-accent mb-2">1,200+</div>
              <div className="text-gray-600 dark:text-gray-400">Siswa</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-accent mb-2">80+</div>
              <div className="text-gray-600 dark:text-gray-400">
                Guru & Staf
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-accent mb-2">15+</div>
              <div className="text-gray-600 dark:text-gray-400">
                Ekstrakurikuler
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-accent mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Prestasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* About School Preview */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif font-bold mb-4">
                Tentang MAN 3 Kulon Progo
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                MAN 3 Kulon Progo adalah institusi pendidikan yang berkomitmen
                untuk mencetak generasi muslim yang unggul, berakhlak mulia, dan
                siap menghadapi tantangan global. Dengan kurikulum yang seimbang
                antara pendidikan umum dan keagamaan, kami siap membentuk siswa
                yang memiliki karakter kuat dan kompetensi tinggi.
              </p>
              <Link
                to="/profile/sejarah"
                className="inline-block bg-accent text-white px-6 py-2 rounded-md hover:bg-accent-dark transition-colors"
              >
                Selengkapnya
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="/MAN 3.jpg"
                alt="MAN 3 Kulon Progo"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      {/* <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center">
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-start">
                <div className="bg-accent/10 p-2 rounded-full mr-4">
                  <Bell className="text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    Pendaftaran PPDB 2023/2024 Dibuka
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Pendaftaran peserta didik baru untuk tahun ajaran 2023/2024
                    telah dibuka mulai 1 Mei 2023.
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    2 hari yang lalu
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-start">
                <div className="bg-accent/10 p-2 rounded-full mr-4">
                  <Bell className="text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    Libur Semester Ganjil
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Libur semester ganjil akan dimulai dari 15 Desember 2023
                    hingga 2 Januari 2024.
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    1 minggu yang lalu
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Upcoming Events */}
      {/* <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center">
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
            <div className="bg-gray-50 dark:bg-gray-900 border-l-4 border-accent p-5 rounded shadow">
              <div className="text-accent font-bold text-lg">15</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Des 2023
              </div>
              <h3 className="font-bold mt-2 mb-1">Ujian Semester Ganjil</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pelaksanaan ujian semester ganjil untuk semua tingkat
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border-l-4 border-accent p-5 rounded shadow">
              <div className="text-accent font-bold text-lg">20</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Des 2023
              </div>
              <h3 className="font-bold mt-2 mb-1">Perayaan Natal</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Perayaan Natal bersama untuk seluruh warga sekolah
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border-l-4 border-accent p-5 rounded shadow">
              <div className="text-accent font-bold text-lg">5</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Jan 2024
              </div>
              <h3 className="font-bold mt-2 mb-1">Masuk Semester Genap</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Hari pertama masuk semester genap tahun ajaran 2023/2024
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Featured Articles */}
      <div className="text-center my-8 fade-in">
        <h1 className="text-4xl md:text-5xl sm:text-6xl font-serif font-bold mb-4">
          Artikel & Berita Pilihan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
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
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">
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
      {/* <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center">
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-start">
              <div className="bg-accent/10 p-3 rounded-full mr-4">
                <Award className="text-accent" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  Juara 1 Olimpiade Sains Nasional
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Tim olimpiade sains MAN 3 Kulon Progo berhasil meraih juara 1
                  dalam Olimpiade Sains Nasional tingkat SMA/MA se-DIY.
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  1 minggu yang lalu
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-start">
              <div className="bg-accent/10 p-3 rounded-full mr-4">
                <Award className="text-accent" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  Juara 2 Futsal Antar Madrasah
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Tim futsal putra MAN 3 Kulon Progo berhasil meraih juara 2
                  dalam kompetisi futsal antar madrasah se-Kulon Progo.
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  2 minggu yang lalu
                </span>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Update Photo Gallery Preview Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center">
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
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Memuat galeri...
              </p>
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
              <Image size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                Belum ada album foto
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Dokumentasi kegiatan akan segera tersedia
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-center">
            Layanan Cepat
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/portal-siswa" className="block">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center">
                <div className="flex justify-center mb-4 text-accent">
                  <Users size={24} />
                </div>
                <div className="font-bold mb-1">Portal Siswa</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Akses portal siswa
                </div>
              </div>
            </Link>

            <Link to="/e-learning" className="block">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center">
                <div className="flex justify-center mb-4 text-accent">
                  <MessageSquare size={24} />
                </div>
                <div className="font-bold mb-1">E-Learning</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Platform pembelajaran online
                </div>
              </div>
            </Link>

            <Link to="/ppdb" className="block">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center">
                <div className="flex justify-center mb-4 text-accent">
                  <Users size={24} />
                </div>
                <div className="font-bold mb-1">PPDB Online</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pendaftaran peserta didik baru
                </div>
              </div>
            </Link>

            <Link to="/contact" className="block">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center">
                <div className="flex justify-center mb-4 text-accent">
                  <MessageSquare size={24} />
                </div>
                <div className="font-bold mb-1">Kontak Kami</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Hubungi kami
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
