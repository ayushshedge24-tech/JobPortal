import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { AdminFilters } from "../../components/admin/AdminFilters";
import { RoleChangeModal } from "../../components/admin/RoleChangeModal";
import { UserStatusModal } from "../../components/admin/UserStatusModal";
import { Users, Shield, UserX, UserCheck, Eye, Edit } from "lucide-react";

export const AdminUsersPage = ({ defaultRole = "ALL", pageTitle = "User Directory" }) => {
  const { token, user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", role: defaultRole, isActive: "ALL" });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers({ ...filters, page }, token);
      if (res?.data) {
        setUsers(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadUsers(1);
  }, [token, filters.role, filters.isActive]);

  const handleRoleChangeConfirm = async (userId, newRole) => {
    setModalLoading(true);
    try {
      await api.updateAdminUserRole(userId, newRole, token);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setRoleModalUser(null);
    } catch (err) {
      alert(err.message || "Failed to update user role");
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChangeConfirm = async (userId, newStatus, reason) => {
    setModalLoading(true);
    try {
      await api.updateAdminUserStatus(userId, newStatus, reason, token);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: newStatus } : u))
      );
      setStatusModalUser(null);
    } catch (err) {
      alert(err.message || "Failed to update user status");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{pageTitle}</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Inspect user accounts, manage security roles, and enforce platform governance.
        </p>
      </div>

      <AdminFilters
        searchPlaceholder="Search by name, email, location..."
        searchValue={filters.q}
        onSearchChange={(q) => setFilters((f) => ({ ...f, q }))}
        onSearchSubmit={() => loadUsers(1)}
        onReset={() => setFilters({ q: "", role: defaultRole, isActive: "ALL" })}
      >
        {defaultRole === "ALL" && (
          <select
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
            className="input-field"
            style={{ fontSize: "0.85rem", minWidth: "140px" }}
          >
            <option value="ALL">All Roles</option>
            <option value="JOB_SEEKER">Candidates</option>
            <option value="RECRUITER">Recruiters</option>
            <option value="ADMIN">Administrators</option>
          </select>
        )}
        <select
          value={filters.isActive}
          onChange={(e) => setFilters((f) => ({ ...f, isActive: e.target.value }))}
          className="input-field"
          style={{ fontSize: "0.85rem", minWidth: "140px" }}
        >
          <option value="ALL">All Account States</option>
          <option value="true">Active Only</option>
          <option value="false">Deactivated Only</option>
        </select>
      </AdminFilters>

      <div className="card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading user records...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Users size={36} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
            <h3>No users found</h3>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Location & Contact</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <Link to={`/admin/users/${u._id}`} style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {u.name}
                    </Link>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === "ADMIN" ? "badge-purple" : u.role === "RECRUITER" ? "badge-blue" : "badge-gray"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`}>
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{u.location || "India"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.phone || "No phone"}</div>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "Recent"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <Link
                        to={`/admin/users/${u._id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Full Profile"
                        style={{ padding: "0.35rem 0.55rem" }}
                      >
                        <Eye size={13} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setRoleModalUser(u)}
                        className="btn btn-secondary btn-sm"
                        title="Change System Role"
                        style={{ padding: "0.35rem 0.55rem" }}
                      >
                        <Shield size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusModalUser(u)}
                        className="btn btn-secondary btn-sm"
                        title={u.isActive ? "Deactivate Account" : "Reactivate Account"}
                        style={{ padding: "0.35rem 0.55rem", color: u.isActive ? "var(--danger)" : "var(--success)" }}
                      >
                        {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Role Change Modal */}
      {roleModalUser && (
        <RoleChangeModal
          user={roleModalUser}
          onClose={() => setRoleModalUser(null)}
          onConfirm={handleRoleChangeConfirm}
          loading={modalLoading}
        />
      )}

      {/* User Status Modal */}
      {statusModalUser && (
        <UserStatusModal
          user={statusModalUser}
          onClose={() => setStatusModalUser(null)}
          onConfirm={handleStatusChangeConfirm}
          loading={modalLoading}
        />
      )}
    </div>
  );
};
