import { useLocation } from "react-router-dom";
import { useMemo } from "react";

const NAV_STRUCTURE = [
  {
    menu: "Dashboard",
    subMenu: [{ name: "Dashboard", path: "/" }],
  },
  {
    menu: "Staff",
    subMenu: [
      { name: "Users", path: "/user-list" },
      { name: "Role", path: "/role-list" },
    ],
  },
  {
    menu: "Hr Management",
    subMenu: [
      { name: "Branches", path: "/branch-list" },
      { name: "Department", path: "/department-list" },
      { name: "Documents Type", path: "/document-type" },
      { name: "Designation", path: "/designation-list" },
      {
        name: "Employee",
        path: "/employee-list",
        childMenu: [
          { name: "Create Employee", path: "/create-employee" },
          { name: "Edit Employee", path: "/edit-employee" },
        ],
      },
      { name: "Award Types", path: "/award-type" },
      { name: "Awards", path: "/award-list" },
      { name: "Promotion", path: "/promotion-list" },
    ],
  },
  {
    menu: "Leave Management",
    subMenu: [
      { name: "Leave Types", path: "/leave-type" },
      { name: "Leave Policies", path: "/leave-policy" },
      { name: "Leave Application", path: "/leave-application" },
      { name: "Leave Balance", path: "/leave-balance" },
    ],
  },
  {
    menu: "Attendance Management",
    subMenu: [
      { name: "Shifts", path: "/shift" },
      { name: "Attendance Policy", path: "/attendance-policy" },
      { name: "Attendance Record", path: "/attendance-record" },
      { name: "Attendance Regularization", path: "/attendance-regularization" },
    ],
  },
  {
    menu: "Collections",
    subMenu: [
      { name: "Collections", path: "/collection" },
      { name: "Profit", path: "/profit" },
      { name: "Expense", path: "/expense" },
    ],
  },
];

const useBreadcrumbs = () => {
  const { pathname } = useLocation();

  const breadcrumbs = useMemo(() => {
    let currentMenu = null;
    let currentSubMenu = null;
    let currentChildMenu = null;

    for (const group of NAV_STRUCTURE) {
      for (const sub of group.subMenu) {
        if (sub.childMenu) {
          for (const child of sub.childMenu) {
            const childBasePath = child.path.replace("/:id", "");
            if (pathname.startsWith(childBasePath)) {
              currentMenu = group.menu;
              currentSubMenu = sub;
              currentChildMenu = child;
              break;
            }
          }
        }
        if (currentChildMenu) break;

        if (pathname === sub.path) {
          currentMenu = group.menu;
          currentSubMenu = sub;
          break;
        }
      }
      if (currentSubMenu || currentChildMenu) break;
    }

    // Dashboard only
    if (pathname === "/") {
      return [{ name: "Dashboard", path: "/" }];
    }

    // Module path (e.g., Staff > Users)
    const crumbs = [];
    if (currentMenu) {
      crumbs.push({ name: currentMenu, path: null });
    }
    if (currentSubMenu) {
      crumbs.push({ name: currentSubMenu.name, path: currentSubMenu.path });
    }
    if (currentChildMenu) {
      crumbs.push({ name: currentChildMenu.name, path: currentChildMenu.path });
    }

    return crumbs;
  }, [pathname]);

  return breadcrumbs;
};

export default useBreadcrumbs;
