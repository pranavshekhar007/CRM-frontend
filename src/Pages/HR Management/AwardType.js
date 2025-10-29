// src/pages/AwardManagement/AwardTypeList.jsx
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
import { GiTrophy } from "react-icons/gi"; // A suitable icon for Award Type
import { usePermission } from "../../hooks/usePermission";
import ActionButtons from "../../Components/ActionButtons";

import {
  getAwardTypeListServ,
  addAwardTypeServ,
  updateAwardTypeServ,
  deleteAwardTypeServ,
} from "../../services/awartType.services"; // Integrated awardType services

function AwardTypeList() {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAwardType, setEditingAwardType] = useState(null);

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Award Types");

  const [awardTypeForm, setAwardTypeForm] = useState({
    name: "",
    description: "",
    status: true,
  });

  // Fetch Award Types
  const handleGetAwardTypes = async () => {
    setShowSkeleton(true);
    try {
      const res = await getAwardTypeListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load award types");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetAwardTypes();
  }, [payload]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingAwardType(null);
    setAwardTypeForm({ name: "", description: "", status: true });
    setShowModal(true);
  };

  const handleOpenEditModal = (awardType) => {
    setEditingAwardType(awardType);
    setAwardTypeForm({
      name: awardType.name || "",
      description: awardType.description || "",
      status: awardType.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAwardType(null);
    setAwardTypeForm({ name: "", description: "", status: true });
  };

  // Form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAwardTypeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save Award Type
  const handleSaveAwardType = async () => {
    if (!awardTypeForm.name) {
      toast.error("Please fill the Award Name field");
      return;
    }
    try {
      if (editingAwardType) {
        await updateAwardTypeServ({
          _id: editingAwardType._id,
          ...awardTypeForm,
        });
        toast.success("Award Type updated successfully!");
      } else {
        await addAwardTypeServ(awardTypeForm);
        toast.success("Award Type created successfully!");
      }
      handleCloseModal();
      handleGetAwardTypes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  // Delete
  const handleDeleteAwardType = async (id) => {
    if (window.confirm("Are you sure you want to delete this award type?")) {
      try {
        await deleteAwardTypeServ(id);
        toast.success("Award Type deleted successfully!");
        handleGetAwardTypes();
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to delete award type"
        );
      }
    }
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
      <Sidebar selectedMenu="Hr Management" selectedItem="Award Types" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Award Type Management</h3>

            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleOpenAddModal}
              >
                <RiAddLine size={20} className="me-1" />
                Add Award Type
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
                    placeholder="Search by Name..."
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
                    onClick={handleGetAwardTypes}
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
                      Name <GiTrophy size={14} />
                    </th>
                    <th>Description</th>
                    <th>Status</th>
                    <th
                      onClick={() => handleSort("createdAt")}
                      style={{ cursor: "pointer" }}
                    >
                      Created At
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
                          <Skeleton width={300} />
                        </td>
                        <td>
                          <Skeleton width={60} />
                        </td>
                        <td>
                          <Skeleton width={90} />
                        </td>
                        <td>
                          <Skeleton width={90} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((awardType, i) => (
                      <tr key={awardType._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">{awardType.name}</td>
                        <td
                          className="text-dark fw-medium px-3 py-2"
                          style={{
                            maxWidth: "250px",
                            fontSize: "0.875rem",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                        >
                          {awardType.description || "—"}
                        </td>

                        <td>
                          <span
                            className={`badge px-2 py-1 ${
                              awardType.status
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            }`}
                          >
                            {awardType.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          {moment(awardType.createdAt).format("YYYY-MM-DD")}
                        </td>
                        <td className="text-center pe-4">
                          <ActionButtons
                            // canView={canView}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() =>
                              toast.info(
                                `Viewing Award Type: ${awardType.name}`
                              )
                            }
                            onEdit={() => handleOpenEditModal(awardType)}
                            onDelete={() =>
                              handleDeleteAwardType(awardType._id)
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} award
              types
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
              className="modal-content p-4 rounded-4 bg-white"
              style={{ width: 364, maxHeight: "90vh", overflowY: "auto" }}
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
                {editingAwardType ? "Edit Award Type" : "Add Award Type"}
              </h5>

              <div className="mb-3">
                <label className="form-label">Award Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={awardTypeForm.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Employee of the Month"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={awardTypeForm.description}
                  onChange={handleFormChange}
                  placeholder="Recognition for outstanding performance..."
                ></textarea>
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  name="status"
                  className="form-check-input"
                  checked={awardTypeForm.status}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Active</label>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveAwardType}
              >
                {editingAwardType ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AwardTypeList;
