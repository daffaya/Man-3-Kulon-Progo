/**
 * @fileoverview UserTable — tabel manajemen user (mockup v3): avatar + username + nama lengkap,
 * role (badge), tanggal dibuat, dan aksi sunting/hapus.
 */
import React from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { User } from "../../types/userTypes";
import { SkeletonRows } from "../admin/ListKit";
import { shortDate } from "../../hooks/useAdminSummary";

interface UserTableProps {
  users: User[];
  onDelete: (id: number) => void;
  onEdit: (user: User) => void;
  loading: boolean;
}

export const ROLE_INFO: Record<string, { label: string; cls: string }> = {
  super_admin: { label: "Super Admin", cls: "a-ok" },
  jurnalis: { label: "Jurnalis", cls: "a-in" },
  guru_bk: { label: "Guru BK", cls: "a-wn" },
  arsiparis: { label: "Arsiparis", cls: "a-z" },
  pengelola_bmn: { label: "Pengelola BMN", cls: "a-z" },
};

const UserTable: React.FC<UserTableProps> = ({ users, onDelete, onEdit, loading }) => (
  <div className="a-tw">
    <table className="a-tbl">
      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Dibuat</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody aria-busy={loading}>
        {loading ? (
          <SkeletonRows cols={4} />
        ) : (
          users.map((u) => {
            const r = ROLE_INFO[u.role.toLowerCase()] ?? { label: u.role, cls: "a-z" };
            return (
              <tr key={u.id}>
                <td>
                  <div className="a-tt" style={{ minWidth: 0 }}>
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt=""
                        width={28}
                        height={28}
                        style={{ borderRadius: "50%", objectFit: "cover", flex: "none" }}
                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                      />
                    ) : (
                      <span className="a-av">{u.username.charAt(0).toUpperCase()}</span>
                    )}
                    <div>
                      <b>{u.username}</b>
                      {u.full_name && <span className="a-tg">{u.full_name}</span>}
                    </div>
                  </div>
                </td>
                <td><span className={`a-b ${r.cls}`}>{r.label}</span></td>
                <td>{shortDate(u.created_at)}</td>
                <td>
                  <div className="a-acts">
                    <button type="button" title="Sunting" aria-label={`Sunting ${u.username}`} onClick={() => onEdit(u)}>
                      <SquarePen size={18} />
                    </button>
                    <button type="button" className="a-x" title="Hapus" aria-label={`Hapus ${u.username}`} onClick={() => onDelete(u.id)}>
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

export default UserTable;
