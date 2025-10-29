import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { RiSaveLine } from "react-icons/ri";

// Make sure getPermissionListServ is correct
import { getPermissionListServ } from "../../services/permission.service";
import { getRoleDetailsServ, updateRoleServ } from "../../services/role.services"; 

const groupPermissionsByModule = (permissions) => {
  return permissions.reduce((acc, perm) => {
    const module = perm.module || "General";
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(perm);
    return acc;
  }, {});
};


const formatActionName = (action) => {
    if (!action) return "";
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const EditRoleModal = ({ show, onClose, onRoleUpdated, roleId }) => {
  const [roleData, setRoleData] = useState({
    name: "",
    description: "",
  });
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const groupedPermissions = useMemo(() => {
    return groupPermissionsByModule(availablePermissions);
  }, [availablePermissions]);

  const fetchInitialData = async () => {
    if (!roleId) return; 
    setLoading(true);

    try {
        // 1. Fetch ALL available permissions
        const permsRes = await getPermissionListServ({ pageCount: 1000, pageNo: 1 });
        const perms = permsRes?.data?.data || permsRes?.data || [];
        setAvailablePermissions(perms);
        
        // 2. Fetch the existing Role data using dedicated service
        // FIX 1: Use getRoleByIdServ (or equivalent that fetches a single role object)
        const roleRes = await getRoleDetailsServ(roleId); 
        
        // Assuming single role object is returned at res.data.data or res.data
        const roleDetails = roleRes?.data?.data || roleRes?.data;
        
        if (roleDetails) {
            setRoleData({
                name: roleDetails.name || "",
                description: roleDetails.description || "",
            });

            // 3. Initialize selectedPermissions state from fetched role data
            const initialSelected = (roleDetails.permissions || []).map(p => ({
                // Use permissionId._id if populated, or just permissionId if not
                permissionId: p.permissionId?._id || p.permissionId, 
                // FIX 2: Use "selectedActions" as per your API response structure
                actions: p.selectedActions || [], 
            }));
            setSelectedPermissions(initialSelected);
        }

    } catch (err) {
      console.error("Initial Data Fetch Error:", err);
      toast.error(err?.response?.data?.message || "Failed to load role and permissions.");
    }
    setLoading(false);
    setInitialLoadComplete(true);
  };

  const handleUpdateRole = async () => {
    if (!roleData.name.trim()) {
      return toast.error("Role Name is required.");
    }
    
    const permissionsPayload = selectedPermissions.filter(p => p.actions.length > 0);

    if (permissionsPayload.length === 0) {
      return toast.error("Please select at least one permission with actions.");
    }
    
    const payload = {
      name: roleData.name.trim(),
      description: roleData.description.trim(),
      permissions: permissionsPayload,
    };

    setIsSubmitting(true);
    try {
      await updateRoleServ(roleId, payload); 
      toast.success("Role updated successfully! ✅");
      onRoleUpdated();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update role"
      );
    }
    setIsSubmitting(false);
  };

  const handleCloseModal = () => {
    setRoleData({ name: "", description: "" });
    setSelectedPermissions([]);
    setInitialLoadComplete(false);
    onClose();
  };

  const handleTogglePermission = (permission) => {
    const isCurrentlySelected = selectedPermissions.some(
      (p) => p.permissionId === permission._id
    );

    if (isCurrentlySelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => p.permissionId !== permission._id)
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        {
          permissionId: permission._id,
          actions: permission.actions, 
        },
      ]);
    }
  };

  const handleToggleAction = (permissionId, action) => {
    setSelectedPermissions((prev) => {
      const existingPerm = prev.find((p) => p.permissionId === permissionId);
      
      if (!existingPerm) {
          return [...prev, { permissionId, actions: [action] }];
      }

      const actionIsSelected = existingPerm.actions.includes(action);

      let newActions;
      if (actionIsSelected) {
        newActions = existingPerm.actions.filter((a) => a !== action);
      } else {
        newActions = [...existingPerm.actions, action];
      }

      if (newActions.length === 0) {
        return prev.filter((p) => p.permissionId !== permissionId);
      } else {
        return prev.map((p) =>
          p.permissionId === permissionId ? { ...p, actions: newActions } : p
        );
      }
    });
  };

  const handleToggleAllPermissions = () => {
    const allPermissionsFullySelected = availablePermissions.length > 0 && 
      availablePermissions.every(perm => {
        const selected = selectedPermissions.find(p => p.permissionId === perm._id);
        return selected && selected.actions.length === (perm.actions?.length || 0);
      });

    if (allPermissionsFullySelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(
        availablePermissions.map((perm) => ({
          permissionId: perm._id,
          actions: perm.actions,
        }))
      );
    }
  };

  const isPermissionSelected = (permissionId) =>
    selectedPermissions.some((p) => p.permissionId === permissionId);
  
  const isActionSelected = (permissionId, action) =>
    selectedPermissions.find((p) => p.permissionId === permissionId)?.actions.includes(action) || false;
    
  const totalAvailableActions = availablePermissions.reduce((sum, p) => sum + (p.actions?.length || 0), 0);
  const totalSelectedActions = selectedPermissions.reduce((sum, p) => sum + (p.actions?.length || 0), 0);
  
  const allPermissionsFullySelected = availablePermissions.length > 0 && 
    availablePermissions.every(perm => {
      const selected = selectedPermissions.find(p => p.permissionId === perm._id);
      return selected && selected.actions.length === (perm.actions?.length || 0);
    });

  useEffect(() => {
    if (show && roleId) {
      fetchInitialData();
    }
  }, [show, roleId]);

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block" 
      tabIndex="-1"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Edit Role (ID: {roleId})</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            ></button>
          </div>
          
          <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            
            <div className="mb-3">
              <label htmlFor="roleName" className="form-label fw-semibold">
                Role Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="roleName"
                placeholder="Enter Role Name (e.g., Editor, Admin)"
                value={roleData.name}
                onChange={(e) => setRoleData({ ...roleData, name: e.target.value })}
                disabled={isSubmitting || loading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="form-label fw-semibold">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                rows="2"
                placeholder="Describe the purpose of this role (optional)"
                value={roleData.description}
                onChange={(e) => setRoleData({ ...roleData, description: e.target.value })}
                disabled={isSubmitting || loading}
              ></textarea>
            </div>

            <h5 className="fw-bold mb-3 mt-4">Role Permissions</h5>
            <p className="text-muted small mb-3">
              Select permissions for this role.
            </p>

            <div className="p-3 border rounded-3 bg-light-subtle">
              {loading || !initialLoadComplete ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    <p className="mt-2 text-muted">Loading role details and permissions...</p>
                </div>
              ) : (
                <>
                  <div className="form-check pb-2 mb-3 border-bottom">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAllPermissions"
                      checked={allPermissionsFullySelected}
                      onChange={handleToggleAllPermissions}
                      disabled={availablePermissions.length === 0 || isSubmitting}
                      ref={input => {
                        if (input) {
                            input.indeterminate = !allPermissionsFullySelected && totalSelectedActions > 0;
                        }
                      }}
                    />
                    <label
                      className="form-check-label fw-bold"
                      htmlFor="selectAllPermissions"
                    >
                      Select All Permissions
                    </label>
                    <span className="ms-2 badge bg-primary-subtle text-primary">
                      {totalSelectedActions} of {totalAvailableActions} selected
                    </span>
                  </div>
                  
                  {Object.keys(groupedPermissions).map((moduleName) => (
                    <div key={moduleName} className="mb-4">
                      {/* <h6 className="fw-bold mt-2 mb-3 text-success border-bottom pb-1">
                        {moduleName.toUpperCase()}
                      </h6> */}

                      <div className="row g-2">
                        {groupedPermissions[moduleName].map((permission) => {
                            const isSelected = isPermissionSelected(permission._id);
                            const selectedActionCount = selectedPermissions.find(p => p.permissionId === permission._id)?.actions.length || 0;
                            const totalActionCount = permission.actions?.length || 0;
                            
                            const isFullySelected = isSelected && selectedActionCount === totalActionCount;
                            const isPartiallySelected = isSelected && selectedActionCount > 0 && selectedActionCount < totalActionCount;

                            return (
                                <div key={permission._id} className="col-12">
                                    <div className={`card shadow-sm h-100 ${isSelected ? 'border-success' : 'border-light'}`}>
                                        <div className="card-body py-2 px-3">
                                            {/* Main Permission Checkbox */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`perm-${permission._id}`}
                                                        checked={isFullySelected}
                                                        onChange={() => handleTogglePermission(permission)}
                                                        disabled={isSubmitting}
                                                        ref={input => {
                                                            if (input) {
                                                                input.indeterminate = isPartiallySelected;
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        className="form-check-label fw-semibold ms-1"
                                                        htmlFor={`perm-${permission._id}`}
                                                    >
                                                        {permission.module}
                                                    </label>
                                                </div>
                                                <span className="badge bg-secondary-subtle text-secondary">
                                                    {selectedActionCount} of {totalActionCount} selected
                                                </span>
                                            </div>
                                            
                                            {/* Dynamic Actions Checkboxes (Nested) */}
                                            {/* 🚨 FIX: Removed 'isSelected &&' condition to always show actions for available permissions */}
                                            <div className="pt-2 ps-3 mt-2 border-top">
                                                <div className="d-flex flex-wrap gap-3">
                                                    {permission.actions.map((action) => (
                                                        <div
                                                            className="form-check form-check-inline"
                                                            key={action}
                                                        >
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`action-${permission._id}-${action}`}
                                                                checked={isActionSelected(permission._id, action)}
                                                                onChange={() => handleToggleAction(permission._id, action)}
                                                                disabled={isSubmitting}
                                                            />
                                                            <label
                                                                className="form-check-label text-capitalize small"
                                                                htmlFor={`action-${permission._id}-${action}`}
                                                            >
                                                                {formatActionName(action)}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                      </div>

                    </div>
                  ))}
                  
                  {availablePermissions.length === 0 && !loading && (
                      <p className="text-center text-muted py-3">No available permissions found.</p>
                  )}
                </>
              )}
            </div>
            
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn text-white"
              style={{ background: "#16A34A" }}
              onClick={handleUpdateRole}
              disabled={isSubmitting || loading || !roleData.name.trim() || totalSelectedActions === 0}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating Role...
                </>
              ) : (
                <>
                  <RiSaveLine size={20} className="me-1" />
                  Update Role
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;