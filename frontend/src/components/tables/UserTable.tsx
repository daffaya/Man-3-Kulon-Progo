/**
 * @fileoverview UserTable component for displaying user data in a tabular format.
 * This component renders a table with user information including their avatar, name, role,
 * and creation date. It provides action buttons for editing and deleting users.
 */

import React from "react";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { User } from "../../types/userTypes";
import { formatDate } from "../../lib/utils";
import ImageWithFallback from "../ui/ImageWithFallback";

interface UserTableProps {
  users: User[];
  onDelete: (id: number) => void;
  onEdit: (user: User) => void;
  loading: boolean;
}

/**
 * Component that displays a visual badge for a user's role with appropriate color coding.
 * @param {string} role - The user's role string.
 */
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleMap: Record<string, { label: string; color: string }> = {
    super_admin: {
      label: "Super Admin",
      color:
        "bg-[rgb(var(--color-primary),0.1)] text-[rgb(var(--color-primary))]",
    },
    arsiparis: {
      label: "Arsiparis",
      color:
        "bg-[rgb(var(--color-accent),0.1)] text-[rgb(var(--color-accent))]",
    },
    pengelola_bmn: {
      label: "Pengelola BMN",
      color:
        "bg-[rgb(var(--color-success),0.1)] text-[rgb(var(--color-success))]",
    },
    guru_bk: {
      label: "Guru BK",
      color:
        "bg-[rgb(var(--color-warning),0.1)] text-[rgb(var(--color-warning))]",
    },
    jurnalis: {
      label: "Jurnalis",
      color: "bg-[rgb(var(--color-error),0.1)] text-[rgb(var(--color-error))]",
    },
  };

  const normalizedRole = role.toLowerCase();
  const roleInfo = roleMap[normalizedRole] || {
    label: role,
    color:
      "bg-[rgb(var(--color-secondary-button))] text-[rgb(var(--color-secondary))]",
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleInfo.color}`}
    >
      {roleInfo.label}
    </span>
  );
};

/**
 * Component that renders the Edit and Delete buttons for each user row.
 * @param {User} user - The user object.
 * @param {Function} onEdit - Callback for editing a user.
 * @param {Function} onDelete - Callback for deleting a user.
 */
const ActionButtons: React.FC<{
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}> = ({ user, onEdit, onDelete }) => (
  <div className="flex justify-end space-x-2">
    <button
      onClick={() => onEdit(user)}
      className="text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-hover))]"
      aria-label="Edit user"
      title="Edit user"
    >
      <Edit size={18} />
    </button>
    <button
      onClick={() => onDelete(user.id)}
      className="text-[rgb(var(--color-error))] hover:text-[rgb(var(--color-error)),0.8]"
      aria-label="Delete user"
      title="Delete user"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

/**
 * Component that displays a table of users for the admin panel.
 * Filters out any user with username "kuma" from the list.
 * @param {User[]} users - The array of users to display.
 * @param {Function} onDelete - Callback when a user is deleted.
 * @param {Function} onEdit - Callback when a user is edited.
 * @param {boolean} loading - Indicates whether user data is being loaded.
 */
const UserTable: React.FC<UserTableProps> = ({
  users = [],
  onDelete,
  onEdit,
  loading,
}) => {
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => user.username !== "kuma")
    : [];

  if (loading) {
    return (
      <div className="card p-8 min-h-[200px] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-accent))]"></div>
        <p className="mt-4 text-secondary">Loading users...</p>
      </div>
    );
  }

  if (!Array.isArray(users)) {
    console.error("Invalid user data:", users);
    return (
      <div className="card p-12 text-center">
        <h3 className="text-xl font-medium text-foreground mt-4">
          Error loading users.
        </h3>
        <p className="text-secondary mt-2">Please try again later.</p>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="card p-12 text-center">
        <UserPlus size={48} className="mx-auto text-secondary" />
        <h3 className="text-xl font-medium text-foreground mt-4">
          No users found.
        </h3>
        <p className="text-secondary mt-2">Create a new user to get started.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden border-none  ">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-[rgb(var(--color-semi-background))]">
          <tr>
            {["User", "Role", "Created At", "Actions"].map((header) => (
              <th
                key={header}
                className={`px-6 py-3 ${
                  header === "Actions" ? "text-right" : "text-left"
                } text-xs font-medium text-secondary uppercase tracking-wider`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-800">
          {filteredUsers.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-[rgb(var(--color-secondary-hover))]"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <ImageWithFallback
                      src={user.avatar || "/logo.png"}
                      alt={user.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-foreground">
                      {user.username}
                    </div>
                    <div className="text-sm text-secondary">
                      {user.full_name}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <RoleBadge role={user.role} />
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                {formatDate(user.created_at)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <ActionButtons
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
