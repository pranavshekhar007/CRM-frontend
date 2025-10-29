import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  getSubscriptionChitUsersListServ,
  approveSubscriptionChitUserServ,
  cancelSubscriptionChitUserServ,
  closeSubscriptionChitUserServ,
  exportSubscriptionChitUserServ,
} from "../../services/subscriptionChit.services";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NoRecordFound from "../../Components/NoRecordFound";
import { useNavigate } from "react-router-dom";
import { triggerFileDownload } from "../../utils/fileDownload";

function SubscriptionChitUsersList() {
  const [list, setList] = useState([]);
  const [showSkelton, setShowSkelton] = useState(false);
  const [payload, setPayload] = useState({
    searchKey: "",
    status: "",
    pageNo: 1,
    pageCount: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
    const [statics, setStatics] = useState(null);

  const navigate = useNavigate();
  const handleGetUsers = async () => {
    if (list.length === 0) setShowSkelton(true);
    try {
      const response = await getSubscriptionChitUsersListServ(payload);
      setList(response?.data?.data);
      setStatics(response?.data?.documentCount);
      const totalCount = response?.data?.documentCount?.totalCount || 0;
      setTotalPages(Math.ceil(totalCount / payload.pageCount));
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
    setShowSkelton(false);
  };

  useEffect(() => {
    handleGetUsers();
  }, [payload]);

  const staticsArr = [
    {
      title: "Total Chit User",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    {
      title: "Pending User",
      count: statics?.pendingCount,
      bgColor: "#FF4500",
    },
    {
      title: "Approved User",
      count: statics?.approvedCount,
      bgColor: "#00B8D9",
    },
    // {
    //   title: "Reject User",
    //   count: statics?.rejectCount,
    //   bgColor: "#007BFF",
    // },
    {
      title: "Completed User",
      count: statics?.completedCount,
      bgColor: "#63ED7A",
    },
    {
      title: "Cancelled User",
      count: statics?.cancelledCount,
      bgColor: "#FFA426",
    },
  ];

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPayload({ ...payload, pageNo: newPage });
    }
  };

  const handleApproveUser = async (id) => {
    try {
      const response = await approveSubscriptionChitUserServ(id);
      if (response?.data?.statusCode === 200) {
        toast.success("User approved successfully.");
        handleGetUsers();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approval failed.");
    }
  };

  const handleCancelUser = async (id) => {
    try {
      const response = await cancelSubscriptionChitUserServ(id);
      if (response?.data?.statusCode === 200) {
        toast.success("Subscription cancelled successfully.");
        handleGetUsers();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cancellation failed.");
    }
  };

  const handleCloseUser = async (id) => {
    try {
      const response = await closeSubscriptionChitUserServ(id);
      if (response?.data?.statusCode === 200) {
        toast.success("Subscription closed successfully.");
        handleGetUsers();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Closing failed.");
    }
  };

  const handleDownload = async (format) => {
        try {
          const response = await exportSubscriptionChitUserServ(payload, format);
          const ext = format === "excel" ? "xlsx" : format;
          triggerFileDownload(response.data, `chitUserList.${ext}`);
        } catch (err) {
          toast.error("Download failed");
        }
      };
  
  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Subscription" selectedItem="Chit User" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
        <div
            className="row mx-0 p-0"
            style={{
              position: "relative",
              top: "-75px",
              marginBottom: "-75px",
            }}
          >
            {staticsArr?.map((v, i) => {
              return (
                <div className="col-md-4 col-12 ">
                  <div className="topCard shadow-sm py-4 px-3 rounded mb-3">
                    <div className="d-flex align-items-center ">
                      <div
                        className="p-2 shadow rounded"
                        style={{ background: v?.bgColor }}
                      >
                        <img src="https://cdn-icons-png.flaticon.com/128/666/666120.png" />
                      </div>
                      <div className="ms-3">
                        <h6>{v?.title}</h6>
                        <h2 className="text-secondary">{v?.count}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="row m-0 p-0 d-flex align-items-center my-4 topActionForm">
            <div className="col-lg-2 mb-2 col-md-12 col-12">
              <h3 className="mb-0 text-bold text-secondary">
                Subscription Users
              </h3>
            </div>
            <div className="col-lg-4 mb-2 col-md-12 col-12">
              <input
                className="form-control borderRadius24"
                placeholder="Search"
                onChange={(e) =>
                  setPayload({ ...payload, searchKey: e.target.value })
                }
              />
            </div>
            <div className="col-lg-3 mb-2 col-md-6 col-12">
              <select
                className="form-control borderRadius24"
                onChange={(e) =>
                  setPayload({ ...payload, status: e.target.value })
                }
              >
                <option value="">All Chit User</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-lg-3 mb-2 col-md-6 col-12 dropdown">
              <button
                className="btn w-100 borderRadius24 text-light p-2 dropdown-toggle"
                style={{ background: "#227C9D" }}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Download
              </button>
              <ul className="dropdown-menu w-100">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownload("txt")}
                  >
                    Download as TXT
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownload("excel")}
                  >
                    Download as Excel
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownload("csv")}
                  >
                    Download as CSV
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-3">
            <div className="card-body px-2">
              <div className="table-responsive table-invoice">
                <table className="table">
                  <thead>
                    <tr style={{ background: "#F3F3F3", color: "#000" }}>
                      <th className="text-center py-3">Sr. No</th>
                      <th className="text-center py-3">Name</th>
                      <th className="text-center py-3">Phone</th>
                      <th className="text-center py-3">Email</th>
                      <th className="text-center py-3">Location</th>
                      <th className="text-center py-3">Status</th>
                      <th className="text-center py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showSkelton
                      ? [...Array(10)].map((_, i) => (
                          <tr key={i}>
                            {[...Array(7)].map((_, j) => (
                              <td className="text-center" key={j}>
                                <Skeleton />
                              </td>
                            ))}
                          </tr>
                        ))
                      : list?.map((v, i) => (
                          <tr key={v?._id}>
                            <td className="text-center">
                              {(payload.pageNo - 1) * payload.pageCount + i + 1}
                            </td>
                            <td className="text-center">{v?.name}</td>
                            <td className="text-center">{v?.phone}</td>
                            <td className="text-center">{v?.email}</td>
                            <td className="text-center">{v?.location}</td>
                            <td className="text-center text-capitalize">
                              {v?.status}
                            </td>
                            <td className="text-center">
                              {/* Pending */}
                              {v?.status === "pending" && (
                                <div className="d-flex justify-content-center gap-2 flex-wrap">
                                  <span
                                    className="badge bg-info p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      navigate(
                                        `/subscription-details/${v?._id}`
                                      )
                                    }
                                  >
                                    View Details
                                  </span>
                                  <span
                                    className="badge bg-success p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleApproveUser(v?._id)}
                                  >
                                    Approve
                                  </span>
                                  <span
                                    className="badge bg-danger p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleCancelUser(v?._id)}
                                  >
                                    Cancel
                                  </span>
                                </div>
                              )}

                              {/* Approved */}
                              {v?.status === "approved" && (
                                <div className="d-flex justify-content-center gap-2 flex-wrap">
                                  <span
                                    className="badge bg-info p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      navigate(
                                        `/subscription-details/${v?._id}`
                                      )
                                    }
                                  >
                                    View Details
                                  </span>
                                  <span
                                    className="badge bg-warning text-dark p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleCloseUser(v?._id)}
                                  >
                                    Close
                                  </span>
                                  <span
                                    className="badge bg-danger p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleCancelUser(v?._id)}
                                  >
                                    Cancel
                                  </span>
                                </div>
                              )}

                              {/* Cancelled */}
                              {v?.status === "cancelled" && (
                                <div className="d-flex justify-content-center gap-2 flex-wrap">
                                  <span
                                    className="badge bg-info p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      navigate(
                                        `/subscription-details/${v?._id}`
                                      )
                                    }
                                  >
                                    View Details
                                  </span>
                                  <span className="badge bg-danger p-2">
                                    Cancelled
                                  </span>
                                </div>
                              )}

                              {/* Completed */}
                              {v?.status === "completed" && (
                                <div className="d-flex justify-content-center gap-2 flex-wrap">
                                  <span
                                    className="badge bg-info p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      navigate(
                                        `/subscription-details/${v?._id}`
                                      )
                                    }
                                  >
                                    View Details
                                  </span>
                                  <span className="badge bg-success p-2">
                                    Completed
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>

                {list.length === 0 && !showSkelton && <NoRecordFound />}
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-center mt-3">
                <nav>
                  <ul className="pagination pagination-sm">
                    <li
                      className={`page-item ${
                        payload.pageNo === 1 && "disabled"
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(payload.pageNo - 1)}
                      >
                        &lt;
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          payload.pageNo === i + 1 && "active"
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        payload.pageNo === totalPages && "disabled"
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(payload.pageNo + 1)}
                      >
                        &gt;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionChitUsersList;
