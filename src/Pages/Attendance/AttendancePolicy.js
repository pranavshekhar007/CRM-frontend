import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NoRecordFound from "../../Components/NoRecordFound";
import { usePermission } from "../../hooks/usePermission";
import ActionButtons from "../../Components/ActionButtons"; 

import { FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { GoGear } from "react-icons/go";

// --- Service Imports ---
import {
  createAttendancePolicyServ,
  getAttendancePolicyListServ,
  updateAttendancePolicyServ,
  deleteAttendancePolicyServ,
} from "../../services/attendancePolicy.services"; // Your provided services

// --- Initial States and Utility Functions ---

const initialPolicyForm = {
  name: "",
  description: "",
  lateArrivalGrace: 15, // Default in minutes
  earlyDepartureGrace: 15, // Default in minutes
  overtimeRatePerHour: 0.0, // Default rate
  status: true,
};

// Component for Status Badge
const StatusBadge = ({ status }) => {
  const isActive = status === true;
  const text = isActive ? "Active" : "Inactive";
  const colorClass = isActive
    ? "bg-success-subtle text-success"
    : "bg-danger-subtle text-danger";
  return (
    <span className={`badge px-2 py-1 fw-medium ${colorClass}`}>{text}</span>
  );
};

// --- Main Component ---

function AttendancePolicy() {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // 'add', 'edit', 'view'
  const [modalMode, setModalMode] = useState("add"); 
  const [editingPolicy, setEditingPolicy] = useState(null);

  const [policyForm, setPolicyForm] = useState(initialPolicyForm);

  // Assuming 'Attendance Policy' is the permission key
  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Attendance Policy");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  // --- Data Fetching ---

  // Fetch Attendance Policy list
  const handleGetPolicies = async () => {
    if (!canView) {
      toast.error("You don't have permission to view attendance policies.");
      return;
    }
    setShowSkeleton(true);
    try {
      const res = await getAttendancePolicyListServ(payload);
      setList(res?.data || []);
      setTotalRecords(res?.total || 0);
    } catch (err) {
      toast.error(err?.message || "Failed to load policies");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetPolicies();
  }, [payload]);

  // --- Modal Handlers ---

  const handleOpenModal = (mode, policy = null) => {
    setModalMode(mode);
    setEditingPolicy(policy);

    if (mode === "add") {
      setPolicyForm(initialPolicyForm);
    } else if (policy) {
      // Set form data for edit/view
      setPolicyForm({
        name: policy.name || "",
        description: policy.description || "",
        lateArrivalGrace: policy.lateArrivalGrace || 0,
        earlyDepartureGrace: policy.earlyDepartureGrace || 0,
        overtimeRatePerHour: policy.overtimeRatePerHour || 0.0,
        status: policy.status !== undefined ? policy.status : true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPolicy(null);
  };

  // --- Form Change Handler ---

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPolicyForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
          ? checked
          : value,
    }));
  };

  // --- API Handlers (Save/Update/Delete) ---

  const handleSavePolicy = async () => {
    if (!policyForm.name) {
      toast.error("Please enter a Policy Name.");
      return;
    }
    if (policyForm.lateArrivalGrace < 0 || policyForm.earlyDepartureGrace < 0) {
        toast.error("Grace periods cannot be negative.");
        return;
    }

    // Prepare data payload
    const data = {
      name: policyForm.name,
      description: policyForm.description,
      lateArrivalGrace: Number(policyForm.lateArrivalGrace),
      earlyDepartureGrace: Number(policyForm.earlyDepartureGrace),
      overtimeRatePerHour: Number(policyForm.overtimeRatePerHour),
      status: policyForm.status,
    };

    try {
      if (modalMode === "add") {
        await createAttendancePolicyServ(data);
        toast.success("Attendance Policy created successfully! ✅");
      } else if (modalMode === "edit" && editingPolicy) {
        await updateAttendancePolicyServ({
          ...data,
          _id: editingPolicy._id, // Include the ID for update
        });
        toast.success("Attendance Policy updated successfully! ✏️");
      }

      handleCloseModal();
      setPayload((prev) => ({ ...prev, pageNo: 1 }));
      handleGetPolicies();
    } catch (err) {
      toast.error(err?.message || "Operation failed.");
    }
  };

  const handleDeletePolicy = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this attendance policy?")
    ) {
      try {
        await deleteAttendancePolicyServ(id);
        toast.success("Attendance Policy deleted successfully! 🗑️");
        handleGetPolicies();
      } catch (err) {
        toast.error(
          err?.message || "Failed to delete policy"
        );
      }
    }
  };

  // --- Component Renders ---

  const renderFormFields = (isReadOnly) => (
    <>
      {/* Policy Name */}
      <div className="mb-3">
        <label className="form-label">Policy Name *</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={policyForm.name}
          onChange={handleFormChange}
          disabled={isReadOnly}
          placeholder="e.g., Standard Attendance Policy"
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          className="form-control"
          rows="2"
          value={policyForm.description}
          onChange={handleFormChange}
          disabled={isReadOnly}
          placeholder="Briefly describe the policy"
        ></textarea>
      </div>

      {/* Late Arrival Grace / Early Departure Grace */}
      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label">Late Grace (mins)</label>
          <input
            type="number"
            name="lateArrivalGrace"
            className="form-control"
            value={policyForm.lateArrivalGrace}
            onChange={handleFormChange}
            disabled={isReadOnly}
            min="0"
          />
        </div>
        <div className="col-6">
          <label className="form-label">Early Grace (mins)</label>
          <input
            type="number"
            name="earlyDepartureGrace"
            className="form-control"
            value={policyForm.earlyDepartureGrace}
            onChange={handleFormChange}
            disabled={isReadOnly}
            min="0"
          />
        </div>
      </div>

      {/* Overtime Rate Per Hour */}
      <div className="mb-3">
        <label className="form-label">Overtime Rate Per Hour ($/hr)</label>
        <input
          type="number"
          name="overtimeRatePerHour"
          className="form-control"
          value={policyForm.overtimeRatePerHour}
          onChange={handleFormChange}
          disabled={isReadOnly}
          step="0.01"
          min="0"
          placeholder="e.g., 150.00"
        />
      </div>

      {/* Status */}
      <div className="mb-3">
        <label className="form-label">Status</label>
        <select
          name="status"
          className="form-select"
          value={policyForm.status}
          onChange={handleFormChange}
          disabled={isReadOnly}
        >
          <option value={true}>Active</option>
          <option value={false}>Inactive</option>
        </select>
      </div>
    </>
  );

  // Sort handler
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
  
  // Pagination calculation
  const startIndex = (payload.pageNo - 1) * payload.pageCount;
  const endIndex = Math.min(startIndex + payload.pageCount, totalRecords);
  const totalPages = Math.ceil(totalRecords / payload.pageCount);

  return (
    <div className="bodyContainer">
      <Sidebar
        selectedMenu="Attendance Management"
        selectedItem="Attendance Policy"
      />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Attendance Policy Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={() => handleOpenModal("add")}
              >
                <RiAddLine size={20} className="me-1" />
                Add Attendance Policy
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
                    onClick={handleGetPolicies}
                  >
                    <FaSearch size={16} /> Search
                  </button>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 d-flex justify-content-end">
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
                      onClick={() => handleSort("name")}
                      style={{ cursor: "pointer" }}
                    >
                      Policy Name 
                    </th>
                    <th>Late Grace (mins)</th>
                    <th>Early Grace (mins)</th>
                    <th>Overtime Rate</th>
                    <th
                      onClick={() => handleSort("status")}
                      style={{ cursor: "pointer" }}
                    >
                      Status
                    </th>
                    <th className="text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton ? (
                    Array.from({ length: payload.pageCount }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="7" className="ps-4 py-3">
                          <Skeleton height={20} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((policy, i) => (
                      <tr key={policy._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">{policy.name}</td>
                        <td className="text-danger fw-medium">
                            {policy.lateArrivalGrace}
                        </td>
                        <td className="text-primary fw-medium">
                            {policy.earlyDepartureGrace}
                        </td>
                        <td className="fw-medium">
                            ${policy.overtimeRatePerHour.toFixed(2)}/hr
                        </td>
                        <td>
                          <StatusBadge status={policy.status} />
                        </td>
                        <td className="text-center pe-4">
                          <ActionButtons
                            canView={true}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() => handleOpenModal("view", policy)}
                            onEdit={() => handleOpenModal("edit", policy)}
                            onDelete={() => handleDeletePolicy(policy._id)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} policies
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

        {/* Add/Edit/View Attendance Policy Modal */}
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
                {modalMode === "add"
                  ? "Add New Policy"
                  : modalMode === "edit"
                  ? "Edit Policy"
                  : "Policy Details"}
              </h5>

              {/* Render Fields based on mode */}
              {renderFormFields(modalMode === "view")}

              {/* Save Button (Only for Add/Edit Mode) */}
              {(modalMode === "add" || modalMode === "edit") && (
                <button
                  className="btn text-white mt-3 w-100"
                  style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                  onClick={handleSavePolicy}
                >
                  {modalMode === "add" ? "Create Policy" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendancePolicy;