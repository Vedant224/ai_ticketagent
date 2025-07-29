import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", "),
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/update-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editingUser,
            role: formData.role,
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || "Failed to update user");
        return;
      }

      setEditingUser(null);
      setFormData({ role: "", skills: "" });
      fetchUsers();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter((user) => user.email.toLowerCase().includes(query))
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-base-200 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-200">Admin Panel</h1>
        <button
          className="btn btn-outline btn-secondary"
          onClick={() => window.location.href = '/'}
        >
          ← Back to Home
        </button>
      </div>
      <div className="mb-8">
        <input
          type="text"
          className="input input-bordered w-full text-lg"
          placeholder="Search users by email..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="space-y-6">
        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            <span className="text-2xl">No users found.</span>
          </div>
        )}
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-white dark:bg-base-100 shadow-lg rounded-xl p-6 border border-base-300 transition hover:scale-[1.01] hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold text-lg text-primary-content">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Current Role:</strong> {user.role}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Skills:</strong> {user.skills && user.skills.length > 0 ? user.skills.join(", ") : "N/A"}
                </p>
              </div>
              {editingUser === user.email ? (
                <div className="mt-4 space-y-2 w-full md:w-1/2">
                  <select
                    className="select select-bordered w-full"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Comma-separated skills"
                    className="input input-bordered w-full"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn bg-slate-200 font-bold btn-sm text-zinc-800 mt-2"
                  onClick={() => handleEditClick(user)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
