// frontend/src/pages/GalleryPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import AlbumList from "../components/gallery/AlbumList";
import { useGallery } from "../contexts/GalleryContext";

const GalleryPage: React.FC = () => {
  const { state, fetchAlbums } = useGallery();
  const { albums, loading, publicPagination } = state;

  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Update document title
  useEffect(() => {
    document.title = "Galeri Foto - MAN 3 Kulon Progo";
  }, []);

  // Debounce pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Fetch album
  useEffect(() => {
    fetchAlbums({
      keyword: debouncedKeyword,
      page: currentPage,
    });
  }, [fetchAlbums, debouncedKeyword, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > publicPagination.totalPages) return;
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [publicPagination.totalPages]
  );

  // Loading State
  if (loading && albums.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Memuat galeri...
          </p>
        </div>
      </Layout>
    );
  }

  // No Results
  if (!loading && albums.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Tidak ada album ditemukan.
          </p>
          {debouncedKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="inline-flex items-center text-accent hover:underline"
            >
              <X size={16} className="mr-1" /> Hapus pencarian
            </button>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Galeri Foto
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Dokumentasi kegiatan, prestasi, dan momen berharga di MAN 3 Kulon
            Progo
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari album..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-input w-full pl-10 pr-10 py-3 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-accent focus:border-accent transition-colors"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Album List */}
        <AlbumList albums={albums} loading={loading} showDescription={true} />

        {/* Pagination */}
        {publicPagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-12">
            <nav className="flex items-center space-x-2">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={publicPagination.currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  publicPagination.currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <ChevronLeft size={20} />
                <span className="ml-1">Sebelumnya</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: publicPagination.totalPages },
                  (_, i) => i + 1
                )
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === publicPagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="px-3 py-2 text-gray-500">...</span>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === page
                                ? "bg-accent text-white"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? "bg-accent text-white"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  publicPagination.currentPage === publicPagination.totalPages
                }
                className={`flex items-center px-4 py-2 rounded-lg ${
                  publicPagination.currentPage === publicPagination.totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="mr-1">Berikutnya</span>
                <ChevronRight size={20} />
              </button>
            </nav>
          </div>
        )}

        {/* Pagination Info */}
        {publicPagination.totalPages > 1 && (
          <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
            Menampilkan halaman {currentPage} dari {publicPagination.totalPages}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GalleryPage;
