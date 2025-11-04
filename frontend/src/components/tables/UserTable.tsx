// frontend/src/components/tables/UserTable.tsx
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
 * Component: RoleBadge
 * --------------------
 * Displays a visual badge for a user's role with appropriate color coding.
 *
 * @param role - The user's role string.
 */
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleMap: Record<string, { label: string; color: string }> = {
    super_admin: {
      label: "Super Admin",
      color:
        "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
    },
    arsiparis: {
      label: "Arsiparis",
      color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    },
    pengelola_bmn: {
      label: "Pengelola BMN",
      color:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    },
    guru_bk: {
      label: "Guru BK",
      color:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    },
    jurnalis: {
      label: "Jurnalis",
      color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    },
  };

  const normalizedRole = role.toLowerCase();
  const roleInfo = roleMap[normalizedRole] || {
    label: role,
    color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
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
 * Component: ActionButtons
 * ------------------------
 * Renders the Edit and Delete buttons for each user row.
 *
 * @param user - The user object.
 * @param onEdit - Callback for editing a user.
 * @param onDelete - Callback for deleting a user.
 */
const ActionButtons: React.FC<{
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}> = ({ user, onEdit, onDelete }) => (
  <div className="flex justify-end space-x-2">
    <button
      onClick={() => onEdit(user)}
      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      aria-label="Edit user"
      title="Edit user"
    >
      <Edit size={18} />
    </button>
    <button
      onClick={() => onDelete(user.id)}
      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
      aria-label="Delete user"
      title="Delete user"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

/**
 * Component: UserTable
 * --------------------
 * Displays a table of users for the admin panel.
 * Filters out any user with username "kuma" from the list.
 *
 * @param users - The array of users to display.
 * @param onDelete - Callback when a user is deleted.
 * @param onEdit - Callback when a user is edited.
 * @param loading - Indicates whether user data is being loaded.
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 relative min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 absolute bottom-4">
          Loading users...
        </p>
      </div>
    );
  }

  if (!Array.isArray(users)) {
    console.error("Invalid user data:", users);
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mt-4">
          Error loading users.
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          Please try again later.
        </p>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <UserPlus size={48} className="mx-auto text-gray-400" />
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mt-4">
          No users found.
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          Create a new user to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 relative">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {["User", "Role", "Created At", "Actions"].map((header) => (
              <th
                key={header}
                className={`px-6 py-3 ${
                  header === "Actions" ? "text-right" : "text-left"
                } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
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
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.full_name}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <RoleBadge role={user.role} />
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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
