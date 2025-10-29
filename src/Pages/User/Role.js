import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";

import { BsPencil, BsTrash, BsEye, BsChevronDown } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { RiAddLine } from "react-icons/ri";

import { getRoleListServ, deleteRoleServ } from "../../services/role.services";
import AddRoleModal from "./AddRoleModel";
import EditRoleModal from "./EditRoleModal";

function RolesList() {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  const [showAddRoleModal, setShowAddRoleModal] = useState(false); 
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "",
    sortOrder: "asc",
  });

  const handleGetRoles = async () => {
    setShowSkeleton(true);
    try {
      const res = await getRoleListServ(payload);
      const roles = res?.data?.data || [];
      const total = res?.data?.documentCount?.totalCount || 0;

      setList(roles);
      setTotalRecords(total);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load roles");
    }
    setShowSkeleton(false);
  };

  useEffect(() => {
    handleGetRoles();
  }, [payload]);

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRoleServ(id);
      toast.success("Role deleted successfully");
      handleGetRoles();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete role");
    }
  };

  const handleViewRole = (role) => {
    toast.info(`Viewing role: ${role.name}`);
  };

  const handleEditRole = (role) => {
    setEditRoleId(role._id);
    setShowEditRoleModal(true);
  };
  
  const handleCloseEditModal = () => {
    setShowEditRoleModal(false);
    setEditRoleId(null);
  };

  const handleAddRoleClick = () => {
    setShowAddRoleModal(true);
  };
  
  const handleRoleChanged = () => {
    setPayload((prev) => ({ ...prev, pageNo: 1 }));
    handleGetRoles(); 
  };

  const handleRoleAdded = handleRoleChanged;
  const handleRoleUpdated = handleRoleChanged;

  const handleSort = (field) => {
    setPayload((prev) => ({
      ...prev,
      sortByField: field,
      sortOrder:
        prev.sortByField === field && prev.sortOrder === "asc"
          ? "desc"
          : "asc",
      pageNo: 1,
    }));
  };

  const totalPages = Math.ceil(totalRecords / payload.pageCount);

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Staff" selectedItem="Role" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Roles</h3>
            <button
              className="btn text-white px-3"
              style={{
                background: "#16A34A",
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                borderRadius: "0.5rem",
              }}
              onClick={handleAddRoleClick}
            >
              <RiAddLine size={20} className="me-1" />
              Add New Role
            </button>
          </div>

          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0">
            <div className="row g-2 align-items-center">
              <div className="col-lg-8 col-md-8">
                <div className="input-group">
                  <input
                    className="form-control"
                    placeholder="Search roles..."
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
                    type="button"
                    style={{
                      background: "#16A34A",
                      borderRadius: "0 0.375rem 0.375rem 0",
                    }}
                    onClick={handleGetRoles}
                  >
                    <FaSearch size={16} /> &nbsp;Search
                  </button>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 d-flex justify-content-end">
                <div className="d-flex align-items-center">
                  <span className="me-2 text-muted">Per Page:</span>
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

          <div className="card shadow-sm p-0 rounded-3 border-0 overflow-hidden">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr
                      style={{
                        background: "#F8FAFC",
                        color: "#6B7280",
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      <th className="py-3 text-start ps-4" style={{ width: "5%" }}>
                        #
                      </th>
                      <th
                        className="py-3 text-start"
                        style={{ width: "15%" }}
                        onClick={() => handleSort("name")}
                      >
                        <div className="d-flex align-items-center cursor-pointer">
                          Name
                          <BsChevronDown
                            size={12}
                            className={`ms-1 ${
                              payload.sortByField === "name" &&
                              payload.sortOrder === "desc"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>
                      </th>
                      <th className="py-3 text-start" style={{ width: "20%" }}>
                        Description
                      </th>
                      <th className="py-3 text-start" style={{ width: "15%" }}>
                        Created At
                      </th>
                      <th className="py-3 text-start" style={{ width: "30%" }}>
                        Permissions
                      </th>
                      <th className="py-3 text-center pe-4" style={{ width: "15%" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {showSkeleton
                      ? Array.from({ length: payload.pageCount }).map((_, i) => (
                          <tr key={i} className="border-bottom">
                            <td className="ps-4 py-3">
                              <Skeleton width={20} />
                            </td>
                            <td className="py-3">
                              <Skeleton width={100} />
                            </td>
                            <td className="py-3">
                              <Skeleton width={150} />
                            </td>
                            <td className="py-3">
                              <Skeleton width={100} />
                            </td>
                            <td className="py-3">
                              <Skeleton width={200} />
                            </td>
                            <td className="py-3 text-center">
                              <Skeleton width={80} height={28} />
                            </td>
                          </tr>
                        ))
                      : list.length > 0
                      ? list.map((role, i) => {
                          const permissions = Array.isArray(role.permissions) 
                            ? role.permissions.map((perm) => perm.permissionId?.module)
                            : [];

                          return (
                            <tr key={role._id} className="border-bottom">
                              <td className="ps-4 py-3">
                                {(payload.pageNo - 1) * payload.pageCount + i + 1}
                              </td>
                              <td className="py-3 fw-semibold text-dark">
                                {role.name}
                              </td>
                              <td className="py-3 text-muted">
                                {role.description || "—"}
                              </td>
                              <td className="py-3 text-muted">
                                {role.createdAt
                                  ? moment(role.createdAt).format("YYYY-MM-DD")
                                  : "—"}
                              </td>
                              <td className="py-3">
                                <div className="d-flex flex-wrap align-items-center gap-1">
                                  {permissions.slice(0, 3).map((perm, idx) => (
                                    <span
                                      key={idx}
                                      className="badge px-2 py-1"
                                      style={{
                                        background: "#DBEAFE",
                                        color: "#1E40AF",
                                        fontWeight: 500,
                                        borderRadius: "0.25rem",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {perm}
                                    </span>
                                  ))}
                                  {permissions.length > 3 && (
                                    <span
                                      className="badge px-2 py-1"
                                      style={{
                                        background: "#F0F5FF",
                                        color: "#4F46E5",
                                        fontWeight: 500,
                                        borderRadius: "0.25rem",
                                        fontSize: "0.75rem",
                                      }}
                                      title={permissions.slice(3).join(", ")}
                                    >
                                      +{permissions.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="text-center pe-4 py-3">
                                <BsEye
                                  size={18}
                                  className="mx-2 text-primary"
                                  style={{ cursor: "pointer" }}
                                  title="View"
                                  onClick={() => handleViewRole(role)}
                                />
                                <BsPencil
                                  size={18}
                                  className="mx-2 text-warning"
                                  style={{ cursor: "pointer" }}
                                  title="Edit"
                                  onClick={() => handleEditRole(role)}
                                />
                                <BsTrash
                                  size={18}
                                  className="mx-2 text-danger"
                                  style={{ cursor: "pointer" }}
                                  title="Delete"
                                  onClick={() => handleDeleteRole(role._id)}
                                />
                              </td>
                            </tr>
                          );
                        })
                      : (
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
          </div>

        </div>
      </div>

      <AddRoleModal 
        show={showAddRoleModal} 
        onClose={() => setShowAddRoleModal(false)} 
        onRoleAdded={handleRoleAdded}
      />
      
      <EditRoleModal
        show={showEditRoleModal}
        onClose={handleCloseEditModal}
        onRoleUpdated={handleRoleUpdated}
        roleId={editRoleId}
      />
    </div>
  );
}

export default RolesList;