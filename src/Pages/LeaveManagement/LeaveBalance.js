import React, { useEffect, useState, useMemo } from "react";
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
import { MdPolicy, MdOutlineDateRange } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { GoGear } from "react-icons/go";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";

// --- Service Imports (Assuming these exist based on your provided context) ---
import { getLeaveTypeListServ } from "../../services/leaveType.services"; // For LeaveType dropdown
import { getEmployeeListServ } from "../../services/employee.services"; // For Employee dropdown

import {
  addLeaveBalanceServ,
  getLeaveBalanceListServ,
  updateLeaveBalanceServ,
  deleteLeaveBalanceServ,
} from "../../services/leaveBalance.services"; // Your provided services

// --- Initial States ---
const initialBalanceForm = {
  employee: "",
  leaveType: "",
  year: new Date().getFullYear().toString(),
  allocatedDays: 0,
  carriedForwardDays: 0,
  manualAdjustment: false, // Default to false for initial creation
  adjustmentReason: "",
};

const initialAdjustmentForm = {
  adjustmentAmount: 0,
  reasonForAdjustment: "",
};

// --- Main Component ---
function LeaveBalance() {
  const [list, setList] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const [showModal, setShowModal] = useState(false); // Add/Edit/View Modal
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false); // Adjustment Modal

  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'view'
  const [editingBalance, setEditingBalance] = useState(null); // The item being edited/viewed/adjusted

  const [balanceForm, setBalanceForm] = useState(initialBalanceForm);
  const [adjustmentForm, setAdjustmentForm] = useState(initialAdjustmentForm);

  // Assuming 'Leave Balance' is the permission key
  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Leave Balance");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  // Calculate Remaining Days
  const calculateRemaining = (allocated, used, adjustment, carriedForward) => {
    return (
      (Number(allocated) || 0) -
      (Number(used) || 0) +
      (Number(adjustment) || 0) +
      (Number(carriedForward) || 0)
    );
  };

  // --- Data Fetching ---

  // Fetch supporting data (Employees and Leave Types)
  const handleGetSupportingData = async () => {
    try {
      const leaveRes = await getLeaveTypeListServ({
        pageNo: 1,
        pageCount: 1000,
      });
      setLeaveTypes(leaveRes?.data?.data || []);

      const employeeRes = await getEmployeeListServ({
        pageNo: 1,
        pageCount: 1000,
      });
      setEmployees(employeeRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to load supporting data:", err);
    }
  };

  // Fetch Leave Balance list
  const handleGetLeaveBalances = async () => {
    if (!canView) {
      toast.error("You don't have permission to view leave balances.");
      return;
    }
    setShowSkeleton(true);
    try {
      const res = await getLeaveBalanceListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load balances");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetLeaveBalances();
    handleGetSupportingData();
  }, [payload]);

  // --- Modal Handlers (Add/Edit/View) ---

  const handleOpenModal = (mode, balance = null) => {
    setModalMode(mode);
    setEditingBalance(balance);
    if (mode === "add") {
      setBalanceForm(initialBalanceForm);
    } else if (balance) {
      // Set form data for edit/view
      setBalanceForm({
        employee: balance.employee?._id || "",
        leaveType: balance.leaveType?._id || "",
        year: balance.year.toString(),
        allocatedDays: balance.allocatedDays,
        carriedForwardDays: balance.carriedForwardDays,
        // adjustment fields are only used in the dedicated adjustment modal, not for base edit/add
        manualAdjustment: balance.manualAdjustment || false,
        adjustmentReason: balance.adjustmentReason || "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBalance(null);
  };

  // --- Adjustment Modal Handlers ---

  const handleOpenAdjustmentModal = (balance) => {
    setEditingBalance(balance);
    // Pre-populate with existing adjustment data if present
    setAdjustmentForm({
      adjustmentAmount: balance.adjustmentAmount || 0,
      reasonForAdjustment: balance.reasonForAdjustment || "",
    });
    setShowAdjustmentModal(true);
  };

  const handleCloseAdjustmentModal = () => {
    setShowAdjustmentModal(false);
    setEditingBalance(null);
  };

  // --- Form Change Handlers ---

  const handleBalanceFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBalanceForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleAdjustmentFormChange = (e) => {
    const { name, value, type } = e.target;
    setAdjustmentForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // --- API Handlers (Save/Update/Delete) ---

  const handleSaveBalance = async () => {
    if (
      !balanceForm.employee ||
      !balanceForm.leaveType ||
      !balanceForm.year ||
      balanceForm.allocatedDays === undefined
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Convert form data to API payload
    const data = {
      employee: balanceForm.employee,
      leaveType: balanceForm.leaveType,
      year: Number(balanceForm.year),
      allocatedDays: Number(balanceForm.allocatedDays),
      carriedForwardDays: Number(balanceForm.carriedForwardDays),
      // Manual adjustment fields are included here for the initial ADD
      manualAdjustment: balanceForm.manualAdjustment,
      adjustmentReason: balanceForm.adjustmentReason,
    };

    try {
      if (modalMode === "add") {
        await addLeaveBalanceServ(data);
        toast.success("Leave balance added successfully! ✅");
      } else if (modalMode === "edit" && editingBalance) {
        // For standard edit, we update the main fields, not the adjustment fields
        await updateLeaveBalanceServ({
          _id: editingBalance._id,
          ...data,
        });
        toast.success("Leave balance updated successfully! ✏️");
      }

      handleCloseModal();
      setPayload((prev) => ({ ...prev, pageNo: 1 }));
      handleGetLeaveBalances();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed.");
    }
  };

  const handleApplyAdjustment = async () => {
    if (!editingBalance) return;
    if (
      adjustmentForm.adjustmentAmount === undefined ||
      !adjustmentForm.reasonForAdjustment
    ) {
      toast.error("Please enter an adjustment amount and reason.");
      return;
    }

    try {
      // The update API is used here. We send the adjustment fields.
      // Note: We use the existing values for other fields to prevent accidental reset.
      await updateLeaveBalanceServ({
        _id: editingBalance._id,
        // Main fields remain unchanged or are sent with their current values
        employee: editingBalance.employee._id,
        leaveType: editingBalance.leaveType._id,
        year: editingBalance.year,
        allocatedDays: editingBalance.allocatedDays,
        carriedForwardDays: editingBalance.carriedForwardDays,

        // Only update the dedicated adjustment fields
        adjustmentAmount: Number(adjustmentForm.adjustmentAmount),
        reasonForAdjustment: adjustmentForm.reasonForAdjustment,
      });

      toast.success("Leave balance adjusted successfully! ⚙️");

      handleCloseAdjustmentModal();
      handleGetLeaveBalances();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Adjustment failed.");
    }
  };

  const handleDeleteBalance = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this leave balance entry?")
    ) {
      try {
        await deleteLeaveBalanceServ(id);
        toast.success("Leave balance deleted successfully! 🗑️");
        handleGetLeaveBalances();
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to delete leave balance"
        );
      }
    }
  };

  // --- Component Renders (Modal, Table, etc.) ---

  const renderFormFields = (isReadOnly) => (
    <>
      {/* Employee Selection */}
      <div className="mb-3">
        <label className="form-label">Employee *</label>
        <select
          name="employee"
          className="form-select"
          value={balanceForm.employee}
          onChange={handleBalanceFormChange}
          disabled={isReadOnly || modalMode !== "add"} // Disable if not 'add' or read-only
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.fullName || emp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Leave Type */}
      <div className="mb-3">
        <label className="form-label">Leave Type *</label>
        <select
          name="leaveType"
          className="form-select"
          value={balanceForm.leaveType}
          onChange={handleBalanceFormChange}
          disabled={isReadOnly || modalMode !== "add"} // Disable if not 'add' or read-only
        >
          <option value="">Select Leave Type</option>
          {leaveTypes.map((type) => (
            <option key={type._id} value={type._id}>
              {type.leaveType}
            </option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div className="mb-3">
        <label className="form-label">Year *</label>
        <input
          type="number"
          name="year"
          className="form-control"
          value={balanceForm.year}
          onChange={handleBalanceFormChange}
          disabled={isReadOnly || modalMode !== "add"} // Disable if not 'add' or read-only
        />
      </div>

      {/* Allocated Days */}
      <div className="mb-3">
        <label className="form-label">Allocated Days *</label>
        <input
          type="number"
          name="allocatedDays"
          className="form-control"
          value={balanceForm.allocatedDays}
          onChange={handleBalanceFormChange}
          disabled={isReadOnly}
        />
      </div>

      {/* Carried Forward Days */}
      <div className="mb-3">
        <label className="form-label">Carried Forward Days</label>
        <input
          type="number"
          name="carriedForwardDays"
          className="form-control"
          value={balanceForm.carriedForwardDays}
          onChange={handleBalanceFormChange}
          disabled={isReadOnly}
        />
      </div>

      {/* Manual Adjustment Checkbox (Only for ADD) */}
      {modalMode === "add" && (
        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="manualAdjustment"
            className="form-check-input"
            checked={balanceForm.manualAdjustment}
            onChange={handleBalanceFormChange}
            disabled={isReadOnly}
          />
          <label className="form-check-label">Include Manual Adjustment</label>
        </div>
      )}

      {/* Adjustment Reason (Only for ADD if manualAdjustment is checked) */}
      {(modalMode === "add" && balanceForm.manualAdjustment) && (
        <div className="mb-3">
          <label className="form-label">Adjustment Reason (Initial)</label>
          <textarea
            name="adjustmentReason"
            className="form-control"
            rows="2"
            value={balanceForm.adjustmentReason}
            onChange={handleBalanceFormChange}
            disabled={isReadOnly}
          ></textarea>
        </div>
      )}
    </>
  );

  // Pagination calculation
  const startIndex = (payload.pageNo - 1) * payload.pageCount;
  const endIndex = Math.min(startIndex + payload.pageCount, totalRecords);
  const totalPages = Math.ceil(totalRecords / payload.pageCount);

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

  return (
    <div className="bodyContainer">
      <Sidebar
        selectedMenu="Leave Management"
        selectedItem="Leave Balance"
      />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Leave Balance Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={() => handleOpenModal("add")}
              >
                <RiAddLine size={20} className="me-1" />
                Add Leave Balance
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
                    placeholder="Search by Employee Name or Leave Type..."
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
                    onClick={handleGetLeaveBalances}
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
                      onClick={() => handleSort("employee")}
                      style={{ cursor: "pointer" }}
                    >
                      Employee <HiOutlineUserGroup size={14} />
                    </th>
                    <th
                      onClick={() => handleSort("leaveType")}
                      style={{ cursor: "pointer" }}
                    >
                      Leave Type <MdPolicy size={14} />
                    </th>
                    <th
                      onClick={() => handleSort("year")}
                      style={{ cursor: "pointer" }}
                    >
                      Year <MdOutlineDateRange size={14} />
                    </th>
                    <th>Allocated</th>
                    <th>Used</th>
                    <th>Remaining</th>
                    <th>Carried Forward</th>
                    <th>Adjustment</th>
                    <th className="text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton ? (
                    Array.from({ length: payload.pageCount }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="10" className="ps-4 py-3">
                          <Skeleton height={20} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((balance, i) => (
                      <tr key={balance._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">
                          {balance.employee?.fullName ||
                            balance.employee?.name ||
                            "—"}
                        </td>
                        <td>
                          <span
                            className="me-2 rounded-circle"
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor:
                                balance.leaveType?.color || "#6C757D",
                              display: "inline-block",
                            }}
                          ></span>
                          {balance.leaveType?.leaveType || "—"}
                        </td>
                        <td>{balance.year}</td>
                        <td className="text-danger">{balance.allocatedDays}</td>
                        {/* Assuming 'used' is calculated server-side or available here */}
                        <td className="text-danger">
                          {balance.usedDays || 0.0}
                        </td>{" "}
                        {/* Placeholder */}
                        <td className="text-success">
                          {calculateRemaining(
                            balance.allocatedDays,
                            balance.usedDays, // Assuming this comes from the API
                            balance.adjustmentAmount,
                            balance.carriedForwardDays
                          ).toFixed(2)}
                        </td>
                        <td className="text-primary">
                          {balance.carriedForwardDays.toFixed(2)}
                        </td>
                        <td className="text-secondary">
                          {balance.adjustmentAmount.toFixed(2)}
                        </td>
                        <td className="text-center pe-4">
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* View Button */}
                            <button
                              className="btn btn-sm text-primary p-1"
                              onClick={() => handleOpenModal("view", balance)}
                              title="View"
                              style={{ borderRadius: "0.5rem" }}
                            >
                              <BsEye size={18} />
                            </button>

                            {/* Adjustment Button (Gear Icon) */}
                            {canUpdate && (
                              <button
                                className="btn btn-sm text-secondary p-1"
                                onClick={() =>
                                  handleOpenAdjustmentModal(balance)
                                }
                                title="Adjust Balance"
                                style={{ borderRadius: "0.5rem" }}
                              >
                                <GoGear size={18} />
                              </button>
                            )}

                            {/* Edit Button */}
                            {canUpdate && (
                              <button
                                className="btn btn-sm text-warning p-1"
                                onClick={() => handleOpenModal("edit", balance)}
                                title="Edit"
                                style={{ borderRadius: "0.5rem" }}
                              >
                                <BsPencilSquare size={18} />
                              </button>
                            )}

                            {/* Delete Button */}
                            {canDelete && (
                              <button
                                className="btn btn-sm text-danger p-1"
                                onClick={() => handleDeleteBalance(balance._id)}
                                title="Delete"
                                style={{ borderRadius: "0.5rem" }}
                              >
                                <BsTrash size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} balances
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

        {/* Add/Edit/View Leave Balance Modal */}
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
                  ? "Add Leave Balance"
                  : modalMode === "edit"
                  ? "Edit Leave Balance"
                  : "Leave Balance Details"}
              </h5>

              {/* Render Fields based on mode */}
              {renderFormFields(modalMode === "view")}

              {/* Adjustment Details (Only for View Mode) */}
              {modalMode === "view" && (
                <>
                  <hr />
                  <h6 className="mb-3">Adjustment History</h6>
                  <div className="mb-3">
                    <label className="form-label">Adjustment Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingBalance?.adjustmentAmount?.toFixed(2) || 0}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason for Adjustment</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editingBalance?.reasonForAdjustment || "N/A"}
                      disabled
                    ></textarea>
                  </div>
                </>
              )}

              {/* Save Button (Only for Add/Edit Mode) */}
              {(modalMode === "add" || modalMode === "edit") && (
                <button
                  className="btn text-white mt-3"
                  style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                  onClick={handleSaveBalance}
                >
                  {modalMode === "add" ? "Add Balance" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Adjust Leave Balance Modal */}
        {showAdjustmentModal && (
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
                  onClick={handleCloseAdjustmentModal}
                  alt="Close"
                />
              </div>

              <h5 className="mb-4">Adjust Leave Balance</h5>

              {editingBalance && (
                <p className="text-muted small">
                  Adjusting balance for:{" "}
                  <strong>
                    {editingBalance.employee?.fullName ||
                      editingBalance.employee?.name}
                    {" - "}
                    {editingBalance.leaveType?.leaveType}
                  </strong>
                </p>
              )}

              {/* Adjustment Amount */}
              <div className="mb-3">
                <label className="form-label">Adjustment Amount</label>
                <input
                  type="number"
                  name="adjustmentAmount"
                  className="form-control"
                  value={adjustmentForm.adjustmentAmount}
                  onChange={handleAdjustmentFormChange}
                  placeholder="Enter positive or negative amount"
                />
                <small className="form-text text-muted">
                  Current Adjustment:{" "}
                  {editingBalance?.adjustmentAmount?.toFixed(2) || 0}
                </small>
              </div>

              {/* Reason for Adjustment */}
              <div className="mb-4">
                <label className="form-label">Reason for Adjustment *</label>
                <textarea
                  name="reasonForAdjustment"
                  className="form-control"
                  rows="3"
                  value={adjustmentForm.reasonForAdjustment}
                  onChange={handleAdjustmentFormChange}
                  placeholder="State the reason for manual adjustment"
                ></textarea>
              </div>

              <button
                className="btn text-white mt-3"
                style={{ background: "#0D6EFD", borderRadius: "0.5rem" }}
                onClick={handleApplyAdjustment}
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveBalance;