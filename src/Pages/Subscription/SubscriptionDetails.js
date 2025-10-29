import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  getSubscriptionChitDetailsServ,
  updateSubscriptionChitPaymentStatusServ,
} from "../../services/subscriptionChit.services";
import { toast } from "react-toastify";
import moment from "moment";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Modal, Button } from "react-bootstrap";

const SubscriptionChitDetails = () => {
  const { id } = useParams();
  const [chit, setChit] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const fetchChitDetails = async () => {
    setLoading(true);
    try {
      const res = await getSubscriptionChitDetailsServ(id);
      setChit(res?.data?.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subscription chit details");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChitDetails();
  }, [id]);

  const handleStatusUpdate = async (monthNumber, monthYear, status) => {
    try {
      await updateSubscriptionChitPaymentStatusServ({
        chitId: chit._id,
        monthNumber,
        monthYear,
        status,
      });
      toast.success(`Status updated to ${status} successfully`);
      fetchChitDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleImageView = (imgUrl) => {
    setSelectedImage(imgUrl);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="bodyContainer">
        <Sidebar selectedMenu="Subscription" selectedItem="SubscriptionChits" />
        <div className="mainContainer">
          <TopNav />
          <div className="container p-4">
            <Skeleton height={30} width={200} className="mb-3" />
            <Skeleton count={5} height={20} className="mb-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!chit) return null;

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Subscription" selectedItem="SubscriptionChits" />
      <div className="mainContainer">
        <TopNav />
        <div className="container-fluid p-lg-4 p-md-3 p-2">
          <div className="card shadow-sm p-4">
            <h4 className="mb-4">Subscription Chit Details</h4>

            <div className="row">
              <div className="col-md-6">
                <p><strong>Name:</strong> {chit.name}</p>
                <p><strong>Phone:</strong> {chit.phone}</p>
                <p><strong>Email:</strong> {chit.email}</p>
                <p><strong>Location:</strong> {chit.location}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Total Amount:</strong> ₹{chit.totalAmount}</p>
                <p><strong>Monthly Amount:</strong> ₹{chit.monthlyAmount}</p>
                <p><strong>Total Months:</strong> {chit.totalMonths}</p>
                <p><strong>Enrolment Date:</strong> {moment(chit.enrolmentDate).format("DD-MM-YYYY")}</p>
              </div>
            </div>

            <hr />

            <h5 className="mt-4 mb-3">Paid Months Details</h5>

            {chit.paidMonths.length === 0 ? (
              <p>No payments uploaded yet.</p>
            ) : (
              <div className="row">
                {chit.paidMonths.map((month, idx) => (
                  <div key={idx} className="col-md-6 mb-4">
                    <div className="card border rounded shadow-sm p-3 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">
                          {month.monthNumber} {month.monthYear}
                        </h6>
                        <span
                          className={`badge ${
                            month.status === "approved"
                              ? "bg-success"
                              : month.status === "rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {month.status}
                        </span>
                      </div>

                      <p className="mb-1">
                        <strong>Payment Date:</strong>{" "}
                        {month.paymentDate
                          ? moment(month.paymentDate).format("DD-MM-YYYY")
                          : "-"}
                      </p>

                      <div className="mb-2">
                        <strong>Payment Screenshot:</strong>{" "}
                        {month.paymentSs ? (
                          <button
                            className="btn btn-outline-primary btn-sm ms-2"
                            onClick={() => handleImageView(month.paymentSs)}
                          >
                            <i className="fa fa-eye"></i> View
                          </button>
                        ) : (
                          <span className="text-danger">No screenshot uploaded</span>
                        )}
                      </div>

                      {month.status === "pending" && (
                        <div className="mt-2">
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() =>
                              handleStatusUpdate(
                                month.monthNumber,
                                month.monthYear,
                                "approved"
                              )
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleStatusUpdate(
                                month.monthNumber,
                                month.monthYear,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image View Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Payment Screenshot</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={selectedImage}
            alt="Payment Screenshot"
            className="img-fluid rounded shadow"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubscriptionChitDetails;
