import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  getPremiumCustomerListServ,
  deletePremiumCustomerServ,
  exportPremiumCustomerServ,
} from "../../services/premiumCustomer.service";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { triggerFileDownload } from "../../utils/fileDownload";
import NoRecordFound from "../../Components/NoRecordFound";

function PremiumCustomerList() {
  const [list, setList] = useState([]);
  const [statics, setStatics] = useState(null);
  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "",
  });
  const [showSkelton, setShowSkelton] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Fetch premium customers
  const handleGetPremiumCustomers = async () => {
    if (list.length === 0) setShowSkelton(true);
    try {
      let response = await getPremiumCustomerListServ(payload);
      setList(response?.data?.data);
      setStatics(response?.data?.documentCount);
    } catch (error) {
      toast.error("Failed to fetch premium customers");
    }
    setShowSkelton(false);
  };

  const staticsArr = [
    {
      title: "Total Premium Users",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    // {
    //   title: "Completed Profile",
    //   count: statics?.activeCount,
    //   bgColor: "#63ED7A",
    // },
    // {
    //   title: "Incomplete Profile",
    //   count: statics?.inactiveCount,
    //   bgColor: "#FFA426",
    // },
  ];

  // Delete premium customer
  const handleDeletePremiumCustomer = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this premium customer?"
    );
    if (confirmed) {
      try {
        let response = await deletePremiumCustomerServ(id);
        if (response?.data?.statusCode === "200") {
          toast.success(response?.data?.message);
          handleGetPremiumCustomers();
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Internal Server Error");
      }
    }
  };

  useEffect(() => {
    handleGetPremiumCustomers();
  }, [payload]);

  useEffect(() => {
    if (statics?.totalCount && payload.pageCount) {
      const pages = Math.ceil(statics.totalCount / payload.pageCount);
      setTotalPages(pages);
    }
  }, [statics, payload.pageCount]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPayload({ ...payload, pageNo: newPage });
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await exportPremiumCustomerServ(payload, format);
      const ext = format === "excel" ? "xlsx" : format;
      triggerFileDownload(response.data, `productList.${ext}`);
    } catch (err) {
      toast.error("Download failed");
    }
  };

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="User Management" selectedItem="Premium Customer" />
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
          <div className="row m-0 p-0 d-flex align-items-center  my-4 topActionForm">
            <div className="col-lg-5 mb-2 col-md-12 col-12">
              <h3 className="mb-0 text-bold text-secondary">
                Premium Customers
              </h3>
            </div>
            <div className="col-lg-4 mb-2 col-md-12 col-12">
              <input
                className="form-control borderRadius24"
                placeholder="Search by name, email or phone"
                onChange={(e) =>
                  setPayload({ ...payload, searchKey: e.target.value })
                }
              />
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
                  <tbody>
                    <tr style={{ background: "#F3F3F3", color: "#000" }}>
                      <th className="text-center py-3">Sr. No</th>
                      <th className="text-center py-3">Full Name</th>
                      <th className="text-center py-3">Phone</th>
                      <th className="text-center py-3">Email</th>
                      <th className="text-center py-3">Opted For Premium</th>
                      <th className="text-center py-3">Action</th>
                    </tr>

                    {showSkelton
                      ? [1, 2, 3, 4, 5]?.map((i) => (
                          <tr key={i}>
                            <td className="text-center">
                              <Skeleton width={50} height={20} />
                            </td>
                            <td className="text-center">
                              <Skeleton width={100} height={20} />
                            </td>
                            <td className="text-center">
                              <Skeleton width={100} height={20} />
                            </td>
                            <td className="text-center">
                              <Skeleton width={100} height={20} />
                            </td>
                            <td className="text-center">
                              <Skeleton width={80} height={20} />
                            </td>
                            <td className="text-center">
                              <Skeleton width={70} height={20} />
                            </td>
                          </tr>
                        ))
                      : list?.map((v, i) => (
                          <tr key={v?._id}>
                            <td className="text-center">
                              {(payload.pageNo - 1) * payload.pageCount + i + 1}
                            </td>
                            <td className="text-center">
                              {v?.userId?.firstName || ""}{" "}
                              {v?.userId?.lastName || ""}
                            </td>
                            <td className="text-center">
                              {v?.userId?.phone || "-"}
                            </td>
                            <td className="text-center">
                              {v?.userId?.email || "-"}
                            </td>
                            <td className="text-center">
                              <div
                                className="badge py-2"
                                style={{ background: "#63ED7A" }}
                              >
                                Yes
                              </div>
                            </td>
                            <td className="text-center">
                              <button
                                onClick={() => handleViewUser(v)}
                                className="btn btn-info mx-2 text-light shadow-sm"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePremiumCustomer(v?._id)
                                }
                                className="btn btn-warning mx-2 text-light shadow-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>

                {list?.length === 0 && !showSkelton && <NoRecordFound />}

                {/* Pagination */}
                <div className="d-flex justify-content-center mt-3">
                  <ul className="pagination">
                    <li
                      className={`page-item ${
                        payload.pageNo === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(payload.pageNo - 1)}
                      >
                        &lt;
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <li
                          key={page}
                          className={`page-item ${
                            payload.pageNo === page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    <li
                      className={`page-item ${
                        payload.pageNo === totalPages ? "disabled" : ""
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && selectedUser && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Customer Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h6>User Info</h6>
                <p>
                  <b>Name:</b> {selectedUser?.userId?.firstName}{" "}
                  {selectedUser?.userId?.lastName}
                </p>
                <p>
                  <b>Email:</b> {selectedUser?.userId?.email}
                </p>
                <p>
                  <b>Phone:</b> {selectedUser?.userId?.phone}
                </p>

                <hr />
                <h6>Order Info</h6>
                <p>
                  <b>Order ID:</b> {selectedUser?.orderId?._id}
                </p>
                <p>
                  <b>Total Amount:</b> ₹{selectedUser?.orderId?.totalAmount}
                </p>
                <p>
                  <b>Status:</b> {selectedUser?.orderId?.status}
                </p>

                <hr />
                <h6>Shipping Address</h6>
                <p>
                  <b>Full Name:</b> {selectedUser?.orderId?.address?.fullName}
                </p>
                <p>
                  <b>Phone:</b> {selectedUser?.orderId?.address?.phone}
                </p>
                <p>
                  <b>City:</b> {selectedUser?.orderId?.address?.city}
                </p>
                <p>
                  <b>State:</b> {selectedUser?.orderId?.address?.state}
                </p>
                <p>
                  <b>Pincode:</b> {selectedUser?.orderId?.address?.pincode}
                </p>

                <hr />
                <h6>Products</h6>
                {selectedUser?.orderId?.product?.map((p, idx) => (
                  <div key={idx} className="mb-2">
                    <img
                      src={p?.productHeroImage}
                      alt="product"
                      width="70"
                      className="me-2"
                    />
                    <span>
                      <b>Qty:</b> {p?.quantity} | <b>Price:</b> ₹{p?.totalPrice}
                    </span>
                  </div>
                ))}

                <hr />
                <h6>Status History</h6>
                <ul>
                  {selectedUser?.orderId?.statusHistory?.map((s, idx) => (
                    <li key={idx}>
                      {s?.status} - {new Date(s?.updatedAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumCustomerList;
