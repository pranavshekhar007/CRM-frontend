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
import { RiAddLine, RiCalendarLine } from "react-icons/ri";
import { MdPolicy, MdOutlineDateRange } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi2";

import { getLeaveTypeListServ } from "../../services/leaveType.services"; // Assuming previous service file
import { getEmployeeListServ } from "../../services/employee.services"; // Assuming you have an employee service

import {
  getLeaveApplicationListServ,
  addLeaveApplicationServ,
  deleteLeaveApplicationServ,
  updateLeaveApplicationStatusServ,
} from "../../services/leaveApplication.services";
import { BsEye } from "react-icons/bs";

// --- Utility Functions ---

// Function to calculate difference in days
const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = moment(startDate);
  const end = moment(endDate);
  // Add 1 day to include both start and end days
  return end.diff(start, "days") + 1;
};

// Component for Status Badge
const StatusBadge = ({ status }) => {
  let colorClass = "";
  switch (status) {
    case "Approved":
      colorClass = "bg-success-subtle text-success";
      break;
    case "Rejected":
      colorClass = "bg-danger-subtle text-danger";
      break;
    case "Pending":
    default:
      colorClass = "bg-warning-subtle text-warning";
      break;
  }
  return (
    <span className={`badge px-2 py-1 fw-medium ${colorClass}`}>{status}</span>
  );
};

// --- Main Component ---

function LeaveApplicationList() {
  const [list, setList] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]); // List of employees for dropdown
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null); // Used primarily for details/status update

  // Assuming 'Leave Application' is the permission key
  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Leave Application");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
    // statusFilter: "", // Add status filter if needed
  });

  const [applicationForm, setApplicationForm] = useState({
    employee: "", // User ID (if submitting by HR/Manager)
    leaveType: "", // LeaveType ID
    startDate: moment().format("YYYY-MM-DD"),
    endDate: moment().format("YYYY-MM-DD"),
    reason: "",
    attachment: null, // File object
    attachmentName: "", // For display
    status: "Pending",
  });

  // Calculate days based on form dates
  const calculatedDays = useMemo(() => {
    return calculateDays(applicationForm.startDate, applicationForm.endDate);
  }, [applicationForm.startDate, applicationForm.endDate]);

  // Fetch all necessary data
  const handleGetSupportingData = async () => {
    try {
      // 1. Fetch Leave Types
      const leaveRes = await getLeaveTypeListServ({
        pageNo: 1,
        pageCount: 1000,
      });
      setLeaveTypes(leaveRes?.data?.data || []);

      // 2. Fetch Employees (for dropdown in HR view)
      const employeeRes = await getEmployeeListServ({
        pageNo: 1,
        pageCount: 1000,
      });
      setEmployees(employeeRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to load supporting data:", err);
    }
  };

  // Fetch Application list
  const handleGetApplications = async () => {
    if (!canView) {
      toast.error("You don't have permission to view leave applications.");
      return;
    }
    setShowSkeleton(true);
    try {
      const res = await getLeaveApplicationListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load applications"
      );
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetApplications();
    handleGetSupportingData();
  }, [payload]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingApplication(null);
    setApplicationForm({
      employee: "",
      leaveType: "",
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      reason: "",
      attachment: null,
      attachmentName: "",
      status: "Pending",
    });
    setShowModal(true);
  };

  // Note: For Leave Application, we usually don't "edit" the dates/type,
  // but we might use this to show details or update status.
  const handleOpenDetailsModal = (application) => {
    setEditingApplication(application);
    // Populate form state for potential status change in modal
    setApplicationForm({
      employee: application.employee?._id || "",
      leaveType: application.leaveType?._id || "",
      startDate: moment(application.startDate).format("YYYY-MM-DD"),
      endDate: moment(application.endDate).format("YYYY-MM-DD"),
      reason: application.reason || "",
      attachment: application.attachment || null,
      attachmentName: application.attachment ? "View Attachment" : "",
      status: application.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingApplication(null);
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file" && files.length > 0) {
      setApplicationForm((prev) => ({
        ...prev,
        attachment: files[0],
        attachmentName: files[0].name,
      }));
    } else {
      setApplicationForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Save/Submit Application
  const handleSaveApplication = async () => {
    if (
      !applicationForm.employee ||
      !applicationForm.leaveType ||
      !applicationForm.startDate ||
      !applicationForm.endDate
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (moment(applicationForm.startDate).isAfter(applicationForm.endDate)) {
      toast.error("Start date cannot be after end date.");
      return;
    }

    try {
      const formData = new FormData();
      // Append fields
      formData.append("employee", applicationForm.employee);
      formData.append("leaveType", applicationForm.leaveType);
      formData.append("startDate", applicationForm.startDate);
      formData.append("endDate", applicationForm.endDate);
      formData.append("reason", applicationForm.reason);
      formData.append("status", applicationForm.status); // Default to Pending

      // Append file if present
      if (
        applicationForm.attachment &&
        applicationForm.attachment instanceof File
      ) {
        formData.append("attachment", applicationForm.attachment);
      }

      // We only use ADD for the initial submission in this component
      await addLeaveApplicationServ(formData);
      toast.success("Leave application submitted successfully! 📧");

      handleCloseModal();
      setPayload((prev) => ({ ...prev, pageNo: 1 }));
      handleGetApplications();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed.");
    }
  };

  // Delete
  const handleDeleteApplication = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this leave application?")
    ) {
      try {
        await deleteLeaveApplicationServ(id);
        toast.success("Leave application deleted successfully! 🗑️");
        handleGetApplications();
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to delete application"
        );
      }
    }
  };

  // Status Update Handler (Used by HR/Manager)
  const handleUpdateStatus = async (id, newStatus) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update status.");
      return;
    }
    try {
      await updateLeaveApplicationStatusServ(id, newStatus);
      toast.success(`Application ${newStatus} successfully!`);
      handleGetApplications();
      handleCloseModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status.");
    }
  };

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
        selectedMenu="Leave Management"
        selectedItem="Leave Application"
      />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Leave Application Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleOpenAddModal}
              >
                <RiAddLine size={20} className="me-1" />
                Add Leave Application
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
                    placeholder="Search by Employee Name or Reason..."
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
                    onClick={handleGetApplications}
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
                      onClick={() => handleSort("startDate")}
                      style={{ cursor: "pointer" }}
                    >
                      Start Date <RiCalendarLine size={14} />
                    </th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th
                      onClick={() => handleSort("status")}
                      style={{ cursor: "pointer" }}
                    >
                      Status
                    </th>
                    <th
                      onClick={() => handleSort("createdAt")}
                      style={{ cursor: "pointer" }}
                    >
                      Applied On <MdOutlineDateRange size={14} />
                    </th>
                    <th className="text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton ? (
                    Array.from({ length: payload.pageCount }).map((_, i) => (
                      <tr key={i}>
                        <td className="ps-4 py-3">
                          <Skeleton width={20} />
                        </td>
                        <td>
                          <Skeleton width={150} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={30} />
                        </td>
                        <td>
                          <Skeleton width={70} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={90} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((app, i) => (
                      <tr key={app._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">
                          {/* Assuming employee field contains name/details */}
                          {app.employee?.fullName || app.employee?.name || "—"}
                        </td>
                        <td>
                          <span
                            className="me-2 rounded-circle"
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor:
                                app.leaveType?.color || "#6C757D",
                              display: "inline-block",
                            }}
                          ></span>
                          {app.leaveType?.leaveType || "—"}
                        </td>
                        <td>{moment(app.startDate).format("YYYY-MM-DD")}</td>
                        <td>{moment(app.endDate).format("YYYY-MM-DD")}</td>
                        <td>{calculateDays(app.startDate, app.endDate)}</td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td>{moment(app.createdAt).format("YYYY-MM-DD")}</td>
                        <td className="text-center pe-4">
                          <ActionButtons
                            // View Button (always show for details/status update)
                            canView={true}
                            // canUpdate={canUpdate && app.status === "Pending"}
                            canDelete={canDelete}
                            onView={() => handleOpenDetailsModal(app)}
                            onDelete={() => handleDeleteApplication(app._id)}
                            // Note: Edit is handled via the view/details modal for status change
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords}{" "}
              applications
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

        {/* Add/Details/Status Update Modal */}
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
                {editingApplication ? "Application Details" : "Apply for Leave"}
              </h5>

              {/* Employee Selection (Only for Add/HR view) */}
              <div className="mb-3">
                <label className="form-label">Employee *</label>
                <select
                  name="employee"
                  className="form-select"
                  value={applicationForm.employee}
                  onChange={handleFormChange}
                  disabled={!!editingApplication} // Disable if viewing details
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName || emp.name}{" "}
                      {/* Use appropriate employee field */}
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
                  value={applicationForm.leaveType}
                  onChange={handleFormChange}
                  disabled={!!editingApplication}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.leaveType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={applicationForm.startDate}
                    onChange={handleFormChange}
                    disabled={!!editingApplication}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={applicationForm.endDate}
                    onChange={handleFormChange}
                    disabled={!!editingApplication}
                  />
                </div>
              </div>

              {/* Calculated Days */}
              <div
                className="alert alert-secondary py-2 text-center"
                role="alert"
              >
                Total Days: {calculatedDays}
              </div>

              {/* Reason */}
              <div className="mb-3">
                <label className="form-label">Reason</label>
                <textarea
                  name="reason"
                  className="form-control"
                  rows="3"
                  value={applicationForm.reason}
                  onChange={handleFormChange}
                  placeholder="State the reason for leave"
                  disabled={!!editingApplication}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label">Attachment</label>

                {!editingApplication ? (
                  <input
                    type="file"
                    name="attachment"
                    className="form-control"
                    onChange={handleFormChange}
                  />
                ) : (
                  <div>
                    {applicationForm.attachment ? (
                      <>
                        {applicationForm.attachment.endsWith(".pdf") ? (
                          <iframe
                            src={applicationForm.attachment}
                            title="Attachment Preview"
                            width="100%"
                            height="300"
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #ddd",
                            }}
                          ></iframe>
                        ) : (
                          <img
                            src={applicationForm.attachment}
                            alt="Attachment"
                            className="img-fluid rounded border"
                            style={{ maxHeight: "250px", objectFit: "contain" }}
                          />
                        )}
                        <div className="mt-3">
                          <a
                            href={applicationForm.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                            style={{
                              borderRadius: "0.5rem",
                              fontWeight: 500,
                              padding: "6px 14px",
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                         <BsEye/>View Document
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="form-control-static text-muted">
                        No attachment
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Status Update (Only if viewing/editing) */}
              {editingApplication && canUpdate && (
                <>
                  <h6 className="mb-3">Update Status</h6>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success w-100"
                      onClick={() =>
                        handleUpdateStatus(editingApplication._id, "Approved")
                      }
                      disabled={editingApplication.status === "Approved"}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger w-100"
                      onClick={() =>
                        handleUpdateStatus(editingApplication._id, "Rejected")
                      }
                      disabled={editingApplication.status === "Rejected"}
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {/* Submit Button (Only for Add) */}
              {!editingApplication && (
                <button
                  className="btn btn-success w-100 mt-3"
                  onClick={handleSaveApplication}
                >
                  Submit Application
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveApplicationList;
