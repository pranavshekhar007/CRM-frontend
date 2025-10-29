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
import ActionButtons from "../../Components/ActionButtons"; // Assuming you have an ActionButtons component

import { FaSearch } from "react-icons/fa";
import { RiAddLine, RiCalendarLine } from "react-icons/ri";
import { BsEye, BsPencilSquare, BsTrash, BsLockFill } from "react-icons/bs";
import { MdOutlineDateRange } from "react-icons/md";

// --- Service Imports ---
import {
  createShiftServ,
  getShiftListServ,
  updateShiftServ,
  deleteShiftServ,
} from "../../services/shift.services";


const initialShiftForm = {
  name: "",
  description: "",
  startTime: "09:00", 
  endTime: "18:00", 
  breakDuration: 60, 
  gracePeriod: 15,
  nightShift: false,
  status: true,
};

const calculateWorkingHours = (startTime, endTime, breakDuration) => {
  if (!startTime || !endTime) return "0.00h";
  try {
    const start = moment(startTime, "HH:mm");
    let end = moment(endTime, "HH:mm");

    // Handle night shift (end time is the next day)
    if (end.isBefore(start)) {
      end = end.add(1, "day");
    }

    const duration = moment.duration(end.diff(start));
    const totalMinutes = duration.asMinutes();
    const workingMinutes = totalMinutes - (Number(breakDuration) || 0);

    const workingHours = workingMinutes / 60;
    return `${workingHours.toFixed(2)}h`;
  } catch (error) {
    return "N/A";
  }
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

function Shifts() {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // 'add', 'edit', 'view'
  const [modalMode, setModalMode] = useState("add"); 
  const [editingShift, setEditingShift] = useState(null);

  const [shiftForm, setShiftForm] = useState(initialShiftForm);

  // Assuming 'Shift Management' is the permission key
  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Shifts");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  // Calculate working hours dynamically
  const calculatedWorkingHours = useMemo(() => {
    return calculateWorkingHours(
      shiftForm.startTime,
      shiftForm.endTime,
      shiftForm.breakDuration
    );
  }, [shiftForm.startTime, shiftForm.endTime, shiftForm.breakDuration]);

  // --- Data Fetching ---

  // Fetch Shift list
  const handleGetShifts = async () => {
    if (!canView) {
      toast.error("You don't have permission to view shifts.");
      return;
    }
    setShowSkeleton(true);
    try {
      const res = await getShiftListServ(payload);
      setList(res?.data || []);
      setTotalRecords(res?.total || 0);
    } catch (err) {
      toast.error(err?.message || "Failed to load shifts");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetShifts();
  }, [payload]);

  // --- Modal Handlers ---

  const handleOpenModal = (mode, shift = null) => {
    setModalMode(mode);
    setEditingShift(shift);

    if (mode === "add") {
      setShiftForm(initialShiftForm);
    } else if (shift) {
      // Set form data for edit/view
      setShiftForm({
        name: shift.name || "",
        description: shift.description || "",
        startTime: shift.startTime || "09:00",
        endTime: shift.endTime || "18:00",
        breakDuration: shift.breakDuration || 0,
        gracePeriod: shift.gracePeriod || 0,
        nightShift: shift.nightShift || false,
        status: shift.status !== undefined ? shift.status : true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShift(null);
  };

  // --- Form Change Handler ---

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShiftForm((prev) => ({
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

  const handleSaveShift = async () => {
    if (!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
      toast.error("Please fill all required fields (Name, Start Time, End Time).");
      return;
    }

    // Prepare data payload
    const data = {
      name: shiftForm.name,
      description: shiftForm.description,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      breakDuration: shiftForm.breakDuration,
      gracePeriod: shiftForm.gracePeriod,
      nightShift: shiftForm.nightShift,
      status: shiftForm.status,
    };

    try {
      if (modalMode === "add") {
        await createShiftServ(data);
        toast.success("Shift created successfully! 🕔");
      } else if (modalMode === "edit" && editingShift) {
        await updateShiftServ({
          ...data,
          _id: editingShift._id, // Include the ID for update
        });
        toast.success("Shift updated successfully! ✏️");
      }

      handleCloseModal();
      setPayload((prev) => ({ ...prev, pageNo: 1 }));
      handleGetShifts();
    } catch (err) {
      toast.error(err?.message || "Operation failed.");
    }
  };

  const handleDeleteShift = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this shift?")
    ) {
      try {
        await deleteShiftServ(id);
        toast.success("Shift deleted successfully! 🗑️");
        handleGetShifts();
      } catch (err) {
        toast.error(
          err?.message || "Failed to delete shift"
        );
      }
    }
  };

  // --- Component Renders ---

  const renderFormFields = (isReadOnly) => (
    <>
      {/* Shift Name */}
      <div className="mb-3">
        <label className="form-label">Shift Name *</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={shiftForm.name}
          onChange={handleFormChange}
          disabled={isReadOnly}
          placeholder="e.g., Morning Shift"
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          className="form-control"
          rows="2"
          value={shiftForm.description}
          onChange={handleFormChange}
          disabled={isReadOnly}
          placeholder="Briefly describe the shift"
        ></textarea>
      </div>

      {/* Start Time / End Time */}
      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label">Start Time *</label>
          <input
            type="time"
            name="startTime"
            className="form-control"
            value={shiftForm.startTime}
            onChange={handleFormChange}
            disabled={isReadOnly}
          />
        </div>
        <div className="col-6">
          <label className="form-label">End Time *</label>
          <input
            type="time"
            name="endTime"
            className="form-control"
            value={shiftForm.endTime}
            onChange={handleFormChange}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Working Hours Display */}
      <div
        className="alert alert-info py-2 text-center"
        role="alert"
      >
        Calculated Working Hours: {calculatedWorkingHours}
      </div>

      {/* Break Duration / Grace Period */}
      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label">Break Duration (mins)</label>
          <input
            type="number"
            name="breakDuration"
            className="form-control"
            value={shiftForm.breakDuration}
            onChange={handleFormChange}
            disabled={isReadOnly}
            min="0"
          />
        </div>
        <div className="col-6">
          <label className="form-label">Grace Period (mins)</label>
          <input
            type="number"
            name="gracePeriod"
            className="form-control"
            value={shiftForm.gracePeriod}
            onChange={handleFormChange}
            disabled={isReadOnly}
            min="0"
          />
        </div>
      </div>

      {/* Night Shift / Status */}
      <div className="row mb-3">
        <div className="col-6">
          <div className="form-check pt-4">
            <input
              type="checkbox"
              name="nightShift"
              className="form-check-input"
              checked={shiftForm.nightShift}
              onChange={handleFormChange}
              disabled={isReadOnly}
            />
            <label className="form-check-label">Is Night Shift?</label>
          </div>
        </div>
        <div className="col-6">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={shiftForm.status}
            onChange={handleFormChange}
            disabled={isReadOnly}
          >
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
        </div>
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
  
  const startIndex = (payload.pageNo - 1) * payload.pageCount;
  const endIndex = Math.min(startIndex + payload.pageCount, totalRecords);
  const totalPages = Math.ceil(totalRecords / payload.pageCount);

  return (
    <div className="bodyContainer">
      <Sidebar
        selectedMenu="Attendance Management"
        selectedItem="Shifts"
      />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Shift Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={() => handleOpenModal("add")}
              >
                <RiAddLine size={20} className="me-1" />
                Add Shift
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
                    placeholder="Search by Shift Name..."
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
                    onClick={handleGetShifts}
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
                      Shift Name 
                    </th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Break (mins)</th>
                    <th>Working Hours</th>
                    <th>Grace (mins)</th>
                    <th>Type</th>
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
                        <td colSpan="10" className="ps-4 py-3">
                          <Skeleton height={20} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((shift, i) => (
                      <tr key={shift._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">{shift.name}</td>
                        <td>{shift.startTime}</td>
                        <td>{shift.endTime}</td>
                        <td>{shift.breakDuration}</td>
                        <td className="fw-medium">
                          {calculateWorkingHours(
                            shift.startTime,
                            shift.endTime,
                            shift.breakDuration
                          )}
                        </td>
                        <td>{shift.gracePeriod}</td>
                        <td>
                          <span className={`badge ${shift.nightShift ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'}`}>
                            {shift.nightShift ? "Night" : "Day"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={shift.status} />
                        </td>
                        <td className="text-center pe-4">
                          <ActionButtons
                            canView={true}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() => handleOpenModal("view", shift)}
                            onEdit={() => handleOpenModal("edit", shift)}
                            onDelete={() => handleDeleteShift(shift._id)}
                          />
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} shifts
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

        {/* Add/Edit/View Shift Modal */}
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
                  ? "Add New Shift"
                  : modalMode === "edit"
                  ? "Edit Shift"
                  : "Shift Details"}
              </h5>

              {/* Render Fields based on mode */}
              {renderFormFields(modalMode === "view")}

              {/* Save Button (Only for Add/Edit Mode) */}
              {(modalMode === "add" || modalMode === "edit") && (
                <button
                  className="btn text-white mt-3 w-100"
                  style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                  onClick={handleSaveShift}
                >
                  {modalMode === "add" ? "Create Shift" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shifts;