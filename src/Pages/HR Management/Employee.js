import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";
import { usePermission } from "../../hooks/usePermission";
import ActionButtons from "../../Components/ActionButtons";

// Icons
import { BsPencil, BsTrash, BsEye, BsLock } from "react-icons/bs";
import { FaEye, FaEyeSlash, FaKey, FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";
import { MdOutlineFileCopy } from "react-icons/md";
import { IoGridOutline } from "react-icons/io5";
import { HiOutlineDotsVertical } from "react-icons/hi";

// --- SERVICE IMPORTS ---
import {
  getEmployeeListServ,
  deleteEmployeeServ,
  resetEmployeePasswordServ,
} from "../../services/employee.services";

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

function EmployeeList() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(true); // Set to true initially for loading
  // const [showModal, setShowModal] = useState(false); // Not needed for this scope

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetForm, setResetForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "dateOfJoining",
    sortByOrder: "desc",
  });

  /**
   * API CALL: Fetch Employee List
   */
  const handleGetEmployees = async () => {
    setShowSkeleton(true);
    try {
      // Use your actual service call
      const res = await getEmployeeListServ(payload);
      // Assuming the API response structure is: { data: { data: [...employees], total: N } }
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      console.error("Employee list fetch error:", err);
      toast.error(err?.response?.data?.message || "Failed to load employees.");
      setList([]);
      setTotalRecords(0);
    } finally {
      setShowSkeleton(false);
    }

    /* --- OLD DUMMY DATA SIMULATION (REMOVED) --- */
  };

  /**
   * API CALL: Delete Employee
   */
  const handleDeleteEmployee = async (employeeId, fullName) => {
    if (
      !window.confirm(`Are you sure you want to delete employee: ${fullName}?`)
    ) {
      return;
    }

    try {
      await deleteEmployeeServ(employeeId);
      toast.success(`${fullName} deleted successfully!`);
      // Refresh the list after successful deletion
      handleGetEmployees();
    } catch (err) {
      console.error("Employee delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete employee.");
    }
  };

  useEffect(() => {
    handleGetEmployees();
  }, [
    payload.pageNo,
    payload.pageCount,
    payload.sortByOrder,
    payload.sortByField,
  ]);

  // Handler for search button click (resets to page 1)
  const handleSearch = () => {
    if (payload.pageNo !== 1) {
      setPayload((prev) => ({ ...prev, pageNo: 1 }));
    } else {
      handleGetEmployees();
    }
  };

  // ... (handleSort, handleAddEmployeeClick, startIndex, endIndex, etc. remain the same)

  const handleSort = (field) => {
    setPayload((prev) => ({
      ...prev,
      sortByField: field,
      sortByOrder:
        prev.sortByField === field && prev.sortByOrder === "asc"
          ? "desc"
          : "asc",
      pageNo: 1,
    }));
  };

  const handleAddEmployeeClick = () => {
    navigate("/create-employee");
  };

  const startIndex = (payload.pageNo - 1) * payload.pageCount;
  const endIndex = Math.min(startIndex + payload.pageCount, totalRecords);
  const totalPages = Math.ceil(totalRecords / payload.pageCount);

  const getStatusBadge = (status) => {
    const isActive = status === "Active";
    const color = isActive ? "#16A34A" : "#F59E0B";
    const backgroundColor = isActive
      ? "rgba(22, 163, 74, 0.15)"
      : "rgba(245, 158, 11, 0.15)";
    const text = isActive ? "Active" : "Inactive";

    return (
      <span
        className="badge fw-semibold"
        style={{
          backgroundColor: backgroundColor,
          color: color,
          padding: "0.3rem 0.6rem",
          borderRadius: "0.4rem",
          fontSize: "0.8rem",
        }}
      >
        {text}
      </span>
    );
  };

  const getRandomColor = (id) => {
    const colors = ["#38BDF8", "#4ADE80", "#F97316", "#8B5CF6", "#F472B6"];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
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
      await resetEmployeePasswordServ({
        employeeId: resetUser._id,
        newPassword: resetForm.newPassword,
        confirmPassword: resetForm.confirmPassword,
      });
      toast.success(`Password reset for ${resetUser.fullName}`);
      handleCloseResetModal();
    } catch (err) {
      toast.error(err?.message || "Failed to reset password");
    }
  };

  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Employee");

  // The actual JSX render
  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Hr Management" selectedItem="Employee" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Employee Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleAddEmployeeClick}
              >
                <RiAddLine size={20} className="me-1" />
                Add Employee
              </button>
            )}
          </div>

          {/* Search Bar & Controls */}
          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0">
            <div className="row g-2 align-items-center">
              <div className="col-lg-7 col-md-7">
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
                    style={{
                      background: "#16A34A",
                      borderRadius: "0 0.5rem 0.5rem 0",
                    }}
                    onClick={handleSearch}
                  >
                    <FaSearch size={16} /> Search
                  </button>
                </div>
              </div>

              <div className="col-lg-5 col-md-5 d-flex justify-content-end align-items-center">
                {/* <button className="btn btn-outline-secondary me-3 d-flex align-items-center">
                  <HiOutlineDotsVertical className="me-1" /> Filters
                </button> */}

                {/* View Toggles (Table/Grid) */}
                {/* <button
                    className="btn btn-outline-secondary me-3"
                    style={{ background: '#F8FAFC', color: '#16A34A', borderColor: '#16A34A'}}
                >
                    <MdOutlineFileCopy size={18} />
                </button> */}
                {/* <button
                    className="btn btn-outline-secondary me-3"
                >
                    <IoGridOutline size={18} />
                </button> */}

                <div className="d-flex align-items-center">
                  <span
                    className="me-2 text-muted"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Per Page:
                  </span>
                  <select
                    className="form-select"
                    style={{ width: "auto" }}
                    value={payload.pageCount}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        pageCount: Number(e.target.value),
                        pageNo: 1,
                      })
                    }
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="ps-4">#</th>
                    <th
                      onClick={() => handleSort("fullName")}
                      style={{ cursor: "pointer", width: "20%" }}
                    >
                      Name
                    </th>
                    <th
                      onClick={() => handleSort("employeeId")}
                      style={{ cursor: "pointer" }}
                    >
                      Employee ID
                    </th>
                    <th
                      onClick={() => handleSort("department.name")}
                      style={{ cursor: "pointer" }}
                    >
                      Department
                    </th>
                    <th
                      onClick={() => handleSort("designation.name")}
                      style={{ cursor: "pointer" }}
                    >
                      Designation
                    </th>
                    <th
                      onClick={() => handleSort("employmentStatus")}
                      style={{ cursor: "pointer" }}
                    >
                      Status
                    </th>
                    <th
                      onClick={() => handleSort("dateOfJoining")}
                      style={{ cursor: "pointer" }}
                    >
                      Joined
                    </th>
                    <th className="text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton ? (
                    /* Skeleton rows */
                    Array.from({ length: payload.pageCount }).map((_, i) => (
                      <tr key={i}>
                        <td className="ps-4 py-3">
                          <Skeleton width={20} />
                        </td>
                        <td>
                          <Skeleton width={200} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={100} />
                        </td>
                        <td>
                          <Skeleton width={100} />
                        </td>
                        <td>
                          <Skeleton width={60} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td className="text-center">
                          <Skeleton width={120} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((employee, i) => (
                      <tr key={employee._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">
                          <div className="d-flex align-items-center">
                            {/* Avatar/Initials */}
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                              style={{
                                width: "38px",
                                height: "38px",
                                fontSize: "14px",
                                backgroundColor: getRandomColor(
                                  employee.fullName
                                ),
                              }}
                            >
                              {getInitials(employee.fullName)}
                            </div>
                            <div>
                              {employee.fullName}
                              <div
                                className="text-muted"
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: "normal",
                                }}
                              >
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{employee.employeeId}</td>
                        <td>{employee.department?.name || "N/A"}</td>
                        <td>{employee.designation?.name || "N/A"}</td>
                        <td>{getStatusBadge(employee.employmentStatus)}</td>
                        <td>
                          {moment(employee.dateOfJoining).format("YYYY-MM-DD")}
                        </td>
                        <td className="text-center pe-4">
                          {canView && (
                            <BsEye
                              size={18}
                              className="mx-1 text-primary"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                toast.info(`View ${employee.fullName}`)
                              }
                            />
                          )}
                          {canUpdate && (
                            <BsPencil
                              size={18}
                              className="mx-1 text-warning"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                navigate(`/edit-employee/${employee._id}`)
                              }
                            />
                          )}
                          {canUpdate && (
                            <FaKey
                              size={18}
                              className="mx-2"
                              title="Reset Password"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleOpenResetModal(employee)}
                            />
                          )}
                          {canDelete && (
                            <BsTrash
                              size={18}
                              className="mx-1 text-danger"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                handleDeleteEmployee(
                                  employee._id,
                                  employee.fullName
                                )
                              }
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <NoRecordFound />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Showing {startIndex + 1} to {endIndex} of {totalRecords} employees
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${
                    payload.pageNo === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setPayload({ ...payload, pageNo: payload.pageNo - 1 })
                    }
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        payload.pageNo === page ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPayload({ ...payload, pageNo: page })}
                      >
                        {page}
                      </button>
                    </li>
                  )
                )}
                <li
                  className={`page-item ${
                    payload.pageNo === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setPayload({ ...payload, pageNo: payload.pageNo + 1 })
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
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

export default EmployeeList;
