import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";
import { BsPencil, BsTrash } from "react-icons/bs";
import { RiAddLine } from "react-icons/ri";
import { FaKey } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
  getAdminList,
  deleteAdmin,
  createAdmin,
  updateAdmin,
  resetAdminPassword,
} from "../../services/authentication.services";
import { getRoleListServ } from "../../services/role.services";

// User avatar component
const UserAvatar = ({ name = "" }) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const initials = parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
  const colors = ["#F0F5FF", "#EAF7EC", "#FFF7EB", "#FFFBEB", "#E0E7FF"];
  const textColors = ["#3B82F6", "#16A34A", "#D97706", "#EA580C", "#4F46E5"];
  const idx = initials.charCodeAt(0) % colors.length;

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: colors[idx],
        color: textColors[idx],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: 14,
      }}
    >
      {initials}
    </div>
  );
};

function UsersList() {
  const [list, setList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "",
    sortByOrder: "asc",
  });

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: true,
    password: "",
    confirmPassword: "",
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetForm, setResetForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRoleListServ({ pageNo: 1, pageCount: 100 });
        setRoles(res?.data?.data || []);
      } catch (err) {
        toast.error("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, []);

  // Fetch users
  const handleGetUsers = async () => {
    setShowSkeleton(true);
    try {
      const res = await getAdminList(payload);
      if (res?.data && Array.isArray(res.data)) {
        setList(res.data);
        setTotalRecords(res?.documentCount?.totalCount || res.data.length);
      } else {
        setList([]);
        setTotalRecords(0);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load users");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetUsers();
  }, [payload]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteAdmin(id);
      toast.success("User deleted successfully!");
      handleGetUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to delete user");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role?._id || "",
      status: user.status,
      password: "",
      confirmPassword: "",
    });
    setShowModal(true);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setUserForm({
      name: "",
      email: "",
      phone: "",
      role: "",
      status: true,
      password: "",
      confirmPassword: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setUserForm({
      name: "",
      email: "",
      phone: "",
      role: "",
      status: true,
      password: "",
      confirmPassword: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked : value,
    }));
  };

  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.role) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!editingUser && (!userForm.password || !userForm.confirmPassword)) {
      toast.error("Please fill password fields.");
      return;
    }

    if (!editingUser && userForm.password !== userForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      if (editingUser) {
        await updateAdmin(editingUser._id, userForm);
        toast.success("User updated successfully!");
      } else {
        await createAdmin(userForm);
        toast.success("User added successfully!");
      }
      handleCloseModal();
      handleGetUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to save user");
    }
  };

  const handleOpenResetModal = (user) => {
    setResetUser(user);
    setResetForm({ newPassword: "", confirmPassword: "" });
    setShowResetModal(true);
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setResetUser(null);
    setResetForm({ newPassword: "", confirmPassword: "" });
  };

  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveResetPassword = async () => {
    if (!resetForm.newPassword || !resetForm.confirmPassword) {
      return toast.error("Please fill all fields.");
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      await resetAdminPassword({
        adminId: resetUser._id,
        newPassword: resetForm.newPassword,
        confirmPassword: resetForm.confirmPassword,
      });
      toast.success(`Password reset for ${resetUser.name}`);
      handleCloseResetModal();
    } catch (err) {
      toast.error(err?.message || "Failed to reset password");
    }
  };

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Staff" selectedItem="User" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Users Management</h3>
            <button
              className="btn text-white px-3"
              style={{
                background: "#16A34A",
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                borderRadius: "0.5rem",
              }}
              onClick={handleOpenAddModal}
            >
              <RiAddLine size={20} className="me-1" />
              Add User
            </button>
          </div>

          {/* Search */}
          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0">
            <div className="row g-2 align-items-center">
              <div className="col-lg-5 col-md-12">
                <div className="input-group">
                  <input
                    className="form-control"
                    placeholder="Search..."
                    value={payload.searchKey}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        searchKey: e.target.value,
                        pageNo: 1,
                      })
                    }
                  />
                  <button
                    className="btn text-white px-4"
                    style={{ background: "#16A34A" }}
                    onClick={handleGetUsers}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card shadow-sm p-0 rounded-3 border-0 overflow-hidden">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr
                      style={{
                        background: "#F8FAFC",
                        color: "#6B7280",
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      <th className="py-3 ps-4">#</th>
                      <th className="py-3 text-start">Name</th>
                      <th className="py-3 text-start">Role</th>
                      <th className="py-3 text-start">Joined</th>
                      <th className="py-3 text-center pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showSkeleton ? (
                      Array.from({ length: payload.pageCount }).map((_, i) => (
                        <tr key={i}>
                          <td className="ps-4 py-3">
                            <Skeleton width={20} />
                          </td>
                          <td className="py-3">
                            <Skeleton width={150} />
                          </td>
                          <td className="py-3">
                            <Skeleton width={70} />
                          </td>
                          <td className="py-3">
                            <Skeleton width={90} />
                          </td>
                          <td className="text-center">
                            <Skeleton width={100} />
                          </td>
                        </tr>
                      ))
                    ) : list.length > 0 ? (
                      list.map((u, i) => (
                        <tr key={u._id}>
                          <td className="ps-4 py-3">
                            {(payload.pageNo - 1) * payload.pageCount + i + 1}
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <UserAvatar name={u?.name} />
                              <div className="ms-3">
                                <div className="fw-semibold">{u?.name}</div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: 13 }}
                                >
                                  {u?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span
                              className="badge rounded-pill px-3 py-2"
                              style={{
                                background: "#E0E7FF",
                                color: "#3B82F6",
                                fontWeight: 600,
                              }}
                            >
                              {u?.role?.name || "—"}
                            </span>
                          </td>
                          <td className="py-3 text-muted">
                            {u?.createdAt
                              ? moment(u.createdAt).format("YYYY-MM-DD")
                              : "—"}
                          </td>
                          <td className="text-center">
                            <BsPencil
                              size={18}
                              className="mx-2 text-warning"
                              title="Edit"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleEditUser(u)}
                            />
                            <FaKey
                              size={18}
                              className="mx-2"
                              title="Reset Password"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleOpenResetModal(u)}
                            />
                            <BsTrash
                              size={18}
                              className="mx-2 text-danger"
                              title="Delete"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleDeleteUser(u._id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <NoRecordFound />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              overflowY: "auto",
              padding: "1rem",
            }}
          >
            <div
              className="modal-content p-4 rounded-4 bg-white"
              style={{
                width: 364,
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div className="d-flex justify-content-end mb-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseModal}
                />
              </div>

              <h5 className="mb-4">{editingUser ? "Edit User" : "Add User"}</h5>

              {/* Name */}
              <div className="mb-3">
                <label className="form-label mb-1 text-muted fw-normal">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleFormChange}
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label mb-1 text-muted fw-normal">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleFormChange}
                />
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label mb-1 text-muted fw-normal">
                  Phone <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  name="phone"
                  value={userForm.phone || ""}
                  onChange={handleFormChange}
                />
              </div>

              {/* Password & Confirm Password only for Add */}
              {!editingUser && (
                <>
                  <div className="mb-3">
                    <label className="form-label mb-1 text-muted fw-normal">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      name="password"
                      value={userForm.password || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label mb-1 text-muted fw-normal">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      name="confirmPassword"
                      value={userForm.confirmPassword || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                </>
              )}

              {/* Role */}
              <div className="mb-3">
                <label className="form-label mb-1 text-muted fw-normal">
                  Role <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  name="role"
                  value={userForm.role}
                  onChange={handleFormChange}
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="mb-3">
                <label className="form-label mb-1 text-muted fw-normal">
                  Status
                </label>
                <select
                  className="form-control"
                  name="status"
                  value={userForm.status}
                  onChange={handleFormChange}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveUser}
              >
                {editingUser ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3000,
              overflowY: "auto",
              padding: "1rem",
            }}
          >
            <div
              className="modal-content p-4 rounded-4 bg-white"
              style={{
                width: 364,
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div className="d-flex justify-content-end mb-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseResetModal}
                />
              </div>

              <h5 className="mb-4">Reset Password for {resetUser?.name}</h5>

              {/* New Password */}
              <div className="mb-3 position-relative">
                <label className="form-label mb-1 text-muted fw-normal">
                  New Password <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type={showNewPass ? "text" : "password"}
                  name="newPassword"
                  value={resetForm.newPassword}
                  onChange={handleResetPasswordChange}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 34,
                    cursor: "pointer",
                    color: "#6B7280",
                  }}
                  onClick={() => setShowNewPass((prev) => !prev)}
                >
                  {showNewPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Confirm Password */}
              <div className="mb-3 position-relative">
                <label className="form-label mb-1 text-muted fw-normal">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type={showConfirmPass ? "text" : "password"}
                  name="confirmPassword"
                  value={resetForm.confirmPassword}
                  onChange={handleResetPasswordChange}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 34,
                    cursor: "pointer",
                    color: "#6B7280",
                  }}
                  onClick={() => setShowConfirmPass((prev) => !prev)}
                >
                  {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveResetPassword}
              >
                Reset Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersList;
