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

import { FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";
import { MdOutlineDateRange, MdPolicy } from "react-icons/md";
import { BsArrowRepeat } from "react-icons/bs";
import { GoChecklist } from "react-icons/go";

import {
  getLeavePolicyListServ,
  addLeavePolicyServ,
  updateLeavePolicyServ,
  deleteLeavePolicyServ,
} from "../../services/leavePolicy.services";

import { getLeaveTypeListServ } from "../../services/leaveType.services"; // Import to fetch Leave Types for the dropdown

function LeavePolicies() {
  const [list, setList] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]); // State for Leave Type dropdown
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  // Assuming 'Leave Policy' is the permission key
  const { canView, canCreate, canUpdate, canDelete } = usePermission("Leave Policies");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  const [policyForm, setPolicyForm] = useState({
    name: "",
    description: "",
    leaveType: "", // Will hold LeaveType ID
    accuralType: "Yearly", // Default value
    accuralRate: "",
    carryForwardLimit: 0,
    minDaysPerApplication: 1,
    maxDaysPerApplication: "",
    requiresApproval: true,
    status: true,
  });

  // Fetch Policy list
  const handleGetLeavePolicies = async () => {
    setShowSkeleton(true);
    try {
      const res = await getLeavePolicyListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load leave policies");
    } finally {
      setShowSkeleton(false);
    }
  };

  // Fetch Leave Types for the dropdown
  const handleGetLeaveTypes = async () => {
    try {
      // Fetch all leave types needed for the dropdown
      const res = await getLeaveTypeListServ({ pageNo: 1, pageCount: 1000 });
      setLeaveTypes(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to load leave types:", err);
    }
  };

  useEffect(() => {
    handleGetLeavePolicies();
    handleGetLeaveTypes();
  }, [payload]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingPolicy(null);
    setPolicyForm({
      name: "",
      description: "",
      leaveType: "",
      accuralType: "Yearly",
      accuralRate: "",
      carryForwardLimit: 0,
      minDaysPerApplication: 1,
      maxDaysPerApplication: "",
      requiresApproval: true,
      status: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (policy) => {
    setEditingPolicy(policy);
    setPolicyForm({
      name: policy.name || "",
      description: policy.description || "",
      // Map the nested object to just the ID for the dropdown
      leaveType: policy.leaveType?._id || "", 
      accuralType: policy.accuralType || "Yearly",
      accuralRate: policy.accuralRate || "",
      carryForwardLimit: policy.carryForwardLimit || 0,
      minDaysPerApplication: policy.minDaysPerApplication || 1,
      maxDaysPerApplication: policy.maxDaysPerApplication || "",
      requiresApproval: policy.requiresApproval,
      status: policy.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPolicy(null);
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPolicyForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save/Update policy
  const handleSavePolicy = async () => {
    if (!policyForm.name || !policyForm.leaveType || !policyForm.accuralRate || !policyForm.maxDaysPerApplication) {
      toast.error("Please fill all required fields: Name, Leave Type, Accural Rate, and Max Days.");
      return;
    }

    // Ensure numeric fields are correctly typed
    const dataToSend = {
        ...policyForm,
        accuralRate: Number(policyForm.accuralRate),
        carryForwardLimit: Number(policyForm.carryForwardLimit),
        minDaysPerApplication: Number(policyForm.minDaysPerApplication),
        maxDaysPerApplication: Number(policyForm.maxDaysPerApplication),
    };

    try {
      if (editingPolicy) {
        await updateLeavePolicyServ({ _id: editingPolicy._id, ...dataToSend });
        toast.success("Leave Policy updated successfully! 🎉");
      } else {
        await addLeavePolicyServ(dataToSend);
        toast.success("Leave Policy created successfully! ✨");
      }
      handleCloseModal();
      setPayload(prev => ({ ...prev, pageNo: 1 }));
      handleGetLeavePolicies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed.");
    }
  };

  // Delete
  const handleDeletePolicy = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave policy?")) {
      try {
        await deleteLeavePolicyServ(id);
        toast.success("Leave Policy deleted successfully! 🗑️");
        handleGetLeavePolicies();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete policy");
      }
    }
  };

  // Utility badge functions
  const getStatusBadge = (status) =>
    status ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger";
  
  const getApprovalBadge = (required) =>
    required ? "bg-warning-subtle text-warning" : "bg-info-subtle text-info";

  const getApprovalText = (required) =>
    required ? "Required" : "Not Required";

  // Sort handler
  const handleSort = (field) => {
    setPayload((prev) => ({
      ...prev,
      sortByField: field,
      sortByOrder: prev.sortByField === field && prev.sortByOrder === "asc" ? "desc" : "asc",
      pageNo: 1,
    }));
  };

  // Pagination calculation
  const startIndex = (payload.pageNo - 1) * payload.pageCount;
  const endIndex = Math.min(startIndex + payload.pageCount, totalRecords);
  const totalPages = Math.ceil(totalRecords / payload.pageCount);

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Leave Management" selectedItem="Leave Policies" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Leave Policy Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleOpenAddModal}
              >
                <RiAddLine size={20} className="me-1" />
                Add Leave Policy
              </button>
            )}
          </div>

          {/* Search/Filter/Per Page */}
          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0">
            <div className="row g-2 align-items-center">
              <div className="col-lg-8 col-md-8">
                <div className="input-group">
                  <input
                    className="form-control"
                    placeholder="Search by Policy Name..."
                    value={payload.searchKey}
                    onChange={(e) =>
                      setPayload({ ...payload, searchKey: e.target.value, pageNo: 1 })
                    }
                  />
                  <button
                    className="btn text-white px-4"
                    style={{ background: "#16A34A" }}
                    onClick={handleGetLeavePolicies}
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
                      Policy Name <MdPolicy size={14} />
                    </th>
                    <th>Leave Type</th>
                    <th onClick={() => handleSort("accuralType")} style={{ cursor: "pointer" }}>
                      Accrual 
                    </th>
                    <th onClick={() => handleSort("carryForwardLimit")} style={{ cursor: "pointer" }}>
                      Carry Forward <BsArrowRepeat size={14} />
                    </th>
                    <th onClick={() => handleSort("requiresApproval")} style={{ cursor: "pointer" }}>
                      Approval <GoChecklist size={14} />
                    </th>
                    <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                      Status 
                    </th>
                    <th onClick={() => handleSort("createdAt")} style={{ cursor: "pointer" }}>
                      Created At <MdOutlineDateRange size={14} />
                    </th>
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
                          <td><Skeleton width={80} /></td>
                          <td><Skeleton width={70} /></td>
                          <td><Skeleton width={70} /></td>
                          <td><Skeleton width={60} /></td>
                          <td><Skeleton width={90} /></td>
                          <td><Skeleton width={90} /></td>
                        </tr>
                      ))
                    : list.length > 0
                    ? list.map((policy, i) => (
                        <tr key={policy._id}>
                          <td className="ps-4 py-3">{startIndex + i + 1}</td>
                          <td className="fw-semibold">{policy.name}</td>
                          {/* Display Linked Leave Type */}
                          <td>
                            <span
                                className="me-2 rounded-circle"
                                style={{
                                width: 10,
                                height: 10,
                                backgroundColor: policy.leaveType?.color || "#6C757D", 
                                display: "inline-block",
                                }}
                            ></span>
                            {policy.leaveType?.leaveType || "—"}
                          </td>
                          {/* Display Accrual */}
                          <td>
                            <span className="fw-medium">{policy.accuralRate}</span> {policy.accuralType.toLowerCase()}
                          </td>
                          {/* Carry Forward */}
                          <td>{policy.carryForwardLimit} days</td>
                          {/* Approval */}
                          <td>
                            <span className={`badge px-2 py-1 ${getApprovalBadge(policy.requiresApproval)}`}>
                                {getApprovalText(policy.requiresApproval)}
                            </span>
                          </td>
                          {/* Status */}
                          <td>
                            <span className={`badge px-2 py-1 ${getStatusBadge(policy.status)}`}>
                              {policy.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          {/* Created At */}
                          <td>{moment(policy.createdAt).format("YYYY-MM-DD")}</td>
                          <td className="text-center pe-4">
                            <ActionButtons
                              // canView={canView} 
                              canUpdate={canUpdate}
                              canDelete={canDelete}
                              onEdit={() => handleOpenEditModal(policy)}
                              onDelete={() => handleDeletePolicy(policy._id)}
                            />
                          </td>
                        </tr>
                      ))
                    : (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} policies
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
              style={{ width: 450, maxHeight: "98vh", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-end mb-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseModal}
                  alt="Close"
                />
              </div>

              <h5 className="mb-4">
                {editingPolicy ? "Edit Leave Policy" : "Add Leave Policy"}
              </h5>

              {/* Policy Name */}
              <div className="mb-3">
                <label className="form-label">Policy Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={policyForm.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Annual Leave Policy"
                />
              </div>

              {/* Leave Type */}
              <div className="mb-3">
                <label className="form-label">Leave Type *</label>
                <select
                  name="leaveType"
                  className="form-select"
                  value={policyForm.leaveType}
                  onChange={handleFormChange}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.leaveType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Accrual Type and Rate */}
              <div className="row mb-3">
                <div className="col-6">
                    <label className="form-label">Accrual Rate (Days) *</label>
                    <input
                      type="number"
                      name="accuralRate"
                      className="form-control"
                      value={policyForm.accuralRate}
                      onChange={handleFormChange}
                      placeholder="e.g., 21"
                      min="0"
                    />
                </div>
                <div className="col-6">
                    <label className="form-label">Accrual Type *</label>
                    <select
                      name="accuralType"
                      className="form-select"
                      value={policyForm.accuralType}
                      onChange={handleFormChange}
                    >
                      <option value="Yearly">Yearly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                </div>
              </div>
              
              {/* Carry Forward Limit */}
              <div className="mb-3">
                <label className="form-label">Carry Forward Limit (Days)</label>
                <input
                  type="number"
                  name="carryForwardLimit"
                  className="form-control"
                  value={policyForm.carryForwardLimit}
                  onChange={handleFormChange}
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>

              {/* Min/Max Days Per Application */}
              <div className="row mb-3">
                <div className="col-6">
                    <label className="form-label">Min Days/Application *</label>
                    <input
                      type="number"
                      name="minDaysPerApplication"
                      className="form-control"
                      value={policyForm.minDaysPerApplication}
                      onChange={handleFormChange}
                      placeholder="e.g., 1"
                      min="1"
                    />
                </div>
                <div className="col-6">
                    <label className="form-label">Max Days/Application *</label>
                    <input
                      type="number"
                      name="maxDaysPerApplication"
                      className="form-control"
                      value={policyForm.maxDaysPerApplication}
                      onChange={handleFormChange}
                      placeholder="e.g., 90"
                      min="1"
                    />
                </div>
              </div>


              {/* Requires Approval */}
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  className="form-check-input"
                  checked={policyForm.requiresApproval}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Requires Manager/HR Approval</label>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={policyForm.description}
                  onChange={handleFormChange}
                  placeholder="Enter policy details"
                ></textarea>
              </div>

              {/* Status */}
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  name="status"
                  className="form-check-input"
                  checked={policyForm.status}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Active</label>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSavePolicy}
              >
                {editingPolicy ? "Update Policy" : "Create Policy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeavePolicies;