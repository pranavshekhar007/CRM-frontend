import { useState, useEffect } from "react";

/**
 * Custom hook to handle user management logic
 * - Filters
 * - View toggle (list/grid)
 * - User info count
 */
const useUserManagement = (initialUsers = []) => {
  const [users, setUsers] = useState(initialUsers);
  const [visibleUsers, setVisibleUsers] = useState(initialUsers);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [allRoles, setAllRoles] = useState([]);

  // Setup unique roles for filter dropdown
  useEffect(() => {
    const roles = Array.from(new Set(initialUsers.map((u) => u.role)));
    setAllRoles(roles);
  }, [initialUsers]);

  // Apply filters whenever role or view changes
  useEffect(() => {
    let filtered = initialUsers;
    if (selectedRole !== "All Roles") {
      filtered = initialUsers.filter((u) => u.role === selectedRole);
    }
    setVisibleUsers(filtered);
  }, [selectedRole, initialUsers]);

  const toggleView = (mode) => {
    setViewMode(mode); // 'list' or 'grid'
  };

  const applyFilter = (role) => {
    setSelectedRole(role);
  };

  const resetFilter = () => {
    setSelectedRole("All Roles");
  };

  return {
    users,
    visibleUsers,
    viewMode,
    selectedRole,
    allRoles,
    toggleView,
    applyFilter,
    resetFilter,
  };
};

export default useUserManagement;
