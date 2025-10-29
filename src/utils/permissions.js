
export const hasPermission = (permissions, moduleName, action) => {
    if (!permissions || !Array.isArray(permissions)) return false;
  
    return permissions.some((perm) => 
      perm.permissionId?.module === moduleName && 
      perm.actions.includes(action)
    );
  };
  