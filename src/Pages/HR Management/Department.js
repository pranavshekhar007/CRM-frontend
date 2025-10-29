// src/pages/Departments/DepartmentList.jsx
import React, { useEffect, useState } from "react";
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

import { BsPencil, BsTrash } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { MdOutlineWorkOutline } from "react-icons/md";

import {
  getDepartmentListServ,
  addDepartmentServ,
  updateDepartmentServ,
  deleteDepartmentServ,
} from "../../services/department.services";

import { getBranchListServ } from "../../services/branch.services";

function DepartmentList() {
  const [list, setList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const { canView, canCreate, canUpdate, canDelete } =
      usePermission("Department");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    branch: "",
    description: "",
    status: true,
  });

  // Fetch departments
  const handleGetDepartments = async () => {
    setShowSkeleton(true);
    try {
      const res = await getDepartmentListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load departments");
    } finally {
      setShowSkeleton(false);
    }
  };

  // Fetch branches
  const handleGetBranches = async () => {
    try {
      const res = await getBranchListServ({ pageNo: 1, pageCount: 1000 });
      setBranches(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleGetDepartments();
    handleGetBranches();
  }, [payload]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingDepartment(null);
    setDepartmentForm({ name: "", branch: "", description: "", status: true });
    setShowModal(true);
  };

  const handleOpenEditModal = (department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name || "",
      branch: department.branch?._id || "",
      description: department.description || "",
      status: department.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setDepartmentForm({ name: "", branch: "", description: "", status: true });
  };

  // Form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDepartmentForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save department
  const handleSaveDepartment = async () => {
    if (!departmentForm.name || !departmentForm.branch) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingDepartment) {
        await updateDepartmentServ({ _id: editingDepartment._id, ...departmentForm });
        toast.success("Department updated successfully!");
      } else {
        await addDepartmentServ(departmentForm);
        toast.success("Department created successfully!");
      }
      handleCloseModal();
      handleGetDepartments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  // Delete
  const handleDeleteDepartment = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartmentServ(id);
        toast.success("Department deleted successfully!");
        handleGetDepartments();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete department");
      }
    }
  };

  const handleSort = (field) => {
    setPayload((prev) => ({
      ...prev,
      sortByField: field,
      sortByOrder: prev.sortByField === field && prev.sortByOrder === "asc" ? "desc" : "asc",
      pageNo: 1,
    }));
  };

  const startIndex = (payload.pageNo - 1) * payload.pageCount;
  const endIndex = Math.min(startIndex + payload.pageCount, totalRecords);
  const totalPages = Math.ceil(totalRecords / payload.pageCount);

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Hr Management" selectedItem="Department" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Department Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleOpenAddModal}
              >
                <RiAddLine size={20} className="me-1" />
                Add Department
              </button>
            )}
          </div>

          {/* Search */}
          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0">
            <div className="row g-2 align-items-center">
              <div className="col-lg-8 col-md-8">
                <div className="input-group">
                  <input
                    className="form-control"
                    placeholder="Search by Name or Branch..."
                    value={payload.searchKey}
                    onChange={(e) =>
                      setPayload({ ...payload, searchKey: e.target.value, pageNo: 1 })
                    }
                  />
                  <button
                    className="btn text-white px-4"
                    style={{ background: "#16A34A" }}
                    onClick={handleGetDepartments}
                  >
                    <FaSearch size={16} /> Search
                  </button>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 d-flex justify-content-end">
                <div className="d-flex align-items-center">
                  <span className="me-2 text-muted" style={{fontSize: '0.85rem'}}>Per Page:</span>
                  <select
                    className="form-select"
                    style={{ width: "auto" }}
                    value={payload.pageCount}
                    onChange={(e) =>
                      setPayload({ ...payload, pageCount: Number(e.target.value), pageNo: 1 })
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
                    <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                      Name <MdOutlineWorkOutline size={14} />
                    </th>
                    <th onClick={() => handleSort("branch")} style={{ cursor: "pointer" }}>
                      Branch <HiOutlineBuildingOffice2 size={14} />
                    </th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th className="text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton
                    ? Array.from({ length: payload.pageCount }).map((_, i) => (
                        <tr key={i}>
                          <td className="ps-4 py-3"><Skeleton width={20} /></td>
                          <td><Skeleton width={120} /></td>
                          <td><Skeleton width={100} /></td>
                          <td><Skeleton width={250} /></td>
                          <td><Skeleton width={60} /></td>
                          <td><Skeleton width={90} /></td>
                          <td><Skeleton width={90} /></td>
                        </tr>
                      ))
                    : list.length > 0
                    ? list.map((department, i) => (
                        <tr key={department._id}>
                          <td className="ps-4 py-3">{startIndex + i + 1}</td>
                          <td className="fw-semibold">{department.name}</td>
                          <td>{department.branch?.branchName || "—"}</td>
                          <td>{department.description || "—"}</td>
                          <td>
                            <span
                              className={`badge px-2 py-1 ${
                                department.status ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                              }`}
                            >
                              {department.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>{moment(department.createdAt).format("YYYY-MM-DD")}</td>
                          <td className="text-center pe-4">
                            <ActionButtons
                              // canView={canView}
                              canUpdate={canUpdate}
                              canDelete={canDelete}
                              onEdit={() => handleOpenEditModal(department)}
                              onDelete={() => handleDeleteDepartment(department._id)}
                            />
                          </td>
                        </tr>
                      ))
                    : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} departments
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${payload.pageNo === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPayload({ ...payload, pageNo: payload.pageNo - 1 })}>Previous</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${payload.pageNo === page ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPayload({ ...payload, pageNo: page })}>{page}</button>
                  </li>
                ))}
                <li className={`page-item ${payload.pageNo === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPayload({ ...payload, pageNo: payload.pageNo + 1 })}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Add/Edit Modal (reused BranchList style) */}
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
              style={{ width: 364, maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-end mb-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseModal}
                />
              </div>

              <h5 className="mb-4">{editingDepartment ? "Edit Department" : "Add Department"}</h5>

              <div className="mb-3">
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={departmentForm.name}
                  onChange={handleFormChange}
                  placeholder="Enter department name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Branch *</label>
                <select
                  name="branch"
                  className="form-select"
                  value={departmentForm.branch}
                  onChange={handleFormChange}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.branchName}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={departmentForm.description}
                  onChange={handleFormChange}
                ></textarea>
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  name="status"
                  className="form-check-input"
                  checked={departmentForm.status}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Active</label>
              </div>

              <button className="btn btn-success w-100 mt-3" onClick={handleSaveDepartment}>
                {editingDepartment ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentList;
