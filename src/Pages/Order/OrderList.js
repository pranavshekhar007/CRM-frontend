import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  getCategoryServ,
  addCategoryServ,
  deleteCategoryServ,
  updateCategoryServ,
} from "../../services/category.service";
import { triggerFileDownload } from "../../utils/fileDownload";
import {
  exportOrderServ,
  getBookingListServ,
  updateBookingServ,
} from "../../services/bookingDashboard.services";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function OrderList() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [order, setOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const handleOpenPaymentModal = () => setShowPaymentModal(true);
  const handleClosePaymentModal = () => setShowPaymentModal(false);
  const [statics, setStatics] = useState(null);

  const [payload, setPayload] = useState({
    searchKey: "",
    status: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "",
    // sortByOrder:"asc"
  });
  const [showSkelton, setShowSkelton] = useState(false);
  const handleGetCategoryFunc = async () => {
    if (list.length == 0) {
      setShowSkelton(true);
    }
    try {
      let response = await getBookingListServ({ ...payload });
      setOrder(response?.data?.data);
      setList(response?.data?.data);
      setStatics(response?.data?.documentCount);
    } catch (error) {}
    setShowSkelton(false);
  };
  const staticsArr = [
    {
      title: "Total Order",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    {
      title: "Order Received",
      count: statics?.pendingCount,
      bgColor: "#FF4500",
    },
    {
      title: "Payment Ss Upload",
      count: statics?.paymentSsUploadCount,
      bgColor: "#00B8D9",
    },
    {
      title: "Payment Confirmed",
      count: statics?.orderPlacedCount,
      bgColor: "#007BFF",
    },
    {
      title: "Order Packed",
      count: statics?.orderPackedCount,
      bgColor: "#6610F2",
    },
    {
      title: "order Dispatched",
      count: statics?.orderDispatchCount,
      bgColor: "#00B8D9",
    },
    {
      title: "Completed Order",
      count: statics?.completedCount,
      bgColor: "#63ED7A",
    },
    {
      title: "Cancelled Order",
      count: statics?.cancelledCount,
      bgColor: "#FFA426",
    },
  ];
  useEffect(() => {
    handleGetCategoryFunc();
  }, [payload]);
  const [isLoading, setIsLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    image: "",
    status: "",
    show: false,
    imgPrev: "",
    specialApperence: "",
  });

  const resolveShippingMethod = (booking) => {
    const normalize = (s = "") => s.trim().toLowerCase();
    const topLevel = booking?.shipping;
    const fromHistory = booking?.statusHistory?.find(
      (s) => s.status === "outForDelivery"
    )?.shipping;
    return normalize(topLevel || fromHistory || "");
  };

  const handleAddCategoryFunc = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", addFormData?.name);
    formData.append("image", addFormData?.image);
    formData.append("status", addFormData?.status);
    formData.append("specialApperence", addFormData?.specialApperence);
    try {
      let response = await addCategoryServ(formData);
      if (response?.data?.statusCode == "200") {
        toast.success(response?.data?.message);
        setAddFormData({
          name: "",
          image: "",
          status: "",
          show: false,
          imgPrev: "",
        });
        handleGetCategoryFunc();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message
          ? error?.response?.data?.message
          : "Internal Server Error"
      );
    }
    setIsLoading(false);
  };

  const [editFormData, setEditFormData] = useState({
    name: "",
    image: "",
    status: "",
    _id: "",
    imgPrev: "",
    specialApperence: "",
  });
  const handleUpdateCategoryFunc = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (editFormData?.image) {
      formData?.append("image", editFormData?.image);
    }
    formData?.append("name", editFormData?.name);
    formData?.append("status", editFormData?.status);
    formData?.append("_id", editFormData?._id);
    formData?.append("specialApperence", editFormData?.specialApperence);
    try {
      let response = await updateCategoryServ(formData);
      if (response?.data?.statusCode == "200") {
        toast.success(response?.data?.message);
        setEditFormData({
          name: "",
          image: "",
          status: "",
          _id: "",
        });
        handleGetCategoryFunc();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message
          ? error?.response?.data?.message
          : "Internal Server Error"
      );
    }
    setIsLoading(false);
  };
  const deliveryStatusOptions = [
    { label: "All", value: "" },
    { label: "Order Received", value: "pending" },
    { label: "Payment Uploaded", value: "paymentSsUpload" },
    { label: "Payment Confirmed", value: "orderPlaced" },
    { label: "Order Packed", value: "orderPacked" },
    // { label: "Shipped", value: "shipping" },
    { label: "Order Dispatch", value: "outForDelivery" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const [updatedStatuses, setUpdatedStatuses] = useState({});
  const [statusUpdating, setStatusUpdating] = useState({});

  const handleStatusChange = (bookingId, newStatus) => {
    setUpdatedStatuses((prev) => ({
      ...prev,
      [bookingId]: newStatus,
    }));
  };

  const handleStatusUpdate = async (bookingId) => {
    let status = updatedStatuses[bookingId];
    if (!status) return alert("Please select a status before updating.");

    setStatusUpdating((prev) => ({ ...prev, [bookingId]: true }));

    try {
      const res = await updateBookingServ({ id: bookingId, status });

      if (res.status === 200) {
        toast.success("Status updated successfully!");
        handleGetCategoryFunc();
      } else {
        // if backend sends error message, show it
        toast.error(res?.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);

      const apiMessage = err?.response?.data?.message;
      const productId = err?.response?.data?.productId;
      const details = err?.response?.data?.details;

      if (apiMessage) {
        toast.error(
          productId ? `${apiMessage} (Product ID: ${productId})` : apiMessage
        );
      } else {
        toast.error("Something went wrong, please try again.");
      }
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const [totalPages, setTotalPages] = useState(1);

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

  const getStatusOptions = (currentStatus, shippingMethod) => {
    const normal = (s = "") => s.trim().toLowerCase();
    const normalized = normal(shippingMethod); // "homedelivery" | "lorrypay" | ""
    const shippingText =
      normalized === "homedelivery"
        ? "Home Delivery"
        : normalized === "lorrypay"
        ? "Lorry Pay"
        : shippingMethod || "Unknown";

    switch (currentStatus) {
      case "pending":
        return [
          { label: "Order Received", value: "pending" },
          { label: "Payment Details Uploaded", value: "paymentSsUpload" },
          { label: "Cancelled", value: "cancelled" },
        ];

      case "paymentSsUpload":
        return [
          { label: "Payment Details Uploaded", value: "paymentSsUpload" },
          { label: "Payment Confirmed", value: "approved" },
          { label: "Payment Rejected", value: "ssRejected" },
          { label: "Cancelled", value: "cancelled" },
        ];

      case "approved":
      case "orderPlaced":
        return [
          { label: "Payment Confirm", value: "orderPlaced" },
          { label: "Order Packed", value: "orderPacked" },
          { label: "Cancelled", value: "cancelled" },
        ];

      case "orderPacked":
        return [
          { label: "Order Packed", value: "orderPacked" },
          // Next → Out For Delivery
          { label: "Order Dispatch", value: "outForDelivery" },
          { label: "Cancelled", value: "cancelled" },
        ];

      case "outForDelivery":
        return [
          {
            label: `Order Dispatch - ${shippingText}`,
            value: "outForDelivery",
          },
          { label: "Order Completed", value: "completed" },
        ];

      case "completed":
        return [{ label: "Order Completed", value: "completed" }];

      case "cancelled":
        return [{ label: "Order Cancelled", value: "cancelled" }];

      case "ssRejected":
        return [
          { label: "Payment Rejected", value: "" },
          { label: "Payment Details Uploaded", value: "paymentSsUpload" },
          { label: "Cancelled", value: "cancelled" },
        ];

      default:
        return [
          { label: "Select Status", value: "" },
          { label: "Order Received", value: "pending" },
          { label: "Cancelled", value: "cancelled" },
        ];
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await exportOrderServ(payload, format);
      const ext = format === "excel" ? "xlsx" : format;
      triggerFileDownload(response.data, `OrderList.${ext}`);
    } catch (err) {
      toast.error("Download failed");
    }
  };

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Order Management" selectedItem="Orders" />
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
          <div className="row m-0 p-0 d-flex justify-content-between align-items-center my-4 topActionForm">
            <div className="col-lg-4 mb-2 col-md-12 col-12">
              <h3 className="mb-0 text-bold text-secondary">Orders</h3>
            </div>

            <div className="col-lg-4 mb-2  col-md-6 col-12">
              <div>
                <select
                  className="form-control borderRadius24"
                  onChange={(e) =>
                    setPayload({ ...payload, status: e.target.value })
                  }
                >
                  {deliveryStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
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
          <div className="container mt-4">
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                  <tr>
                    <th
                      className="text-center py-3"
                      style={{ borderRadius: "30px 0px 0px 30px" }}
                    >
                      Sr. No
                    </th>
                    <th>Order ID</th>
                    <th>Created</th>
                    <th>Customer</th>
                    <th>Payment Status</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkelton ? (
                    [...Array(10)].map((_, i) => (
                      <tr key={i}>
                        <td>
                          <Skeleton width={100} height={20} />
                        </td>
                        <td>
                          <Skeleton width={120} height={20} />
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <Skeleton circle width={32} height={32} />
                            <Skeleton width={100} height={20} />
                          </div>
                        </td>
                        <td>
                          <Skeleton width={100} height={35} />
                        </td>
                        <td>
                          <Skeleton width={140} height={20} />
                        </td>
                        <td>
                          <Skeleton width={80} height={30} />
                        </td>
                      </tr>
                    ))
                  ) : list?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        <NoRecordFound />
                      </td>
                    </tr>
                  ) : (
                    list.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">
                          {(payload.pageNo - 1) * payload.pageCount + index + 1}
                        </td>
                        <td>{item?.orderId || "-"}</td>
                        <td>
                          {moment(item?.createdAt).format("DD MMM YYYY hh:mm")}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={
                                item?.userId?.profilePic
                                  ? item?.userId?.profilePic
                                  : "https://cdn-icons-png.flaticon.com/128/149/149071.png"
                              }
                              alt="profile"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                              }}
                            />
                            {item?.address?.fullName
                              ? item.address.fullName
                              : item?.userId
                              ? [
                                  item?.userId?.firstName,
                                  item?.userId?.lastName,
                                ]
                                  .filter(Boolean)
                                  .join(" ") || "Guest"
                              : "Guest"}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "14px" }}>
                            <div>Txn ID: #{item?.paymentId || "N/A"}</div>
                            <div>Mode: {item?.modeOfPayment || "-"}</div>
                            <div>Paid: ₹{item?.totalAmount || "-"}</div>
                            <div className="d-flex align-items-center mt-1">
                              <div>
                                Payment Screenshot:{" "}
                                {item?.paymentSs ? (
                                  <span className="text-success">Uploaded</span>
                                ) : (
                                  <span className="text-danger">
                                    Not Uploaded
                                  </span>
                                )}
                              </div>
                              {item?.paymentSs && (
                                <button
                                  className="btn btn-sm btn-link text-primary ms-2"
                                  onClick={() => {
                                    setOrder(item); // set selected item
                                    handleOpenPaymentModal();
                                  }}
                                >
                                  <i className="fa fa-eye"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <select
                            value={updatedStatuses[item._id] || item?.status}
                            onChange={(e) =>
                              handleStatusChange(item._id, e.target.value)
                            }
                            className="form-select"
                          >
                            {getStatusOptions(
                              item?.status,
                              resolveShippingMethod(item)
                            ).map((opt, idx) => (
                              <option key={idx} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleStatusUpdate(item._id)}
                            className="btn btn-sm btn-primary mt-2"
                            disabled={statusUpdating[item._id]}
                          >
                            {statusUpdating[item._id]
                              ? "Updating..."
                              : "Update"}
                          </button>
                        </td>
                        <td>
                          {moment(item?.updatedAt).format(
                            "DD MMM YYYY hh:mm A"
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() =>
                              navigate(`/order-details/${item._id}`)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-5 px-3 py-3 mt-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold text-secondary">Show</span>
                  <select
                    className="form-select form-select-sm custom-select"
                    value={payload.pageCount}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        pageCount: parseInt(e.target.value),
                        pageNo: 1,
                      })
                    }
                  >
                    {[10, 25, 50, 100].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <nav>
                  <ul className="pagination pagination-sm mb-0 custom-pagination">
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

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= payload.pageNo - 1 &&
                          page <= payload.pageNo + 1)
                      ) {
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
                      } else if (
                        (page === payload.pageNo - 2 && page > 2) ||
                        (page === payload.pageNo + 2 && page < totalPages - 1)
                      ) {
                        return (
                          <li key={page} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
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
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      {addFormData?.show && (
        <div
          className="modal fade show d-flex align-items-center  justify-content-center "
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div
              className="modal-content"
              style={{
                borderRadius: "16px",
                background: "#f7f7f5",
                width: "364px",
              }}
            >
              <div className="d-flex justify-content-end pt-4 pb-0 px-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: "20px" }}
                  onClick={() =>
                    setAddFormData({
                      name: "",
                      image: "",
                      status: "",
                      show: false,
                      specialApperence: "",
                    })
                  }
                />
              </div>

              <div className="modal-body">
                <div
                  style={{
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                  className="d-flex justify-content-center w-100"
                >
                  <div className="w-100 px-2">
                    <h5 className="mb-4">Add Category</h5>
                    <div className="p-3 border rounded mb-2">
                      {addFormData?.imgPrev ? (
                        <img
                          src={addFormData?.imgPrev}
                          className="img-fluid w-100 shadow rounded"
                        />
                      ) : (
                        <p className="mb-0 text-center">No Item Selected !</p>
                      )}
                    </div>
                    <label className="">Upload Image</label>
                    <input
                      className="form-control"
                      type="file"
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          image: e.target.files[0],
                          imgPrev: URL.createObjectURL(e.target.files[0]),
                        })
                      }
                    />
                    <label className="mt-3">Name</label>
                    <input
                      className="form-control"
                      type="text"
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, name: e.target.value })
                      }
                    />
                    <label className="mt-3">Status</label>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Status</option>
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                    <label className="mt-3">Special Apperence</label>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          specialApperence: e.target.value,
                        })
                      }
                      value={addFormData?.specialApperence}
                    >
                      <option value="">Select Status</option>
                      <option value="Home">Home</option>
                    </select>
                    <button
                      className="btn btn-success w-100 mt-4"
                      onClick={
                        addFormData?.name &&
                        addFormData?.status &&
                        addFormData?.image &&
                        !isLoading
                          ? handleAddCategoryFunc
                          : undefined
                      }
                      disabled={
                        !addFormData?.name ||
                        !addFormData?.status ||
                        !addFormData?.image ||
                        isLoading
                      }
                      style={{
                        opacity:
                          !addFormData?.name ||
                          !addFormData?.status ||
                          !addFormData?.image ||
                          isLoading
                            ? "0.5"
                            : "1",
                      }}
                    >
                      {isLoading ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </div>
                <div className="d-flex justify-content-center"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {addFormData?.show && <div className="modal-backdrop fade show"></div>}
      {editFormData?._id && (
        <div
          className="modal fade show d-flex align-items-center  justify-content-center "
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div
              className="modal-content"
              style={{
                borderRadius: "16px",
                background: "#f7f7f5",
                width: "364px",
              }}
            >
              <div className="d-flex justify-content-end pt-4 pb-0 px-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: "20px" }}
                  onClick={() =>
                    setEditFormData({
                      name: "",
                      image: "",
                      status: "",
                      specialApperence: "",
                      _id: "",
                    })
                  }
                />
              </div>

              <div className="modal-body">
                <div
                  style={{
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                  className="d-flex justify-content-center w-100"
                >
                  <div className="w-100 px-2">
                    <h5 className="mb-4">Update Category</h5>
                    <div className="p-3 border rounded mb-2">
                      <img
                        src={editFormData?.imgPrev}
                        className="img-fluid w-100 shadow rounded"
                      />
                    </div>
                    <label className="">Upload Image</label>
                    <input
                      className="form-control"
                      type="file"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          image: e.target.files[0],
                          imgPrev: URL.createObjectURL(e.target.files[0]),
                        })
                      }
                    />
                    <label className="mt-3">Name</label>
                    <input
                      className="form-control"
                      type="text"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      value={editFormData?.name}
                    />
                    <label className="mt-3">Status</label>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value,
                        })
                      }
                      value={editFormData?.status}
                    >
                      <option value="">Select Status</option>
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                    <label className="mt-3">Special Apperence</label>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          specialApperence: e.target.value,
                        })
                      }
                      value={editFormData?.specialApperence}
                    >
                      <option value="">Select Status</option>
                      <option value="Home">Home</option>
                    </select>
                    {editFormData?.name && editFormData?.status ? (
                      <button
                        className="btn btn-success w-100 mt-4"
                        onClick={!isLoading && handleUpdateCategoryFunc}
                      >
                        {isLoading ? "Saving..." : "Submit"}
                      </button>
                    ) : (
                      <button
                        className="btn btn-success w-100 mt-4"
                        style={{ opacity: "0.5" }}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
                <div className="d-flex justify-content-center"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editFormData?._id && <div className="modal-backdrop fade show"></div>}
      <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Screenshot</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={order?.paymentSs}
            alt="Payment Screenshot"
            className="img-fluid rounded"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePaymentModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default OrderList;
