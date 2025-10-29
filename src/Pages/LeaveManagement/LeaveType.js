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
import { MdOutlineDateRange } from "react-icons/md";
import { TbListDetails } from "react-icons/tb";

import {
  getLeaveTypeListServ,
  addLeaveTypeServ,
  updateLeaveTypeServ,
  deleteLeaveTypeServ,
} from "../../services/leaveType.services";

function LeaveType() {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState(null);

  const { canView, canCreate, canUpdate, canDelete } = usePermission("Leave Types");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  const [leaveTypeForm, setLeaveTypeForm] = useState({
    leaveType: "",
    description: "",
    maxDaysPerYear: "",
    isPaid: false,
    color: "#16A34A",
    status: true,
  });

  // Fetch list
  const handleGetLeaveTypes = async () => {
    setShowSkeleton(true);
    try {
      const res = await getLeaveTypeListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load leave types");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetLeaveTypes();
  }, [payload]);

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLeaveTypeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenAddModal = () => {
    setEditingLeaveType(null);
    setLeaveTypeForm({
      leaveType: "",
      description: "",
      maxDaysPerYear: "",
      isPaid: false,
      color: "#16A34A",
      status: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (data) => {
    setEditingLeaveType(data);
    setLeaveTypeForm({
      leaveType: data.leaveType,
      description: data.description,
      maxDaysPerYear: data.maxDaysPerYear,
      isPaid: data.isPaid,
      color: data.color,
      status: data.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLeaveType(null);
  };

  const handleSaveLeaveType = async () => {
    if (!leaveTypeForm.leaveType || !leaveTypeForm.maxDaysPerYear) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingLeaveType) {
        await updateLeaveTypeServ({ _id: editingLeaveType._id, ...leaveTypeForm });
        toast.success("Leave Type updated successfully!");
      } else {
        await addLeaveTypeServ(leaveTypeForm);
        toast.success("Leave Type created successfully!");
      }
      handleCloseModal();
      handleGetLeaveTypes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteLeaveType = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave type?")) {
      try {
        await deleteLeaveTypeServ(id);
        toast.success("Leave Type deleted successfully!");
        handleGetLeaveTypes();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete leave type");
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

  const getPaidBadge = (isPaid) =>
    isPaid ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger";

  const getStatusBadge = (status) =>
    status ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger";

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Leave Management" selectedItem="Leave Type" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Leave Type Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleOpenAddModal}
              >
                <RiAddLine size={20} className="me-1" />
                Add Leave Type
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
                    placeholder="Search by Name or Description..."
                    value={payload.searchKey}
                    onChange={(e) =>
                      setPayload({ ...payload, searchKey: e.target.value, pageNo: 1 })
                    }
                  />
                  <button
                    className="btn text-white px-4"
                    style={{ background: "#16A34A" }}
                    onClick={handleGetLeaveTypes}
                  >
                    <FaSearch size={16} /> Search
                  </button>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 d-flex justify-content-end">
                <div className="d-flex align-items-center">
                  <span className="me-2 text-muted" style={{ fontSize: "0.85rem" }}>
                    Per Page:
                  </span>
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
                    <th onClick={() => handleSort("leaveType")} style={{ cursor: "pointer" }}>
                      Name
                    </th>
                    <th>Description</th>
                    <th onClick={() => handleSort("maxDaysPerYear")} style={{ cursor: "pointer" }}>
                      Max Days/Year <MdOutlineDateRange size={14} />
                    </th>
                    <th onClick={() => handleSort("isPaid")} style={{ cursor: "pointer" }}>
                      Type <TbListDetails size={14} />
                    </th>
                    <th>Status</th>
                    <th onClick={() => handleSort("createdAt")} style={{ cursor: "pointer" }}>
                      Created At
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
                          <td><Skeleton width={200} /></td>
                          <td><Skeleton width={50} /></td>
                          <td><Skeleton width={60} /></td>
                          <td><Skeleton width={60} /></td>
                          <td><Skeleton width={90} /></td>
                          <td><Skeleton width={90} /></td>
                        </tr>
                      ))
                    : list.length > 0
                    ? list.map((leave, i) => (
                        <tr key={leave._id}>
                          <td className="ps-4 py-3">{startIndex + i + 1}</td>
                          <td className="fw-semibold d-flex align-items-center">
                            <span
                              className="me-2 rounded-circle"
                              style={{
                                width: 12,
                                height: 12,
                                backgroundColor: leave.color || "#16A34A",
                                display: "inline-block",
                              }}
                            ></span>
                            {leave.leaveType}
                          </td>
                          <td>{leave.description || "—"}</td>
                          <td>{leave.maxDaysPerYear}</td>
                          <td>
                            <span className={`badge px-2 py-1 ${getPaidBadge(leave.isPaid)}`}>
                              {leave.isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge px-2 py-1 ${getStatusBadge(leave.status)}`}>
                              {leave.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>{moment(leave.createdAt).format("YYYY-MM-DD")}</td>
                          <td className="text-center pe-4">
                            <ActionButtons
                              canView={canView}
                              canUpdate={canUpdate}
                              canDelete={canDelete}
                              onEdit={() => handleOpenEditModal(leave)}
                              onDelete={() => handleDeleteLeaveType(leave._id)}
                            />
                          </td>
                        </tr>
                      ))
                    : (
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} leave types
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${payload.pageNo === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPayload({ ...payload, pageNo: payload.pageNo - 1 })}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${payload.pageNo === page ? "active" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPayload({ ...payload, pageNo: page })}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${payload.pageNo === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPayload({ ...payload, pageNo: payload.pageNo + 1 })}
                  >
                    Next
                  </button>
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
              style={{ width: 380, maxHeight: "98vh", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-end mb-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseModal}
                />
              </div>

              <h5 className="mb-4">
                {editingLeaveType ? "Edit Leave Type" : "Add Leave Type"}
              </h5>

              <div className="mb-3">
                <label className="form-label">Leave Type *</label>
                <input
                  type="text"
                  name="leaveType"
                  className="form-control"
                  value={leaveTypeForm.leaveType}
                  onChange={handleFormChange}
                  placeholder="Enter leave type"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={leaveTypeForm.description}
                  onChange={handleFormChange}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Max Days Per Year *</label>
                <input
                  type="number"
                  name="maxDaysPerYear"
                  className="form-control"
                  value={leaveTypeForm.maxDaysPerYear}
                  onChange={handleFormChange}
                  placeholder="Enter max days"
                />
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  name="isPaid"
                  className="form-check-input"
                  checked={leaveTypeForm.isPaid}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">isPaid</label>
              </div>

              <div className="mb-3">
                <label className="form-label">Color</label>
                <input
                  type="color"
                  name="color"
                  className="form-control form-control-color"
                  value={leaveTypeForm.color}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  name="status"
                  className="form-check-input"
                  checked={leaveTypeForm.status}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Active</label>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveLeaveType}
              >
                {editingLeaveType ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveType;
