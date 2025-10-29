// src/pages/Branches/BranchList.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";

import { BsPencil, BsTrash, BsEye } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";

import {
  getBranchListServ,
  addBranchServ,
  updateBranchServ,
  deleteBranchServ,
} from "../../services/branch.services";
import { usePermission } from "../../hooks/usePermission";
import ActionButtons from "../../Components/ActionButtons";

function BranchList() {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "",
    sortOrder: "asc",
  });

  const [branchForm, setBranchForm] = useState({
    branchName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    email: "",
    phone: "",
    status: true,
  });

  // ✅ Fetch Branch List
  const handleGetBranches = async () => {
    setShowSkeleton(true);
    try {
      const res = await getBranchListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.documentCount?.totalCount || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load branches");
    }
    setShowSkeleton(false);
  };

  useEffect(() => {
    handleGetBranches();
  }, [payload]);

  // ✅ Modal Handlers
  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setBranchForm({
      branchName: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
      email: "",
      phone: "",
      status: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      branchName: branch.branchName || "",
      address: branch.address || "",
      city: branch.city || "",
      state: branch.state || "",
      country: branch.country || "",
      zipcode: branch.zipcode || "",
      email: branch.email || "",
      phone: branch.phone || "",
      status: branch.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBranch(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBranchForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Save (Create / Update)
  const handleSaveBranch = async () => {
    if (!branchForm.branchName || !branchForm.city || !branchForm.country) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      if (editingBranch) {
        const res = await updateBranchServ({
          _id: editingBranch._id,
          ...branchForm,
        });
        toast.success(res?.data?.message || "Branch updated successfully!");
      } else {
        const res = await addBranchServ(branchForm);
        toast.success(res?.data?.message || "Branch added successfully!");
      }
      handleCloseModal();
      handleGetBranches();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed.");
    }
  };

  // ✅ Delete Branch
  const handleDeleteBranch = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        const res = await deleteBranchServ(id);
        toast.success(res?.data?.message || "Branch deleted successfully!");
        handleGetBranches();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete branch.");
      }
    }
  };

  // ✅ Sorting
  const handleSort = (field) => {
    setPayload((prev) => ({
      ...prev,
      sortByField: field,
      sortOrder:
        prev.sortByField === field && prev.sortOrder === "asc" ? "desc" : "asc",
      pageNo: 1,
    }));
  };

  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Branches");

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Hr Management" selectedItem="Branches" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Branch Management</h3>
            {canCreate && (
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
                Add Branch
              </button>
            )}
          </div>

          {/* Search */}
          <div className="card shadow-sm p-3 mb-4 border-0 rounded-3">
            <div className="row g-2 align-items-center">
              <div className="col-lg-8 col-md-8">
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
                    onClick={handleGetBranches}
                  >
                    <FaSearch size={16} /> Search
                  </button>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 d-flex justify-content-end">
                <div className="d-flex align-items-center">
                  <span className="me-2 text-muted">Per Page:</span>
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

          {/* Branch Table */}
          <div className="card shadow-sm p-0 rounded-3 border-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr style={{ background: "#F8FAFC", color: "#6B7280" }}>
                    <th className="py-3 ps-4">#</th>
                    <th
                      className="py-3 cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Name
                    </th>
                    <th className="py-3">Address</th>
                    <th className="py-3">Contact</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Created At</th>
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
                          <Skeleton width={100} />
                        </td>
                        <td className="py-3">
                          <Skeleton width={200} />
                        </td>
                        <td className="py-3">
                          <Skeleton width={150} />
                        </td>
                        <td className="py-3">
                          <Skeleton width={60} />
                        </td>
                        <td className="py-3">
                          <Skeleton width={90} />
                        </td>
                        <td className="py-3 text-center">
                          <Skeleton width={90} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((branch, i) => (
                      <tr key={branch._id}>
                        <td className="ps-4 py-3">
                          {(payload.pageNo - 1) * payload.pageCount + i + 1}
                        </td>
                        <td className="py-3 fw-semibold text-dark">
                          {branch.branchName}
                        </td>
                        <td className="py-3 text-muted">
                          {branch.address}, {branch.city}, {branch.state},{" "}
                          {branch.country}
                        </td>
                        <td className="py-3 text-muted">
                          <div>{branch.phone}</div>
                          <div>{branch.contactEmail}</div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`badge px-2 py-1 ${
                              branch.status
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            }`}
                          >
                            {branch.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 text-muted">
                          {moment(branch.createdAt).format("YYYY-MM-DD")}
                        </td>
                        <td className="py-3 text-center">
                          {canUpdate && (
                            <BsPencil
                              size={18}
                              className="mx-2 text-warning"
                              title="Edit"
                              onClick={() => handleOpenEditModal(branch)}
                            />
                          )}
                          {canDelete && (
                            <BsTrash
                              size={18}
                              className="mx-2 text-danger"
                              title="Delete"
                              onClick={() => handleDeleteBranch(branch._id)}
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        <NoRecordFound />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
              style={{ width: 364, maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-end mb-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseModal}
                />
              </div>

              <h5 className="mb-4">
                {editingBranch ? "Edit Branch" : "Add Branch"}
              </h5>

              {[
                { name: "branchName", label: "Branch Name *" },
                { name: "address", label: "Address" },
                { name: "city", label: "City *" },
                { name: "state", label: "State/Province" },
                { name: "country", label: "Country *" },
                { name: "zipcode", label: "ZIP/Postal Code" },
                { name: "phone", label: "Contact Phone" },
                { name: "email", label: "Contact Email" },
              ].map((field) => (
                <div className="mb-3" key={field.name}>
                  <label className="form-label mb-1 text-muted fw-normal">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name={field.name}
                    value={branchForm[field.name]}
                    onChange={handleFormChange}
                  />
                </div>
              ))}

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="status"
                  name="status"
                  checked={branchForm.status}
                  onChange={handleFormChange}
                />
                <label className="form-check-label" htmlFor="status">
                  Active
                </label>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveBranch}
              >
                {editingBranch ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BranchList;
