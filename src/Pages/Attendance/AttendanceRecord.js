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
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";

// --- Service Imports ---
import {
  createAttendanceRecordServ,
  getAttendanceRecordListServ,
  updateAttendanceRecordServ,
  deleteAttendanceRecordServ,
} from "../../services/attendanceRecord.services"; // Your provided services
import { getEmployeeListServ } from "../../services/employee.services"; // Your provided employee service
// Assuming you have a Shift service as well, if needed for actual calculations

// --- Initial States and Utility Functions ---

const initialRecordForm = {
  employee: "",
  date: moment().format("YYYY-MM-DD"),
  inTime: "09:00",
  outTime: "17:00",
  breakHours: 0.5, // Default 30 mins break
  notes: "",
  // totalHours, status, holiday are usually calculated/set by the backend/logic
  status: "Present", 
};

// Function to calculate H (simplified dummy calculation)
const calculateTotalHours = (inTime, outTime, breakHours) => {
  if (!inTime || !outTime) return 0.0;
  
  try {
    const clockIn = moment(inTime, "HH:mm");
    let clockOut = moment(outTime, "HH:mm");

    // Handle overnight shift (simplified: assumes outTime is the next day if before inTime)
    if (clockOut.isBefore(clockIn)) {
      clockOut = clockOut.add(1, "day");
    }

    const duration = moment.duration(clockOut.diff(clockIn));
    const totalMinutes = duration.asMinutes();
    const workingMinutes = totalMinutes - (Number(breakHours) * 60 || 0);

    const workingHours = workingMinutes / 60;
    return Math.max(0, workingHours).toFixed(2);
  } catch (error) {
    return 0.0;
  }
};

// Component for Status Badge
const StatusBadge = ({ status, isLate, isEarly }) => {
  let colorClass = "";
  let text = status;

  switch (status) {
    case "Present":
      colorClass = "bg-success-subtle text-success";
      break;
    case "OnLeave":
    case "Holiday":
      colorClass = "bg-info-subtle text-info";
      break;
    case "HalfDay":
      colorClass = "bg-warning-subtle text-warning";
      break;
    case "Absent":
    default:
      colorClass = "bg-danger-subtle text-danger";
      text = "Absent";
      break;
  }

  return (
    <div className="d-flex flex-wrap gap-1">
      <span className={`badge px-2 py-1 fw-medium ${colorClass}`}>{text}</span>
      {isLate && (
        <span className="badge px-2 py-1 fw-medium bg-danger-subtle text-danger">
          Late
        </span>
      )}
      {isEarly && (
        <span className="badge px-2 py-1 fw-medium bg-warning-subtle text-warning">
          Early
        </span>
      )}
    </div>
  );
};

// --- Main Component ---

function AttendanceRecord() {
  const [list, setList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // 'add', 'edit', 'view'
  const [modalMode, setModalMode] = useState("add"); 
  const [editingRecord, setEditingRecord] = useState(null);

  const [recordForm, setRecordForm] = useState(initialRecordForm);

  // Assuming 'Attendance Record' is the permission key
  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Attendance Record");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "date",
    sortByOrder: "desc",
  });

  // Calculate working hours dynamically
  const calculatedTotalHours = calculateTotalHours(
    recordForm.inTime,
    recordForm.outTime,
    recordForm.breakHours
  );

  // --- Data Fetching ---

  // Fetch supporting data (Employees, Shifts)
  const handleGetSupportingData = async () => {
    try {
      // 1. Fetch Employees
      const employeeRes = await getEmployeeListServ({
        pageNo: 1,
        pageCount: 1000,
      });
      setEmployees(employeeRes?.data?.data || []);
      
      // 2. Fetch Shifts (not implemented here but needed for real calculation)
    } catch (err) {
      console.error("Failed to load supporting data:", err);
    }
  };

  // Fetch Attendance Record list
  const handleGetRecords = async () => {
    if (!canView) {
      toast.error("You don't have permission to view attendance records.");
      return;
    }
    setShowSkeleton(true);
    try {
      // NOTE: Your provided service file has a typo (bodyDat instead of bodyData)
      const res = await getAttendanceRecordListServ(payload); 
      setList(res?.data || []);
      setTotalRecords(res?.total || 0);
    } catch (err) {
      toast.error(err?.message || "Failed to load records");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetRecords();
    handleGetSupportingData();
  }, [payload]);

  // --- Modal Handlers ---

  const handleOpenModal = (mode, record = null) => {
    setModalMode(mode);
    setEditingRecord(record);

    if (mode === "add") {
      setRecordForm(initialRecordForm);
    } else if (record) {
      // Set form data for edit/view
      setRecordForm({
        employee: record.employee?._id || "",
        date: moment(record.date).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD"),
        inTime: record.inTime || "09:00",
        outTime: record.outTime || "17:00",
        breakHours: record.breakHours || 0,
        notes: record.notes || "",
        status: record.status || "Present", 
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
  };

  // --- Form Change Handler ---

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecordForm((prev) => ({
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

  const handleSaveRecord = async () => {
    if (!recordForm.employee || !recordForm.date) {
      toast.error("Please select an Employee and a Date.");
      return;
    }

    // Prepare data payload (using client-side calculated totalHours for the demonstration)
    const data = {
      employee: recordForm.employee,
      date: recordForm.date,
      inTime: recordForm.inTime || undefined,
      outTime: recordForm.outTime || undefined,
      breakHours: recordForm.breakHours,
      totalHours: parseFloat(calculatedTotalHours),
      status: recordForm.status,
      notes: recordForm.notes,
      // holiday is omitted since it's typically set by a separate process
    };

    try {
      if (modalMode === "add") {
        await createAttendanceRecordServ(data);
        toast.success("Attendance Record created successfully! 📝");
      } else if (modalMode === "edit" && editingRecord) {
        await updateAttendanceRecordServ({
          ...data,
          _id: editingRecord._id, // Include the ID for update
        });
        toast.success("Attendance Record updated successfully! ✏️");
      }

      handleCloseModal();
      setPayload((prev) => ({ ...prev, pageNo: 1 }));
      handleGetRecords();
    } catch (err) {
      toast.error(err?.message || "Operation failed.");
    }
  };

  const handleDeleteRecord = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this attendance record?")
    ) {
      try {
        await deleteAttendanceRecordServ(id);
        toast.success("Attendance Record deleted successfully! 🗑️");
        handleGetRecords();
      } catch (err) {
        toast.error(
          err?.message || "Failed to delete record"
        );
      }
    }
  };

  // --- Component Renders ---

  const renderFormFields = (isReadOnly) => (
    <>
      {/* Employee Selection */}
      <div className="mb-3">
        <label className="form-label">Employee *</label>
        <select
          name="employee"
          className="form-select"
          value={recordForm.employee}
          onChange={handleFormChange}
          disabled={isReadOnly || modalMode === "edit"} // Can't change employee/date for existing record
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.fullName || emp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="mb-3">
        <label className="form-label">Date *</label>
        <input
          type="date"
          name="date"
          className="form-control"
          value={recordForm.date}
          onChange={handleFormChange}
          disabled={isReadOnly || modalMode === "edit"}
        />
      </div>

      {/* Clock In / Clock Out */}
      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label">Clock In</label>
          <input
            type="time"
            name="inTime"
            className="form-control"
            value={recordForm.inTime}
            onChange={handleFormChange}
            disabled={isReadOnly}
          />
        </div>
        <div className="col-6">
          <label className="form-label">Clock Out</label>
          <input
            type="time"
            name="outTime"
            className="form-control"
            value={recordForm.outTime}
            onChange={handleFormChange}
            disabled={isReadOnly}
          />
        </div>
      </div>
      
      {/* Break Hours / Total Hours (Display) */}
      <div className="row mb-3 align-items-end">
        <div className="col-6">
          <label className="form-label">Break (Hours)</label>
          <input
            type="number"
            name="breakHours"
            className="form-control"
            value={recordForm.breakHours}
            onChange={handleFormChange}
            disabled={isReadOnly}
            step="0.01"
            min="0"
          />
        </div>
        <div className="col-6">
          <div className="alert alert-secondary py-2 text-center mb-0">
            Total Hours: {calculatedTotalHours}h
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="mb-3">
        <label className="form-label">Manual Status</label>
        <select
          name="status"
          className="form-select"
          value={recordForm.status}
          onChange={handleFormChange}
          disabled={isReadOnly}
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="HalfDay">Half Day</option>
          <option value="OnLeave">On Leave</option>
          <option value="Holiday">Holiday</option>
        </select>
      </div>

      {/* Notes */}
      <div className="mb-3">
        <label className="form-label">Notes</label>
        <textarea
          name="notes"
          className="form-control"
          rows="2"
          value={recordForm.notes}
          onChange={handleFormChange}
          disabled={isReadOnly}
          placeholder="Any special notes for this day"
        ></textarea>
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
        selectedItem="Attendance Record"
      />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Attendance Record Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={() => handleOpenModal("add")}
              >
                <RiAddLine size={20} className="me-1" />
                Add Record
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
                    placeholder="Search by Employee Name..."
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
                    onClick={handleGetRecords}
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
                      Employee 
                    </th>
                    <th
                      onClick={() => handleSort("date")}
                      style={{ cursor: "pointer" }}
                    >
                      Date
                    </th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Total Hours</th>
                    <th>Overtime</th>
                    <th>Status</th>
                    <th className="text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton ? (
                    Array.from({ length: payload.pageCount }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="9" className="ps-4 py-3">
                          <Skeleton height={20} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((record, i) => {
                      // Dummy values for late/early/overtime for demonstration
                      const totalHours = record.totalHours?.toFixed(2) || calculateTotalHours(record.inTime, record.outTime, record.breakHours);
                      const isLate = record.inTime && record.inTime > "09:10";
                      const isEarly = record.outTime && record.outTime < "16:50";
                      const overtime = (totalHours > 8 ? (totalHours - 8).toFixed(2) : 0.00).toString();
                      
                      return (
                      <tr key={record._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">
                          {/* Assuming employee field is populated with full data */}
                          {record.employee?.fullName || record.employee?.name || "N/A"}
                        </td>
                        <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                        <td className={isLate ? "text-danger fw-medium" : ""}>
                          {record.inTime || "—"}
                        </td>
                        <td className={isEarly ? "text-warning fw-medium" : ""}>
                          {record.outTime || "—"}
                        </td>
                        <td className="fw-medium">{totalHours}h</td>
                        <td>{overtime}h</td>
                        <td>
                          <StatusBadge 
                            status={record.status} 
                            isLate={isLate} 
                            isEarly={isEarly} 
                          />
                        </td>
                        <td className="text-center pe-4">
                          <ActionButtons
                            canView={true}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() => handleOpenModal("view", record)}
                            onEdit={() => handleOpenModal("edit", record)}
                            onDelete={() => handleDeleteRecord(record._id)}
                          />
                        </td>
                      </tr>
                    )})
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} records
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

        {/* Add/Edit/View Attendance Record Modal */}
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
                  ? "Add New Record"
                  : modalMode === "edit"
                  ? "Edit Record"
                  : "Record Details"}
              </h5>

              {/* Render Fields based on mode */}
              {renderFormFields(modalMode === "view")}

              {/* Save Button (Only for Add/Edit Mode) */}
              {(modalMode === "add" || modalMode === "edit") && (
                <button
                  className="btn text-white mt-3 w-100"
                  style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                  onClick={handleSaveRecord}
                >
                  {modalMode === "add" ? "Create Record" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceRecord;