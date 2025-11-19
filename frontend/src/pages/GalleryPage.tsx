/**
 * @fileoverview GalleryPage component for displaying a paginated and searchable list of photo albums.
 * This component fetches album data from the GalleryContext, provides a search bar with debounced input,
 * and handles client-side pagination.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import AlbumList from "../components/gallery/AlbumList";
import { useGallery } from "../contexts/GalleryContext";

/**
 * Component that renders the public gallery page.
 * It displays a list of photo albums, allowing users to search through them and navigate between pages.
 * The data is managed and fetched through the GalleryContext.
 */
const GalleryPage: React.FC = () => {
  const { state, fetchAlbums } = useGallery();
  const { albums, loading, publicPagination } = state;

  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = "Galeri Foto - MAN 3 Kulon Progo";
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    fetchAlbums({
      keyword: debouncedKeyword,
      page: currentPage,
    });
  }, [fetchAlbums, debouncedKeyword, currentPage]);

  /**
   * Handles the change of the current page in the pagination.
   * It updates the page state and scrolls the user to the top of the page.
   * @param {number} page - The page number to navigate to.
   */
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > publicPagination.totalPages) return;
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [publicPagination.totalPages]
  );

  if (loading && albums.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4 text-secondary">Memuat galeri...</p>
        </div>
      </Layout>
    );
  }

  if (!loading && albums.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-secondary mb-4">
            Tidak ada album ditemukan.
          </p>
          {debouncedKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="inline-flex items-center text-accent hover:underline font-medium"
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            Galeri Foto
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Dokumentasi kegiatan, prestasi, dan momen berharga di MAN 3 Kulon
            Progo
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/60"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari album..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-input w-full pl-10 pr-10 py-3"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary/60 hover:text-foreground transition-colors"
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
                className={`btn btn-secondary px-4 py-2 flex items-center ${
                  publicPagination.currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : ""
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
                          <span className="px-3 py-2 text-secondary/60">
                            ...
                          </span>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              currentPage === page
                                ? "btn btn-primary"
                                : "btn btn-secondary"
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
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? "btn btn-primary"
                            : "btn btn-secondary"
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
                className={`btn btn-secondary px-4 py-2 flex items-center ${
                  publicPagination.currentPage === publicPagination.totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
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
          <div className="text-center mt-4 text-sm text-secondary/70">
            Menampilkan halaman {currentPage} dari {publicPagination.totalPages}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GalleryPage;
