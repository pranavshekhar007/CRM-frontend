import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { getBookingDetailsServ } from "../../services/bookingDashboard.services";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getStatusOptions } from "../../utils/statusHelper";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [list, setList] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const [showSkelton, setShowSkelton] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    if (list.length == 0) {
      setShowSkelton(true);
    }
    try {
      const res = await getBookingDetailsServ(id);
      setOrder(res?.data?.data);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setShowSkelton(false);
    }
  };

  if (showSkelton) {
    return (
      <div className="bodyContainer">
        <Sidebar selectedMenu="Orders" selectedItem="Orders" />
        <div className="mainContainer">
          <TopNav />
          <div className="container-fluid p-lg-4 p-md-3 p-2">
            <div className="card shadow-sm p-4 mb-4">
              <Skeleton height={30} width={200} className="mb-3" />
              <Skeleton count={5} height={20} className="mb-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const user = order?.userId || {};
  const address = order?.address || {};
  const products = [
    ...(order?.product || []).map((item) => ({ ...item, type: "product" })),
    ...(order?.comboProduct || []).map((item) => ({
      ...item,
      type: "comboProduct",
    })),
  ];

  const handleOpenPaymentModal = () => setShowPaymentModal(true);
  const handleClosePaymentModal = () => setShowPaymentModal(false);

  const isPaymentUploaded = order?.paymentSs;

  const formattedStatusFlow = order?.statusHistory?.map((log) => {
    const options = getStatusOptions(
      log.status,
      order?.shipping || order?.shippingMethod
    );
    const matched = options.find((o) => o.value === log.status);

    return {
      key: log.status,
      icon:
        log.status === "pending"
          ? "🕓"
          : log.status === "ssRejected"
          ? "❗"
          : log.status === "approved"
          ? "💳"
          : log.status === "orderPlaced"
          ? "💳"
          : log.status === "orderPacked"
          ? "📦"
          : log.status === "outForDelivery"
          ? "📍"
          : log.status === "completed"
          ? "✅"
          : log.status === "cancelled"
          ? "❌"
          : "⏳",
      label: matched ? matched.label : log.status,
      date: moment(log.updatedAt).format("ddd, DD MMM YYYY - h:mmA"),
    };
  });

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Orders" selectedItem="Orders" />
      <div className="mainContainer">
        <TopNav />
        <div className="container-fluid p-lg-4 p-md-3 p-2">
          <div className="row g-4">
            {/* Left Column */}
            <div className="col-lg-8">
              <div className="card shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">
                    Order #{order?.orderId?.slice(0, 8).toUpperCase()}
                  </h4>
                  <button
                    className="btn"
                    onClick={() => navigate(`/order-invoice/${order?._id}`)}
                    style={{
                      backgroundColor: "#28c76f",
                      color: "#fff",
                      fontWeight: "600",
                      border: "none",
                      borderRadius: "5px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="fa fa-download"></i> Invoice
                  </button>
                </div>

                <table className="table">
                  <thead className="table-light">
                    <tr>
                      <th>Product Details</th>
                      <th>Item Price</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item, i) => {
                      if (item.type === "product") {
                        const product = item?.productId;
                        return (
                          <tr key={`product-${i}`}>
                            <td>
                              <div>
                                <img
                                  src={product?.productHeroImage}
                                  alt="product"
                                  style={{ width: 50 }}
                                />
                                <strong className="m-4">{product?.name}</strong>
                              </div>
                            </td>
                            <td>
                              <div style={{ lineHeight: "1.2" }}>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    color: "#28a745",
                                  }}
                                >
                                  ₹{product?.discountedPrice || product?.price}
                                </div>
                                {product?.discountedPrice && (
                                  <div
                                    style={{
                                      textDecoration: "line-through",
                                      color: "#888",
                                      fontSize: "13px",
                                      marginTop: "4px",
                                    }}
                                  >
                                    ₹{product?.price}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{item?.quantity || 1}</td>
                            <td>
                              ₹
                              {(
                                (product?.discountedPrice ||
                                  product?.price ||
                                  0) * (item?.quantity || 1) || 0
                              ).toFixed(2)}
                            </td>
                          </tr>
                        );
                      }

                      if (item.type === "comboProduct") {
                        const combo = item?.comboProductId;
                        return (
                          <tr key={`combo-${i}`}>
                            <td>
                              <div>
                                <img
                                  src={combo?.productHeroImage}
                                  alt="combo"
                                  style={{ width: 50 }}
                                />
                                <strong className="m-3">{combo?.name}</strong>
                                <ul className="list-unstyled mb-0 mt-2 text-start">
                                  {combo?.productId?.map((prodObj, idx) => (
                                    <li
                                      key={idx}
                                      className="mb-1 px-2 py-1 bg-light rounded text-dark"
                                    >
                                      {prodObj?.product?.name} (
                                      {prodObj?.quantity})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                            <td>
                              <div style={{ lineHeight: "1.2" }}>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    color: "#28a745",
                                  }}
                                >
                                  ₹{combo?.pricing?.comboPrice}
                                </div>
                                {combo?.pricing?.offerPrice && (
                                  <div
                                    style={{
                                      textDecoration: "line-through",
                                      color: "#888",
                                      fontSize: "13px",
                                      marginTop: "4px",
                                    }}
                                  >
                                    ₹{combo?.pricing?.offerPrice}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{item?.quantity || 1}</td>
                            <td>
                              ₹
                              {(
                                (combo?.pricing?.comboPrice || 0) *
                                  (item?.quantity || 1) || 0
                              ).toFixed(2)}
                            </td>
                          </tr>
                        );
                      }

                      return null;
                    })}
                  </tbody>
                </table>

                <div className="d-flex flex-column align-items-end mt-3">
                  <div>Total: ₹{order?.totalAmount}</div>
                  <div>Delivery Charge: ₹{order?.deliveryCharge || 0}</div>
                  <div>
                    Total Paid: ₹
                    {Number(order?.totalAmount) +
                      (Number(order?.deliveryCharge) > 0
                        ? Number(order?.deliveryCharge)
                        : 0)}
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="card shadow-sm p-4 mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Order Status</h5>
                </div>

                <ul className="order-tracker ps-0">
                  {formattedStatusFlow.map((step, idx) => (
                    <li key={idx} className="completed">
                      <div className="icon">{step.icon}</div>
                      <div className="details">
                        <strong>{step.label}</strong>
                        <div className="text-muted small">{step.date}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-lg-4">
              {/* Customer Details */}
              <div className="card shadow-sm p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h6 className="fw-bold mb-0">Customer Details</h6>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <img
                    src={
                      user?.profilePic
                        ? user?.profilePic
                        : "https://cdn-icons-png.flaticon.com/128/149/149071.png"
                    }
                    alt="profile"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                    }}
                  />
                  <div className="ms-3">
                    <div className="fw-semibold">{address?.fullName}</div>
                    <div className="text-muted small">Customer</div>
                  </div>
                </div>

                <div className="mb-2 d-flex align-items-center">
                  <i className="fa fa-envelope me-2 text-muted"></i>
                  <span>{user?.email || "-"}</span>
                </div>

                <div className="d-flex align-items-center">
                  <i className="fa fa-phone me-2 text-muted"></i>
                  <span>{user?.phone || "-"}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="card shadow-sm p-3 mb-4">
                <h6 className="fw-bold mb-2">Shipping Address</h6>
                <div className="mb-2">
                  <strong>Shipping:</strong> {order?.shipping}
                </div>

                <div>{address.fullName}</div>
                <div>{address.phone}</div>
                <div>
                  {address.area}, {address.city}, {address.state} -{" "}
                  {address.pincode}
                </div>
                <div>{address.country}</div>
              </div>

              {/* Payment Details */}
              <div className="card shadow-sm p-3 mb-4">
                <h6 className="fw-bold mb-3">Payment Details</h6>

                <div>Transaction ID: #{order?.paymentId || "N/A"}</div>
                <div>Payment Mode: {order?.modeOfPayment || "-"}</div>
                <div>Delivery Charge: ₹{order?.deliveryCharge || 0}</div>
                <div>
                  Total Paid: ₹
                  {Number(order?.totalAmount) +
                    (Number(order?.deliveryCharge) > 0
                      ? Number(order?.deliveryCharge)
                      : 0)}
                </div>

                <div className="d-flex align-items-center mt-2">
                  <div className="me-2 fw-medium">
                    Payment Screenshot:{" "}
                    {isPaymentUploaded ? (
                      <span className="text-success">Uploaded</span>
                    ) : (
                      <span className="text-danger">Not Uploaded</span>
                    )}
                  </div>

                  {isPaymentUploaded && (
                    <button
                      onClick={handleOpenPaymentModal}
                      className="btn"
                      title="View Screenshot"
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
};

export default OrderDetails;
