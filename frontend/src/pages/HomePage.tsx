import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../components/layout/Layout";
import ArticleCard from "../components/article/ArticleCard";
import { ArticleContext, useArticles } from "../contexts/ArticleContext";
import Carousel from "../components/ui/Carousel";
import Hero from "../components/ui/Hero";

const HomePage: React.FC = () => {
  const { getFeaturedArticles, getPublishedArticles } = useArticles();

  const featuredArticles = getFeaturedArticles();
  const recentArticles = getPublishedArticles().slice(0, 6);

  return (
    <Layout>
      {/* Slider Section */}
      <Carousel />

      <Hero />
      {/* Articles Section */}
      <section className="pt-12 md:pt-20 pb-10 md:pb-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 fade-in">
            <h1 className="text-4xl md:text-5xl sm:text-6xl font-serif font-bold mb-4">
              Random Ramblings & Real Talk
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A space where my raw thoughts collide—mostly on writing, life, and
              the chaos in between. No fluff, no filter. Just some random guy
              figuring things out, <br />
              sharing what`s been working (and what really hasn’t).
            </p>
          </div>

          {featuredArticles.length > 0 && (
            <div className="mb-16 slide-up">
              <ArticleCard article={featuredArticles[0]} featured />
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">
              Recent Articles
            </h2>
            <Link
              to="/blog"
              className="flex items-center text-accent hover:underline font-medium"
            >
              View all
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
    </Layout>
  );
};

export default HomePage;
