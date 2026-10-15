/**
 * @fileoverview ArticleTable — tabel artikel admin (sesuai mockup v2): judul dengan thumbnail
 * dan tag, kategori, status, tanggal, serta aksi pratinjau / sunting / hapus.
 * Tag dan lencana "Unggulan" dapat diklik untuk memfilter daftar.
 */
import React from "react";
import { Link } from "react-router-dom";
import { Eye, Image as ImageIcon, SquarePen, Trash2 } from "lucide-react";
import type { Article } from "../../types/articleTypes";
import { shortDate } from "../../hooks/useAdminSummary";

interface ArticleTableProps {
  articles: Article[];
  loading?: boolean;
  onDelete: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

const SkeletonRows: React.FC = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} aria-hidden="true">
        <td><div className="a-sk" style={{ width: "75%" }} /></td>
        <td className="a-hm"><div className="a-sk" style={{ width: "60%" }} /></td>
        <td><div className="a-sk" style={{ width: 56 }} /></td>
        <td className="a-hm"><div className="a-sk" style={{ width: 72 }} /></td>
        <td />
      </tr>
    ))}
  </>
);

const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  loading = false,
  onDelete,
  onTagClick,
}) => (
  <div className="a-tw">
    <table className="a-tbl">
      <thead>
        <tr>
          <th>Judul</th>
          <th className="a-hm">Kategori</th>
          <th>Status</th>
          <th className="a-hm">Tanggal</th>
          <th><span className="a-hm">Aksi</span></th>
        </tr>
      </thead>
      <tbody aria-busy={loading}>
        {loading ? (
          <SkeletonRows />
        ) : (
          articles.map((a) => {
            const tags = Array.isArray(a.tags) ? a.tags : [];
            return (
              <tr key={a.id}>
                <td>
                  <div className="a-tt">
                    <span className="a-th">
                      {a.coverImage ? (
                        <img src={a.coverImage} alt="" loading="lazy" />
                      ) : (
                        <ImageIcon size={18} />
                      )}
                    </span>
                    <div>
                      <b>{a.title}</b>
                      {tags.length > 0 && (
                        <button
                          type="button"
                          className="a-tagbtn"
                          title={tags.length > 1 ? `Tag: ${tags.join(", ")}` : `Filter tag ${tags[0]}`}
                          onClick={() => onTagClick?.(tags[0])}
                        >
                          #{tags[0]}
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="a-hm">{a.category?.name ?? "-"}</td>
                <td>
                  <span className={`a-b ${a.published ? "a-ok" : "a-wn"}`}>
                    {a.published ? "Terbit" : "Draf"}
                  </span>
                </td>
                <td className="a-hm">{shortDate(a.publishedDate ?? a.lastModified)}</td>
                <td>
                  <div className="a-acts">
                    <a
                      href={`/berita/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Pratinjau"
                      aria-label={`Pratinjau ${a.title}`}
                    >
                      <Eye size={18} />
                    </a>
                    <Link
                      to={`/atmin/articles/${a.id}/edit`}
                      title="Sunting"
                      aria-label={`Sunting ${a.title}`}
                    >
                      <SquarePen size={18} />
                    </Link>
                    <button
                      type="button"
                      className="a-x"
                      title="Hapus"
                      aria-label={`Hapus ${a.title}`}
                      onClick={() => onDelete(a.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

export default ArticleTable;
