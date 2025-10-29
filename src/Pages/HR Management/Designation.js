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

// Icons from the DepartmentList.jsx reference and the UI screenshot
import { BsPencil, BsTrash, BsEye } from "react-icons/bs"; // Added BsEye for 'View'
import { FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { MdOutlineWorkOutline } from "react-icons/md";
import { GoOrganization } from "react-icons/go"; // Icon for Department

// NOTE: These service calls will need to be created based on your backend
// assuming a similar structure to department services
import {
  getDesignationListServ,
  addDesignationServ,
  updateDesignationServ,
  deleteDesignationServ,
} from "../../services/designation.services"; // You need to implement these

// To fetch the list of departments for the dropdown
import { getDepartmentListServ } from "../../services/department.services";

function DesignationList() {
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]); // List of departments
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);

  // State for View/Edit/Delete actions in the table
  const [actionMessage, setActionMessage] = useState("");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Designation");

  // Designation form structure based on the image's columns: Name, Description, Department, Status
  const [designationForm, setDesignationForm] = useState({
    name: "",
    department: "", // Will hold the department's _id
    description: "",
    status: true,
  });

  // Fetch designations
  const handleGetDesignations = async () => {
    setShowSkeleton(true);
    try {
      // NOTE: Update 'getDesignationListServ' to fetch designations
      const res = await getDesignationListServ(payload);
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load designations"
      );
    } finally {
      setShowSkeleton(false);
    }
  };

  // Fetch departments (to populate the dropdown in the modal)
  const handleGetDepartments = async () => {
    try {
      // Fetch a full list of departments (up to 1000) for the dropdown
      const res = await getDepartmentListServ({ pageNo: 1, pageCount: 1000 });
      // Departments usually have a 'branch' nested, so we'll need to handle that for display
      setDepartments(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load departments for selection.");
    }
  };

  useEffect(() => {
    handleGetDesignations();
    handleGetDepartments();
  }, [payload]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingDesignation(null);
    setDesignationForm({
      name: "",
      department: "",
      description: "",
      status: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (designation) => {
    setEditingDesignation(designation);
    setDesignationForm({
      name: designation.name || "",
      department: designation.department?._id || "", // Assuming department is an object
      description: designation.description || "",
      status: designation.status,
    });
    setShowModal(true);
  };

  // Placeholder for View functionality (since the image shows a view icon)
  const handleViewDesignation = (designation) => {
    // In a real application, this would open a non-editable modal or navigate to a detail page
    toast.info(`Viewing Designation: ${designation.name}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDesignation(null);
    setDesignationForm({
      name: "",
      department: "",
      description: "",
      status: true,
    });
  };

  // Form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDesignationForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save designation
  const handleSaveDesignation = async () => {
    // Name and Department are required fields for a designation
    if (!designationForm.name || !designationForm.department) {
      toast.error("Please fill Designation Name and select a Department");
      return;
    }
    try {
      if (editingDesignation) {
        // NOTE: Update 'updateDesignationServ'
        await updateDesignationServ({
          _id: editingDesignation._id,
          ...designationForm,
        });
        toast.success("Designation updated successfully!");
      } else {
        // NOTE: Update 'addDesignationServ'
        await addDesignationServ(designationForm);
        toast.success("Designation created successfully!");
      }
      handleCloseModal();
      handleGetDesignations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  // Delete
  const handleDeleteDesignation = async (id) => {
    if (window.confirm("Are you sure you want to delete this designation?")) {
      try {
        // NOTE: Update 'deleteDesignationServ'
        await deleteDesignationServ(id);
        toast.success("Designation deleted successfully!");
        handleGetDesignations();
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to delete designation"
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

  // Utility function to display Department and Branch from the joined data
  const getDepartmentInfo = (designation) => {
    if (!designation.department) return "—";
    const departmentName = designation.department?.name || "Unknown Department";
    const branchName =
      designation.department?.branch?.branchName || "No Branch";

    // Formatting to match the look of the attached image: 'Department Name Branch: Branch Name'
    return (
      <div style={{ fontSize: "0.85rem" }}>
        <div className="fw-semibold">{departmentName}</div>
        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
          Branch: {branchName}
        </div>
      </div>
    );
  };

  // Utility to find the branch of a department from the departments list (mainly for edit form if needed, though branch is usually nested in department object)
  const getDepartmentAndBranchText = (departmentObj) => {
    if (!departmentObj) return "—";
    const departmentName = departmentObj.name;
    const branchName = departmentObj.branch?.branchName || "Corporate Center"; // Default as per image

    return (
      <>
        <div className="fw-semibold">{departmentName}</div>
        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
          Branch: {branchName}
        </div>
      </>
    );
  };

  return (
    <div className="bodyContainer">
      {/* Assuming Sidebar and TopNav are implemented and passed correctly */}
      <Sidebar selectedMenu="Hr Management" selectedItem="Designation" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Designation Management</h3>

            {canCreate && (
              <button
                className="btn text-white px-3"
                style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                onClick={handleOpenAddModal}
              >
                <RiAddLine size={20} className="me-1" />
                Add Designation
              </button>
            )}
          </div>

          {/* Search Bar - Changed layout slightly to match image better */}
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
                    onClick={handleGetDesignations}
                  >
                    <FaSearch size={16} /> Search
                  </button>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 d-flex justify-content-end">
                {/* <button className="btn btn-outline-secondary me-2">Filters</button> */}
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
                      Name <MdOutlineWorkOutline size={14} />
                    </th>
                    <th style={{ width: "30%" }}>Description</th>{" "}
                    {/* Not sortable in image */}
                    <th
                      onClick={() => handleSort("department")}
                      style={{ cursor: "pointer", width: "20%" }}
                    >
                      Department <GoOrganization size={14} />{" "}
                      {/* Changed to GoOrganization */}
                    </th>
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
                          <Skeleton width={120} />
                        </td>
                        <td>
                          <Skeleton width={300} />
                        </td>
                        <td>
                          <Skeleton width={150} />
                        </td>
                        <td>
                          <Skeleton width={60} />
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
                    list.map((designation, i) => (
                      <tr key={designation._id}>
                        <td className="ps-4 py-3">{startIndex + i + 1}</td>
                        <td className="fw-semibold">{designation.name}</td>
                        {/* Truncate long description */}
                        <td>
                          {designation.description
                            ? designation.description.substring(0, 100) +
                              (designation.description.length > 100
                                ? "..."
                                : "")
                            : "—"}
                        </td>
                        <td>{getDepartmentInfo(designation)}</td>
                        <td>
                          <span
                            className={`badge px-2 py-1 ${
                              designation.status
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            } fw-normal`}
                          >
                            {designation.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          {moment(designation.createdAt).format("YYYY-MM-DD")}
                        </td>
                        <td className="text-center pe-4">
                          <ActionButtons
                            // canView={canView}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() => handleViewDesignation(designation)}
                            onEdit={() => handleOpenEditModal(designation)}
                            onDelete={() =>
                              handleDeleteDesignation(designation._id)
                            }
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords}{" "}
              designations
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
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png" // Placeholder close icon
                  alt="Close"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseModal}
                />
              </div>

              <h5 className="mb-4 fw-semibold">
                {editingDesignation ? "Edit Designation" : "Add Designation"}
              </h5>

              <div className="mb-3">
                <label className="form-label">Designation Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={designationForm.name}
                  onChange={handleFormChange}
                  placeholder="e.g., IT Manager, HR Manager"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Department *</label>
                <select
                  name="department"
                  className="form-select"
                  value={designationForm.department}
                  onChange={handleFormChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    // The value should be the department's ID
                    <option key={d._id} value={d._id}>
                      {d.name} {d.branch ? ` (${d.branch.branchName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={designationForm.description}
                  onChange={handleFormChange}
                  placeholder="Provide a brief description of the role's responsibilities"
                ></textarea>
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  name="status"
                  className="form-check-input"
                  checked={designationForm.status}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Active</label>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveDesignation}
                style={{ background: "#16A34A" }}
              >
                {editingDesignation
                  ? "Update Designation"
                  : "Create Designation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DesignationList;
