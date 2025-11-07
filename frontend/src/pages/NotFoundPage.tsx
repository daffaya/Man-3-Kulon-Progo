import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-background via-semibackground to-background">
        <div className="container max-w-4xl mx-auto text-center fade-in">
          {/* 404 Illustration */}
          <div className="relative mb-10">
            <div className="absolute inset-0 blur-3xl opacity-30">
              <div className="w-64 h-64 mx-auto bg-gradient-to-r from-accent/20 to-primary/20 rounded-full animate-pulse"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-8xl md:text-9xl font-black bg-accent to-primary bg-clip-text text-transparent animate-gradient-x">
                404
              </h1>
              <Sparkles className="absolute -top-4 -right-8 w-12 h-12 text-accent/60 animate-spin-slow" />
              <Sparkles className="absolute -bottom-6 -left-10 w-8 h-8 text-primary/60 animate-spin-slow" />
            </div>
          </div>

          {/* Main Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Halaman Tidak Ditemukan
          </h2>

          <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
            Sepertinya kamu tersesat di dunia maya. Halaman yang kamu cari
            mungkin telah dipindahkan, dihapus, atau sedang dalam perbaikan.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/"
              className="btn btn-primary px-8 py-3 flex items-center justify-center group"
            >
              <Home
                size={20}
                className="mr-2 group-hover:scale-110 transition-transform"
              />
              Kembali ke Beranda
            </Link>
          </div>

          {/* Fun Element */}
          <div className="mt-16 text-sm text-secondary/60 italic">
            <p>
              "Kadang-kadang, jalan yang salah membawa kita ke tujuan yang
              benar."
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
