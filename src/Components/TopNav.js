import React from "react";
import { useGlobalState } from "../GlobalProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import useBreadcrumbs from "../hooks/useBreadcrumbs";

function TopNav() {
  const navigate = useNavigate();
  const { globalState, setGlobalState } = useGlobalState();
  const breadcrumbs = useBreadcrumbs();

  const handleSidebarToggle = () => {
    setGlobalState({
      ...globalState,
      showFullSidebar: !globalState.showFullSidebar,
    });
  };

  const handleLogoutFunc = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      setGlobalState({
        user: null,
        token: null,
        permissions: null,
      });
      toast.success("Admin logged out successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
      navigate("/");
    }
  };

  const roleName = globalState?.user?.role?.name || "Company";

  // Module icons (you can add more as needed)
  const moduleIcons = {
    Dashboard: "https://cdn-icons-png.flaticon.com/128/1828/1828791.png",
    Staff: "https://cdn-icons-png.flaticon.com/128/1144/1144760.png",
    "Hr Management": "https://cdn-icons-png.flaticon.com/128/9720/9720869.png",
    "Leave Management": "https://cdn-icons-png.flaticon.com/128/2278/2278049.png",
    "Attendance Management": "https://cdn-icons-png.flaticon.com/128/3839/3839635.png",
    Collections: "https://cdn-icons-png.flaticon.com/128/3839/3839635.png",
  };

  // Determine if the current breadcrumb is only Dashboard or a module
  const isDashboard = breadcrumbs.length === 1 && breadcrumbs[0].name === "Dashboard";
  const moduleIcon = !isDashboard ? moduleIcons[breadcrumbs[0].name] : moduleIcons["Dashboard"];

  return (
    <div className="topNavMain p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center">
        {/* LEFT SECTION */}
        <div className="d-flex align-items-center">
          {/* Sidebar Toggle */}
          <img
            src="https://cdn-icons-png.flaticon.com/128/2976/2976215.png"
            onClick={handleSidebarToggle}
            className="barIcon"
            alt="Toggle Sidebar"
            style={{
              height: "24px",
              width: "24px",
              cursor: "pointer",
              filter: "brightness(0) invert(1)",
            }}
          />

          {/* Breadcrumbs */}
          <div className="d-flex align-items-center breadcrumb-div ms-3">
            {/* Show icon for the module or dashboard */}
            {moduleIcon && (
              <img
                src={moduleIcon}
                alt="Module Icon"
                style={{ height: "18px", width: "18px", marginRight: "8px" }}
                className="breadcrumb-icon"
              />
            )}

            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path || index}>
                <button
                  className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? "active" : ""}`}
                  onClick={() => crumb.path && navigate(crumb.path)}
                  disabled={index === breadcrumbs.length - 1}
                >
                  <span className="breadcrumb-text">{crumb.name}</span>
                </button>

                {index < breadcrumbs.length - 1 && (
                  <span className="breadcrumb-separator">&gt;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="d-flex align-items-center navRightDiv">
          {/* Language */}
          {/* <div className="d-flex align-items-center me-3" style={{ cursor: "pointer" }}>
            <i className="fas fa-globe" style={{ marginRight: "10px", color: "white" }}></i>
            <p className="mb-0 me-1" style={{ color: "white", marginRight: "10px" }}>English</p>
            <img
              src="https://cdn-icons-png.flaticon.com/128/197/197374.png"
              alt="UK Flag"
              style={{ height: "14px", borderRadius: "2px" }}
            />
          </div> */}

          {/* Company Role */}
          <div className="d-flex align-items-center me-3" style={{ cursor: "pointer" }}>
            <p className="mb-0" style={{ color: "white" }}>{roleName}</p>
          </div>

          {/* User Profile */}
          <div
            className="user-profile-icon"
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "50%",
              backgroundColor: "#E0E0E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={handleLogoutFunc}
          >
            <img
              src={
                globalState?.user?.profilePic ||
                "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
              }
              alt="User"
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNav;
