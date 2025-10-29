// src/pages/AwardManagement/AwardList.jsx
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

// Icons
import { BsPencil, BsTrash, BsDownload, BsImage, BsEye } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";
import { MdPeopleOutline } from "react-icons/md";
import { GiTrophy } from "react-icons/gi";
import { BiCalendar } from "react-icons/bi";

// Services (Assuming paths for imports)
import {
  getAwardListServ,
  addAwardServ,
  updateAwardServ,
  deleteAwardServ,
} from "../../services/award.services";
import { getAwardTypeListServ } from "../../services/awartType.services";
import { getEmployeeListServ } from "../../services/employee.services";

function AwardList() {
  const [list, setList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [awardTypes, setAwardTypes] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAward, setEditingAward] = useState(null);

  const [payload, setPayload] = useState({
    searchKey: "", // Searches description in server logic
    employee: "", // Filter by employee ID
    awardType: "", // Filter by awardType ID
    pageNo: 1,
    pageCount: 10,
    sortByField: "awardDate",
    sortByOrder: "desc",
  });
  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Awards");

  const [awardForm, setAwardForm] = useState({
    employee: "",
    awardType: "",
    awardDate: moment().format("YYYY-MM-DD"),
    gift: "",
    monetaryValue: 0,
    description: "",
    certificate: null, // Holds File object
    photo: null, // Holds File object
  });

  // --- API Handlers ---

  // Fetch Awards List
  const handleGetAwards = async () => {
    setShowSkeleton(true);
    try {
      const res = await getAwardListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load awards");
    } finally {
      setShowSkeleton(false);
    }
  };

  // Fetch Dropdown data (Employees and Award Types)
  const handleGetDropdowns = async () => {
    try {
      // Employees list (using assumed service)
      const empRes = await getEmployeeListServ({ pageNo: 1, pageCount: 1000 });
      // Assumes employee objects have _id, fullName, and employeeId
      setEmployees(empRes?.data?.data || []);

      // Award Types list (using assumed service)
      const typeRes = await getAwardTypeListServ({
        pageNo: 1,
        pageCount: 1000,
      });
      setAwardTypes(typeRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
      // Optionally toast error here
    }
  };

  useEffect(() => {
    handleGetAwards();
    handleGetDropdowns();
  }, [
    payload.pageNo,
    payload.pageCount,
    payload.sortByField,
    payload.sortByOrder,
  ]);

  // Re-fetch only on search/filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      handleGetAwards();
    }, 500); // Debounce search

    return () => clearTimeout(handler);
  }, [payload.searchKey, payload.employee, payload.awardType]);

  // --- Modal Handlers ---

  const handleOpenAddModal = () => {
    setEditingAward(null);
    setAwardForm({
      employee: "",
      awardType: "",
      awardDate: moment().format("YYYY-MM-DD"),
      gift: "",
      monetaryValue: 0,
      description: "",
      certificate: null,
      photo: null,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (award) => {
    setEditingAward(award);
    setAwardForm({
      employee: award.employee?._id || "",
      awardType: award.awardType?._id || "",
      awardDate: moment(award.awardDate).format("YYYY-MM-DD"),
      gift: award.gift || "",
      monetaryValue: award.monetaryValue || 0,
      description: award.description || "",
      // Files are deliberately reset to null for security/simplicity; user must re-upload
      certificate: null,
      photo: null,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAward(null);
    // Reset form
    setAwardForm({
      employee: "",
      awardType: "",
      awardDate: moment().format("YYYY-MM-DD"),
      gift: "",
      monetaryValue: 0,
      description: "",
      certificate: null,
      photo: null,
    });
  };

  // --- Form Handlers ---

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setAwardForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setAwardForm((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  // Save Award (Handles FormData for file uploads)
  const handleSaveAward = async () => {
    if (!awardForm.employee || !awardForm.awardType || !awardForm.awardDate) {
      toast.error("Please select an Employee, Award Type, and Date.");
      return;
    }

    try {
      const formData = new FormData();

      // Append non-file fields
      formData.append("employee", awardForm.employee);
      formData.append("awardType", awardForm.awardType);
      formData.append("awardDate", awardForm.awardDate);
      formData.append("gift", awardForm.gift);
      // Ensure monetaryValue is sent as a number if needed, or simply append
      formData.append("monetaryValue", awardForm.monetaryValue || 0);
      formData.append("description", awardForm.description);

      // Append file fields if new files are selected
      if (awardForm.certificate) {
        formData.append("certificate", awardForm.certificate);
      }
      if (awardForm.photo) {
        formData.append("photo", awardForm.photo);
      }

      if (editingAward) {
        formData.append("_id", editingAward._id); // Crucial for update API
        await updateAwardServ(formData);
        toast.success("Award updated successfully!");
      } else {
        await addAwardServ(formData);
        toast.success("Award created successfully!");
      }
      handleCloseModal();
      handleGetAwards();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  // Delete
  const handleDeleteAward = async (id) => {
    if (window.confirm("Are you sure you want to delete this award record?")) {
      try {
        await deleteAwardServ(id);
        toast.success("Award deleted successfully!");
        handleGetAwards();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete award");
      }
    }
  };

  // --- Table & Pagination Logic ---

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

  // Helper to format currency
  const formatCurrency = (value) => {
    const num = Number(value);
    return isNaN(num) || num === 0 ? "—" : `$${num.toFixed(2)}`;
  };

  // Helper to display employee details
  const renderEmployee = (employee) => (
    <div>
      <div className="fw-semibold">{employee.fullName || "—"}</div>
      <small className="text-muted">{employee.employeeId || "—"}</small>
    </div>
  );

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Hr Management" selectedItem="Awards" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Awards</h3>

            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleOpenAddModal}
              >
                <RiAddLine size={20} className="me-1" />
                Add Award
              </button>
            )}
          </div>

          {/* Search & Filters (Matching Screenshot Layout) */}
          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0">
            <div className="row g-2 align-items-end">
              <div className="col-lg-3 col-md-12">
                <label
                  className="form-label text-muted"
                  style={{ fontSize: "0.85rem" }}
                >
                  Search Description
                </label>
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
                    onClick={handleGetAwards}
                  >
                    <FaSearch size={16} /> Search
                  </button>
                </div>
              </div>

              <div className="col-lg-2 col-md-4">
                <label
                  className="form-label text-muted"
                  style={{ fontSize: "0.85rem" }}
                >
                  Filter
                </label>
                <select
                  className="form-select"
                  value={payload.employee}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      employee: e.target.value,
                      pageNo: 1,
                    })
                  }
                >
                  <option value="">Employee</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-2 col-md-4">
                <label
                  className="form-label text-muted"
                  style={{ fontSize: "0.85rem", visibility: "hidden" }}
                >
                  Filter
                </label>
                <select
                  className="form-select"
                  value={payload.awardType}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      awardType: e.target.value,
                      pageNo: 1,
                    })
                  }
                >
                  <option value="">Award Type</option>
                  {awardTypes.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Per Page control on the right, matching screenshot style */}
              <div className="col-lg-5 col-md-4 d-flex justify-content-end">
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
                      Employee <MdPeopleOutline size={14} />
                    </th>
                    <th
                      onClick={() => handleSort("awardType")}
                      style={{ cursor: "pointer" }}
                    >
                      Award Type <GiTrophy size={14} />
                    </th>
                    <th
                      onClick={() => handleSort("awardDate")}
                      style={{ cursor: "pointer" }}
                    >
                      Award Date <BiCalendar size={14} />
                    </th>
                    <th>Gift</th>
                    <th>Value</th>
                    <th>Files</th>
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
                          <Skeleton width={120} height={30} />
                        </td>
                        <td>
                          <Skeleton width={150} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={60} />
                        </td>
                        <td>
                          <Skeleton width={70} />
                        </td>
                        <td>
                          <Skeleton width={100} />
                        </td>
                        <td>
                          <Skeleton width={90} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((award, i) => (
                      <tr key={award._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td>
                          {award.employee
                            ? renderEmployee(award.employee)
                            : "—"}
                        </td>
                        <td className="fw-semibold">
                          {award.awardType?.name || "—"}
                        </td>
                        <td>{moment(award.awardDate).format("YYYY-MM-DD")}</td>
                        <td>{award.gift || "—"}</td>
                        <td>{formatCurrency(award.monetaryValue)}</td>
                        <td style={{ minWidth: "150px" }}>
                          {award.certificate && (
                            <a
                              href={award.certificate}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="badge text-decoration-none me-1"
                              style={{
                                background: "#D9F99D",
                                color: "#65A30D",
                              }}
                              title="View Certificate"
                            >
                              Certificate
                            </a>
                          )}
                          {award.photo && (
                            <a
                              href={award.photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="badge text-decoration-none"
                              style={{
                                background: "#BAE6FD",
                                color: "#0369A1",
                              }}
                              title="View Photo"
                            >
                              Photo
                            </a>
                          )}
                          {!award.certificate && !award.photo && "—"}
                        </td>
                        <td
                          className="text-center pe-4"
                          style={{ minWidth: "130px" }}
                        >
                          <ActionButtons
                            // canView={canView}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() =>
                              toast.info(
                                `Description: ${award.description || "N/A"}`
                              )
                            }
                            onEdit={() => handleOpenEditModal(award)}
                            onDelete={() => handleDeleteAward(award._id)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
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

          {/* Pagination (Matching Screenshot Layout) */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Showing {startIndex + 1} to {endIndex} of {totalRecords} awards
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
              className="modal-content p-4 rounded-4 bg-white shadow"
              style={{ width: 500, maxHeight: "90vh", overflowY: "auto" }}
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
                {editingAward ? "Edit Award" : "Give New Award"}
              </h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Employee *</label>
                  <select
                    name="employee"
                    className="form-select"
                    value={awardForm.employee}
                    onChange={handleFormChange}
                    disabled={!!editingAward} // Prevent changing employee on edit
                  >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.fullName} ({e.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Award Type *</label>
                  <select
                    name="awardType"
                    className="form-select"
                    value={awardForm.awardType}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Award Type</option>
                    {awardTypes.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Award Date *</label>
                  <input
                    type="date"
                    name="awardDate"
                    className="form-control"
                    value={awardForm.awardDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Gift</label>
                  <input
                    type="text"
                    name="gift"
                    className="form-control"
                    value={awardForm.gift}
                    onChange={handleFormChange}
                    placeholder="e.g., Dinner Voucher, Plaque"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Monetary Value ($)</label>
                <input
                  type="number"
                  name="monetaryValue"
                  className="form-control"
                  value={awardForm.monetaryValue}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="2"
                  value={awardForm.description}
                  onChange={handleFormChange}
                  placeholder="Details about the award/achievement..."
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Certificate File</label>
                  <input
                    type="file"
                    name="certificate"
                    className="form-control"
                    onChange={handleFormChange}
                  />
                  {editingAward?.certificate && !awardForm.certificate && (
                    <small className="text-muted">
                      Current:{" "}
                      <a
                        href={editingAward.certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View File
                      </a>
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Photo File</label>
                  <input
                    type="file"
                    name="photo"
                    className="form-control"
                    onChange={handleFormChange}
                  />
                  {editingAward?.photo && !awardForm.photo && (
                    <small className="text-muted">
                      Current:{" "}
                      <a
                        href={editingAward.photo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Photo
                      </a>
                    </small>
                  )}
                </div>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveAward}
              >
                {editingAward ? "Update Award" : "Submit Award"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AwardList;
