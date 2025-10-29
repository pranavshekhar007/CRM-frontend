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
import { BsEye, BsPencilSquare, BsTrash, BsCheckCircle, BsXCircle } from "react-icons/bs";

import {
  createAttendanceRegularizationServ,
  getAttendanceRegularizationListServ,
  updateAttendanceRegularizationServ,
  deleteAttendanceRegularizationServ,
  updateAttendanceRegularizationStatusServ,
} from "../../services/attendanceRegularization.services";
import { getEmployeeListServ } from "../../services/employee.services";
import { getAttendanceRecordListServ } from "../../services/attendanceRecord.services";

const initialRegularizationForm = {
  employee: "",
  attendanceRecord: "",
  requestedClockIn: "09:00",
  requestedClockOut: "17:00",
  reason: "",
};

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

function AttendanceRegularization() {
  const [list, setList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availableRecords, setAvailableRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [modalMode, setModalMode] = useState("add"); 
  const [editingRequest, setEditingRequest] = useState(null);

  const [regForm, setRegForm] = useState(initialRegularizationForm);

  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Attendance Regularization");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  const handleGetSupportingData = async () => {
    try {
      const employeeRes = await getEmployeeListServ({
        pageNo: 1,
        pageCount: 1000,
      });
      setEmployees(employeeRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to load supporting data:", err);
    }
  };
  
  const fetchEmployeeRecords = async (employeeId) => {
    if (!employeeId) {
        setAvailableRecords([]);
        return;
    }
    try {
        const res = await getAttendanceRecordListServ({ employee: employeeId, pageCount: 1000 });
        
        const records = res?.data || [];
        setAvailableRecords(records);
    } catch (err) {
        console.error("Failed to fetch employee attendance records:", err);
        setAvailableRecords([]);
    }
  };

  const handleGetRegularizations = async () => {
    if (!canView) {
      toast.error("You don't have permission to view regularization requests.");
      return;
    }
    setShowSkeleton(true);
    try {
      const res = await getAttendanceRegularizationListServ(payload);
      setList(res?.data || []);
      setTotalRecords(res?.total || 0);
    } catch (err) {
      toast.error(err?.message || "Failed to load requests");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetRegularizations();
    handleGetSupportingData();
  }, [payload]);

  useEffect(() => {
    if (showModal && modalMode !== "view") {
        fetchEmployeeRecords(regForm.employee);
    }
  }, [regForm.employee, showModal, modalMode]);
  
  const handleOpenModal = (mode, request = null) => {
    setModalMode(mode);
    setEditingRequest(request);

    if (mode === "add") {
      setRegForm(initialRegularizationForm);
      setAvailableRecords([]);
    } else if (request) {
      setRegForm({
        employee: request.employee?._id || "",
        attendanceRecord: request.attendanceRecord?._id || "",
        requestedClockIn: request.requestedClockIn || "09:00",
        requestedClockOut: request.requestedClockOut || "17:00",
        reason: request.reason || "",
        status: request.status,
      });
      
      fetchEmployeeRecords(request.employee?._id);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRequest(null);
    setAvailableRecords([]);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveRegularization = async () => {
    if (!regForm.employee || !regForm.attendanceRecord || !regForm.reason) {
      toast.error("Please fill all required fields.");
      return;
    }

    const data = {
      employee: regForm.employee,
      attendanceRecord: regForm.attendanceRecord,
      requestedClockIn: regForm.requestedClockIn,
      requestedClockOut: regForm.requestedClockOut,
      reason: regForm.reason,
    };

    try {
      if (modalMode === "add") {
        await createAttendanceRegularizationServ(data);
        toast.success("Regularization request submitted successfully! 📧");
      } else if (modalMode === "edit" && editingRequest) {
        await updateAttendanceRegularizationServ({
          ...data,
          _id: editingRequest._id,
        });
        toast.success("Regularization request updated successfully! ✏️");
      }

      handleCloseModal();
      setPayload((prev) => ({ ...prev, pageNo: 1 }));
      handleGetRegularizations();
    } catch (err) {
      toast.error(err?.message || "Operation failed.");
    }
  };

  const handleDeleteRegularization = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this regularization request?")
    ) {
      try {
        await deleteAttendanceRegularizationServ(id);
        toast.success("Request deleted successfully! 🗑️");
        handleGetRegularizations();
      } catch (err) {
        toast.error(
          err?.message || "Failed to delete request"
        );
      }
    }
  };
  
  const handleUpdateStatus = async (id, newStatus) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update status.");
      return;
    }
    try {
      await updateAttendanceRegularizationStatusServ(id, newStatus);
      toast.success(`Request ${newStatus} successfully!`);
      handleGetRegularizations();
      handleCloseModal();
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    }
  };

  const renderFormFields = (isReadOnly) => {
    const selectedRecord = availableRecords.find(r => r._id === regForm.attendanceRecord) || 
                           (editingRequest && editingRequest.attendanceRecord);

    return (
        <>
        <div className="mb-3">
          <label className="form-label">Employee *</label>
          <select
            name="employee"
            className="form-select"
            value={regForm.employee}
            onChange={handleFormChange}
            disabled={isReadOnly || modalMode === "edit"}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName || emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Attendance Date *</label>
          <select
            name="attendanceRecord"
            className="form-select"
            value={regForm.attendanceRecord}
            onChange={handleFormChange}
            disabled={isReadOnly || !regForm.employee}
          >
            <option value="">Select Date/Record</option>
            {availableRecords.map((record) => (
              <option key={record._id} value={record._id}>
                {moment(record.date).format("YYYY-MM-DD")} ({record.inTime || '—'} - {record.outTime || '—'})
              </option>
            ))}
            {selectedRecord && !availableRecords.some(r => r._id === selectedRecord._id) && (
                <option key={selectedRecord._id} value={selectedRecord._id}>
                    {moment(selectedRecord.date).format("YYYY-MM-DD")} (Original)
                </option>
            )}
          </select>
          {!regForm.employee && <small className="text-muted">Select an employee first.</small>}
        </div>

        {selectedRecord && (
             <div className="alert alert-info py-2 text-center my-3">
                Original Times: {selectedRecord.inTime || '—'} - {selectedRecord.outTime || '—'}
             </div>
        )}

        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">Requested Clock In *</label>
            <input
              type="time"
              name="requestedClockIn"
              className="form-control"
              value={regForm.requestedClockIn}
              onChange={handleFormChange}
              disabled={isReadOnly}
            />
          </div>
          <div className="col-6">
            <label className="form-label">Requested Clock Out *</label>
            <input
              type="time"
              name="requestedClockOut"
              className="form-control"
              value={regForm.requestedClockOut}
              onChange={handleFormChange}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Reason *</label>
          <textarea
            name="reason"
            className="form-control"
            rows="3"
            value={regForm.reason}
            onChange={handleFormChange}
            disabled={isReadOnly}
            placeholder="Explain why the attendance record needs regularization (e.g., forgot to punch in, traffic delay)."
          ></textarea>
        </div>

        {modalMode === "view" && editingRequest && canUpdate && (
  <>
    <h6 className="mb-3">Update Status</h6>
    <div className="d-flex gap-2">
      <button
        className="btn btn-success w-100"
        onClick={() => handleUpdateStatus(editingRequest._id, "Approved")}
        disabled={editingRequest.status === "Approved"}
      >
        <BsCheckCircle className="me-1" /> Approve
      </button>
      <button
        className="btn btn-danger w-100"
        onClick={() => handleUpdateStatus(editingRequest._id, "Rejected")}
        disabled={editingRequest.status === "Rejected"}
      >
        <BsXCircle className="me-1" /> Reject
      </button>
    </div>
  </>
)}

      </>
    );
  };

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
        selectedItem="Attendance Regularization"
      />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Attendance Regularization Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={() => handleOpenModal("add")}
              >
                <RiAddLine size={20} className="me-1" />
                Add Request
              </button>
            )}
          </div>

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
                    onClick={handleGetRegularizations}
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

          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="ps-4">#</th>
                    <th>Employee</th>
                    <th
                      onClick={() => handleSort("date")}
                      style={{ cursor: "pointer" }}
                    >
                      Date
                    </th>
                    <th>Original Times</th>
                    <th>Requested Times</th>
                    <th>Reason</th>
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
                      Requested On
                    </th>
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
                    list.map((req, i) => (
                      <tr key={req._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">
                          {req.employee?.fullName || req.employee?.name || "N/A"}
                        </td>
                        <td>
                            {req.attendanceRecord?.date ? moment(req.attendanceRecord.date).format("YYYY-MM-DD") : "—"}
                        </td>
                        <td>
                          <span className="text-danger">In: {req.attendanceRecord?.inTime || '—'}</span><br/>
                          <span className="text-danger">Out: {req.attendanceRecord?.outTime || '—'}</span>
                        </td>
                        <td>
                          <span className="text-success">In: {req.requestedClockIn}</span><br/>
                          <span className="text-success">Out: {req.requestedClockOut}</span>
                        </td>
                        <td>{req.reason.substring(0, 50)}...</td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td>{moment(req.createdAt).format("YYYY-MM-DD")}</td>
                        <td className="text-center pe-4">
                          <ActionButtons
                            canView={true}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() => handleOpenModal("view", req)}
                            onEdit={() => handleOpenModal("edit", req)}
                            onDelete={() => handleDeleteRegularization(req._id)}
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

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Showing {startIndex + 1} to {endIndex} of {totalRecords} requests
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
                  ? "New Regularization Request"
                  : modalMode === "edit"
                  ? "Edit Request"
                  : "Request Details"}
              </h5>

              {renderFormFields(modalMode === "view")}

              {(modalMode === "add" || modalMode === "edit") && (
                <button
                  className="btn text-white mt-3 w-100"
                  style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                  onClick={handleSaveRegularization}
                >
                  {modalMode === "add" ? "Submit Request" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceRegularization;