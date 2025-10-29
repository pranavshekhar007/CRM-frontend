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
import { BsPencil, BsTrash, BsEye } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";
import {
  MdOutlineFileCopy,
  MdOutlineCheckCircle,
  MdOutlineCancel,
} from "react-icons/md";

// Service imports (assuming they are implemented)
import {
  getDocumentTypeListServ,
  addDocumentTypeServ,
  updateDocumentTypeServ,
  deleteDocumentTypeServ,
} from "../../services/documentType.services";

function DocumentTypeList() {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDocumentType, setEditingDocumentType] = useState(null);

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Documents Type");

  // State field name changed to 'required' to match the backend JSON
  const [documentTypeForm, setDocumentTypeForm] = useState({
    name: "",
    description: "",
    required: false, // <-- CHANGED from isRequired to required
  });

  // Fetch document types
  const handleGetDocumentTypes = async () => {
    setShowSkeleton(true);
    try {
      const res = await getDocumentTypeListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load document types"
      );
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetDocumentTypes();
  }, [payload]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingDocumentType(null);
    setDocumentTypeForm({ name: "", description: "", required: false }); // <-- CHANGED
    setShowModal(true);
  };

  const handleOpenEditModal = (documentType) => {
    setEditingDocumentType(documentType);
    setDocumentTypeForm({
      name: documentType.name || "",
      description: documentType.description || "",
      required: documentType.required, // <-- CHANGED
    });
    setShowModal(true);
  };

  const handleViewDocumentType = (documentType) => {
    toast.info(`Viewing Document Type: ${documentType.name}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDocumentType(null);
    setDocumentTypeForm({ name: "", description: "", required: false }); // <-- CHANGED
  };

  // Form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDocumentTypeForm((prev) => ({
      ...prev,
      // name is now explicitly 'required' for the checkbox/toggle
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save document type
  const handleSaveDocumentType = async () => {
    if (!documentTypeForm.name) {
      toast.error("Please fill Document Type Name");
      return;
    }
    try {
      if (editingDocumentType) {
        await updateDocumentTypeServ({
          _id: editingDocumentType._id,
          ...documentTypeForm,
        });
        toast.success("Document type updated successfully!");
      } else {
        await addDocumentTypeServ(documentTypeForm);
        toast.success("Document type created successfully!");
      }
      handleCloseModal();
      handleGetDocumentTypes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  // Delete
  const handleDeleteDocumentType = async (id) => {
    if (window.confirm("Are you sure you want to delete this document type?")) {
      try {
        await deleteDocumentTypeServ(id);
        toast.success("Document type deleted successfully!");
        handleGetDocumentTypes();
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to delete document type"
        );
      }
    }
  };

  // Sorting
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
      <Sidebar selectedMenu="Hr Management" selectedItem="Document Types" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Document Type Management</h3>
            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleOpenAddModal}
              >
                <RiAddLine size={20} className="me-1" />
                Add Document Type
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0">
            <div className="row g-2 align-items-center">
              <div className="col-lg-8 col-md-8">
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
                    style={{
                      background: "#16A34A",
                      borderRadius: "0 0.5rem 0.5rem 0",
                    }}
                    onClick={handleGetDocumentTypes}
                  >
                    <FaSearch size={16} /> Search
                  </button>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 d-flex justify-content-end">
                {/* <button className="btn btn-outline-secondary me-2">
                  Filters
                </button> */}
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
                      style={{ cursor: "pointer", width: "15%" }}
                    >
                      Name
                    </th>
                    <th style={{ width: "40%" }}>Description</th>
                    <th
                      onClick={() => handleSort("required")} // <-- CHANGED to required
                      style={{ cursor: "pointer" }}
                    >
                      Required
                    </th>
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
                    /* Skeleton rows */
                    Array.from({ length: payload.pageCount }).map((_, i) => (
                      <tr key={i}>
                        <td className="ps-4 py-3">
                          <Skeleton width={20} />
                        </td>
                        <td>
                          <Skeleton width={120} />
                        </td>
                        <td>
                          <Skeleton width={300} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={90} />
                        </td>
                        <td className="text-center">
                          <Skeleton width={90} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((documentType, i) => (
                      <tr key={documentType._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">{documentType.name}</td>
                        <td
                          className="text-dark fw-medium px-3 py-2"
                          style={{
                            maxWidth: "250px",
                            fontSize: "0.875rem",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                        >
                          {documentType.description
                            ? documentType.description.substring(0, 100) +
                              (documentType.description.length > 100
                                ? "..."
                                : "")
                            : "—"}
                        </td>
                        <td>
                          {documentType.required ? (
                            <span
                              className="badge fw-semibold d-inline-flex align-items-center"
                              style={{
                                backgroundColor: "rgba(22, 163, 74, 0.15)",
                                color: "#16A34A",
                                padding: "0.4rem 0.75rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.8rem",
                              }}
                            >
                              <MdOutlineCheckCircle
                                className="me-1"
                                size={14}
                              />
                              Required
                            </span>
                          ) : (
                            <span
                              className="badge fw-semibold d-inline-flex align-items-center"
                              style={{
                                backgroundColor: "rgba(108, 117, 125, 0.15)",
                                color: "#6c757d",
                                padding: "0.4rem 0.75rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.8rem",
                              }}
                            >
                              <MdOutlineCancel className="me-1" size={14} />
                              Optional
                            </span>
                          )}
                        </td>
                        <td>
                          {moment(documentType.createdAt).format("YYYY-MM-DD")}
                        </td>
                        <td>
                          <ActionButtons
                            // canView={canView}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() => handleViewDocumentType(documentType)}
                            onEdit={() => handleOpenEditModal(documentType)}
                            onDelete={() =>
                              handleDeleteDocumentType(documentType._id)
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords} document
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
                  alt="Close"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseModal}
                />
              </div>

              <h5 className="mb-4 fw-semibold">
                {editingDocumentType
                  ? "Edit Document Type"
                  : "Add Document Type"}
              </h5>

              <div className="mb-3">
                <label className="form-label">Document Type Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={documentTypeForm.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Identity Proof, Address Proof"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={documentTypeForm.description}
                  onChange={handleFormChange}
                  placeholder="Provide a description of the document type"
                ></textarea>
              </div>

              <div className="mb-4 d-flex justify-content-between align-items-center">
                <label
                  className="form-label fw-semibold mb-0"
                  htmlFor="requiredSwitch"
                >
                  Required
                </label>

                <input
                  type="checkbox"
                  name="required"
                  id="requiredSwitch"
                  className={`custom-toggle-input`}
                  checked={documentTypeForm.required}
                  onChange={handleFormChange}
                  role="switch"
                  style={{
                    backgroundColor: documentTypeForm.required
                      ? "#16A34A"
                      : "#E0E0E0",
                  }}
                />
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveDocumentType}
                style={{ background: "#16A34A" }}
              >
                {editingDocumentType
                  ? "Update Document Type"
                  : "Create Document Type"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentTypeList;
