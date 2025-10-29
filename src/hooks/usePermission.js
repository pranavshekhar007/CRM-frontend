import { useGlobalState } from "../GlobalProvider";

export function usePermission(moduleName) {
  const { globalState } = useGlobalState();

  if (!globalState?.permissions) return {};

  try {
    const perms = Array.isArray(globalState.permissions)
      ? globalState.permissions
      : JSON.parse(globalState.permissions);

    const permission = perms.find(
      (p) => p?.permissionId?.module === moduleName
    );

    const selected = permission?.selectedActions || [];

    return {
      canView: selected.includes("view"),
      canCreate: selected.includes("create"),
      canUpdate: selected.includes("update"),
      canDelete: selected.includes("delete"),
    };
  } catch (error) {
    console.error("Failed to read permissions:", error);
    return {};
  }
}
