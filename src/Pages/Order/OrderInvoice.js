import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import { getBookingDetailsServ } from "../../services/bookingDashboard.services";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useReactToPrint } from "react-to-print";

const OrderInvoice = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [list, setList] = useState([]);
  const invoiceRef = useRef();
  const [showSkelton, setShowSkelton] = useState(false);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (invoiceRef) {
      setIsReady(true);
    }
  }, [order]); // runs when order is fetched

  const reactToPrintFn = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice_${order?._id?.slice(0, 8)}`,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .print-area { overflow: visible !important; height: auto !important; }
      }
    `,
  });

  const handleDownload = async () => {
    const element = invoiceRef.current;

    // High scale improves text sharpness; tweak for performance/quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    // A4 in mm
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth(); // ~210
    const pageHeight = pdf.internal.pageSize.getHeight(); // ~297

    // Pixel to mm ratios based on canvas size
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add extra pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // move up by remaining height
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Invoice_${order?._id?.slice(0, 8)}.pdf`);
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    if (list.length === 0) {
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

  // if (!order) return null;

  const user = order?.userId || {};
  const address = order?.address || {};
  const products = [
    ...(order?.product || []).map((item) => ({ ...item, type: "product" })),
    ...(order?.comboProduct || []).map((item) => ({
      ...item,
      type: "comboProduct",
    })),
  ];

  const subTotal = products.reduce((acc, item) => {
    if (item.type === "product") {
      const price =
        item?.productId?.discountedPrice || item?.productId?.price || 0;
      return acc + price * (item?.quantity || 1);
    }
    if (item.type === "comboProduct") {
      const price = item?.comboProductId?.pricing?.comboPrice || 0;
      return acc + price * (item?.quantity || 1);
    }
    return acc;
  }, 0);

  const deliveryCharge =
    Number(order?.deliveryCharge) > 0 ? Number(order?.deliveryCharge) : 0;

  const totalAmount = subTotal + deliveryCharge;

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Orders" selectedItem="Orders" />
      <div className="mainContainer">
        <TopNav />
        <div className="container-fluid p-lg-4 p-md-3 p-2">
          <div className="card shadow-sm p-4">
            <div ref={invoiceRef} className="p-4 print-area">
              {!order ? (
                // Show skeleton when order not yet loaded
                <div>
                  <Skeleton height={30} width={200} className="mb-3" />
                  <Skeleton count={10} height={20} className="mb-2" />
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between mb-4">
                    <div>
                      <img
                        src="/bigBanglogo.png"
                        alt="Big Bang Crackers"
                        width="100"
                      />
                      <br />
                      <br />
                      <p className="mb-0">Email: bigbangcrackers7@gmail.com</p>
                      <p className="mb-0">Customer Care: 9894047372</p>
                    </div>
                    <div className="text-end">
                      <h3 className="text-warning">INVOICE</h3>
                      <p className="mb-0">
                        #INV-{order?.orderId?.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-4">
                      <h6 className="fw-bold">Bill To</h6>
                      <div className="mb-2">
                  <strong>Shipping:</strong> {order?.shipping}
                </div>
                      <p className="mb-0 text-danger fw-bold">
                        {address?.fullName}
                      </p>
                      <p className="mb-0">{address?.doorNoStreet} {address?.area} {address?.town}</p>
                      <p className="mb-0">
                        {address?.city}
                      </p>
                      <p className="mb-0">{address?.state} - {address?.pincode}</p>
                      <p className="mb-0">{address?.landmark}</p>
                      <br />
                      <p
                        className="mb-0"
                      >
                        <strong>Mobile: </strong>{address?.phone} / {address?.alternatePhone}
                      </p>
                    </div>
                    {/* <div className="col-md-4">
                      <h6 className="fw-bold">Ship To</h6>
                      <p className="mb-0">{address?.area?.name}</p>
                      <p className="mb-0">
                        {address?.city}, {address?.state}
                      </p>
                      <p className="mb-0">{address?.pincode}</p>
                    </div> */}
                    <div className="col-md-8 text-end">
                      <p>
                        Invoice Date:{" "}
                        {moment(order?.createdAt).format("DD MMM YYYY")}
                      </p>
                      <p>Terms: Due on Receipt</p>
                    </div>
                  </div>

                  <table className="table table-bordered">
                    <thead
                      style={{ backgroundColor: "#993300", color: "#fff" }}
                    >
                      <tr>
                        <th>#</th>
                        <th>Item & Description</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((item, index) => {
                        if (item.type === "product") {
                          const price =
                            item?.productId?.discountedPrice ||
                            item?.productId?.price ||
                            0;
                          const qty = item?.quantity || 1;
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <img
                                  src={item?.productId?.productHeroImage}
                                  alt="product"
                                  style={{ width: 50 }}
                                />
                                <strong className="m-4">
                                  {item?.productId?.name}
                                </strong>
                              </td>
                              <td>{qty}</td>
                              <td>₹{price.toFixed(2)}</td>
                              <td>₹{(price * qty).toFixed(2)}</td>
                            </tr>
                          );
                        }

                        if (item.type === "comboProduct") {
                          const price =
                            item?.comboProductId?.pricing?.comboPrice || 0;
                          const qty = item?.quantity || 1;
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <img
                                  src={item?.comboProductId?.productHeroImage}
                                  alt="combo"
                                  style={{ width: 50 }}
                                />
                                <strong className="m-4">
                                  {item?.comboProductId?.name}
                                </strong>

                                {/* 👇 yeh UL abhi scrollable box me aa raha hai */}
                                {/* isko normal list bana do, taaki print me full expand ho */}
                                <ul className="list-unstyled mt-2 combo-product-list">
                                  {item?.comboProductId?.productId?.map(
                                    (prod, i) => (
                                      <li key={i}>
                                        {typeof prod?.product === "object"
                                          ? prod?.product?.name
                                          : prod?.product || "_"}{" "}
                                        ({prod?.quantity || "1"})
                                      </li>
                                    )
                                  )}
                                </ul>
                              </td>

                              <td>{qty}</td>
                              <td>₹{price.toFixed(2)}</td>
                              <td>₹{(price * qty).toFixed(2)}</td>
                            </tr>
                          );
                        }

                        return null;
                      })}
                    </tbody>
                  </table>

                  <div className="text-end mt-3">
                    <p className="mb-1">Order Charge: ₹{subTotal.toFixed(2)}</p>
                    <p>Total Items: {products.length}</p>
                    <p>Delivery Charge: ₹{deliveryCharge.toFixed(2)}</p>
                    {/* <p>Wallet Used: ₹0</p> */}
                    <h5 className="fw-bold text-danger">
                      Order Total: ₹{totalAmount.toFixed(2)}
                    </h5>
                  </div>

                  <div className="mt-4">
                    {/* <p className="fw-bold mb-1">Notes</p>
                    <p className="text-muted small">
                      Thanks for your business.
                    </p> */}

                    <p className="fw-bold mb-1 mt-3">Terms & Conditions</p>
                    <p className="text-muted small">
                      1. Door Delivery may take extra time due to non-regular
                      couriers and weather factors, but all orders will reach
                      before Diwali if Door Delivery is chosen – our
                      responsibility. <br /> 2. Full payment is required before
                      dispatch. <br /> 3. Firecrackers are non-returnable and
                      non-exchangeable. <br /> 4. Celebrate responsibly and have
                      a safe Diwali!
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button
                className="btn btn-success no-print"
                onClick={reactToPrintFn}
                disabled={!isReady}
              >
                <i className="fa fa-print me-2"></i>Print
              </button>

              {/* <button className="btn btn-primary" onClick={handleDownload}>
                <i className="fa fa-download me-2"></i>Download
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
