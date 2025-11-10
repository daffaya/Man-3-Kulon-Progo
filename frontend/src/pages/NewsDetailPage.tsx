// frontend/src/pages/ArticlePage.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Layout from "../components/layout/Layout";
import ArticleContent from "../components/article/ArticleContent";
import ArticleCard from "../components/article/ArticleCard";
import { useArticles } from "../contexts/ArticleContext";
import { Article } from "../types/articleTypes";

const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state, fetchArticles, fetchArticleBySlug } = useArticles();
  const { articles, loading } = state;

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const getRelatedArticles = useMemo(
    () =>
      (target: Article): Article[] => {
        const targetTags = Array.isArray(target.tags) ? target.tags : [];
        if (targetTags.length === 0) return [];

        return state.articles
          .filter(
            (a) =>
              a.id !== target.id &&
              Array.isArray(a.tags) &&
              a.tags.some((tag) => targetTags.includes(tag))
          )
          .slice(0, 3);
      },
    [state.articles]
  );

  useEffect(() => {
    if (!slug || hasFetched.current) return;
    hasFetched.current = true;

    const fetchArticleData = async () => {
      setArticleLoading(true);
      setArticleError(null);

      try {
        const fetched = await fetchArticleBySlug(slug);
        if (!fetched) {
          setArticleError("Article not found");
          setTimeout(() => navigate("/berita", { replace: true }), 1000);
          return;
        }

        setArticle(fetched);

        if (articles.length < 10) {
          await fetchArticles({ limit: 20 });
        }

        setRelatedArticles(getRelatedArticles(fetched));
        window.scrollTo(0, 0);
      } catch {
        setArticleError("Failed to load article");
      } finally {
        setArticleLoading(false);
      }
    };

    fetchArticleData();

    return () => {
      hasFetched.current = false;
    };
  }, [slug]);

  if (articleLoading || (loading && !article)) {
    return (
      <Layout>
        <div className="container-narrow py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-secondary">Loading article...</p>
        </div>
      </Layout>
    );
  }

  if (articleError) {
    return (
      <Layout>
        <div className="container-narrow py-20 text-center">
          <p className="text-xl text-error mb-4">{articleError}</p>
          <Link to="/berita" className="text-accent hover:underline">
            Kembali ke halaman berita
          </Link>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container-narrow py-20 text-center">
          <p className="text-xl text-secondary">Article not found.</p>
          <Link
            to="/berita"
            className="text-accent hover:underline mt-4 inline-block"
          >
            Kembali ke halaman berita
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-narrow max-w-4xl py-4 slide-up">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/berita"
              className="flex items-center text-secondary hover:text-accent transition-colors"
            >
              <ChevronLeft size={20} /> <span>Kembali ke halaman berita</span>
            </Link>
          </div>

          {article.category && (
            <div className="ml-5 mb-6 text-sm text-secondary">
              Category:{" "}
              <Link
                to={`/berita?category=${encodeURIComponent(
                  article.category.slug
                )}`}
                className="text-accent hover:underline"
              >
                {article.category.name}
              </Link>
            </div>
          )}
        </div>

        <ArticleContent article={article} />

        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-serif font-bold mb-6 text-foreground">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewsDetailPage;
