import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";
import { usePermission } from "../../hooks/usePermission";
import ActionButtons from "../../Components/ActionButtons";
import {
  FaSearch,
  FaPlus,
  FaFileExcel,
  FaFilePdf,
  FaDownload,
} from "react-icons/fa";

import { RiAddLine } from "react-icons/ri";
import { Modal, Button, Form } from "react-bootstrap";

import {
  addLoanServ,
  getLoanListServ,
  updateLoanServ,
  deleteLoanServ,
  getLoanDetailsServ,
  addInstallmentServ,
  downloadLoanExcelServ,
  downloadLoanPDFServ,
} from "../../services/loan.services";
import Pagination from "../../Components/Pagination";

const initialLoanForm = {
  name: "",
  phone: "",
  loanAmount: "",
  givenAmount: "",
  perDayCollection: "",
  daysForLoan: "",
  totalDueInstallments: "",
  totalPaidInstallments: 0,
  totalPaidLoan: 0,
  remainingLoan: "",
  adharCard: "",
  panCard: "",
  referenceBy: "",
  status: "Open",
};

function LoanCollection() {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // main modal for add/edit/view
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'view'
  const [editingRecord, setEditingRecord] = useState(null);
  const [loanForm, setLoanForm] = useState(initialLoanForm);

  // installment modal
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedInstallLoan, setSelectedInstallLoan] = useState(null);
  const [installAmount, setInstallAmount] = useState("");

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
  });

  const { canView, canCreate, canUpdate, canDelete } =
    usePermission("Collection");

  // --- Fetch Loan List ---
  const handleGetLoans = async () => {
    if (!canView) {
      toast.error("You don't have permission to view loans.");
      return;
    }
    setShowSkeleton(true);
    try {
      const res = await getLoanListServ(payload);
      // follow pattern you used earlier
      setList(res?.data?.data || []);
      setTotalRecords(res?.data?.total || 0);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to fetch loan list");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    handleGetLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  // --- Modal Handlers ---
  const handleOpenModal = async (mode, record = null) => {
    setModalMode(mode);
    setEditingRecord(record);

    if (mode === "add") {
      setLoanForm(initialLoanForm);
      setShowModal(true);
    } else if (record?._id) {
      try {
        const res = await getLoanDetailsServ(record._id);
        // API returns { data: { data: {...} } } in your other calls — handle both shapes
        const data = res?.data?.data || res?.data || record;
        // Ensure status capitalized consistently for dropdown
        data.status = data.status
          ? String(data.status).charAt(0).toUpperCase() +
            String(data.status).slice(1)
          : "Open";
        setLoanForm({
          ...initialLoanForm,
          ...data,
        });
        setShowModal(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch loan details");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setLoanForm(initialLoanForm);
  };

  // --- Form Change Handler ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // If numeric fields, keep as number where appropriate (but still allow blank)
    const numericFields = [
      "loanAmount",
      "givenAmount",
      "perDayCollection",
      "daysForLoan",
      "totalDueInstallments",
      "totalPaidInstallments",
      "totalPaidLoan",
      "remainingLoan",
    ];
    if (numericFields.includes(name)) {
      // allow empty string
      const parsed = value === "" ? "" : Number(value);
      setLoanForm((prev) => ({ ...prev, [name]: parsed }));
    } else {
      setLoanForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Save / Update Loan ---
  const handleSaveLoan = async () => {
    try {
      if (!loanForm.name || !loanForm.phone) {
        toast.error("Please enter Name and Phone.");
        return;
      }

      // Normalize status to "Open"/"Closed"
      const payloadToSend = {
        ...loanForm,
        status: loanForm.status
          ? String(loanForm.status).charAt(0).toUpperCase() +
            String(loanForm.status).slice(1)
          : "Open",
      };

      if (modalMode === "add") {
        await addLoanServ(payloadToSend);
        toast.success("Loan created successfully!");
      } else if (modalMode === "edit" && editingRecord) {
        await updateLoanServ({ ...payloadToSend, _id: editingRecord._id });
        toast.success("Loan updated successfully!");
      }

      handleCloseModal();
      handleGetLoans();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to save loan");
    }
  };

  // --- Delete Loan ---
  const handleDeleteLoan = async (id) => {
    if (window.confirm("Are you sure you want to delete this loan?")) {
      try {
        await deleteLoanServ(id);
        toast.success("Loan deleted successfully!");
        handleGetLoans();
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to delete loan");
      }
    }
  };

  // --- Open Add Installment Modal (replaces prompt) ---
  const openAddInstallmentModal = async (loan) => {
    setSelectedInstallLoan(loan);
    setInstallAmount("");
    // We can fetch fresh loan details to ensure we show latest totals
    if (loan?._id) {
      try {
        const res = await getLoanDetailsServ(loan._id);
        const data = res?.data?.data || res?.data || loan;
        setSelectedInstallLoan(data);
      } catch (err) {
        console.error(err);
        // fallback to passed loan
      }
    }
    setShowInstallmentModal(true);
  };

  // --- Add Installment (calls API with { installAmount }) ---
  const handleConfirmAddInstallment = async () => {
    const amountValue = Number(installAmount);
    if (!installAmount || isNaN(amountValue) || amountValue <= 0) {
      toast.error("Enter a valid installment amount");
      return;
    }

    try {
      await addInstallmentServ(selectedInstallLoan._id, {
        installAmount: amountValue,
      });
      toast.success("Installment added successfully!");
      setShowInstallmentModal(false);
      setInstallAmount("");
      // refresh list
      handleGetLoans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add installment");
    }
  };

  // --- Sort Handler ---
  const handleSort = (field) => {
    setPayload((prev) => ({
      ...prev,
      sortByField: field,
      sortByOrder:
        prev.sortByField === field && prev.sortByOrder === "asc"
          ? "desc"
          : "asc",
      pageNo: 1,
    }));
  };

  // --- Pagination ---
  const startIndex = (payload.pageNo - 1) * payload.pageCount;
  const endIndex = Math.min(startIndex + payload.pageCount, totalRecords);
  const totalPages = Math.ceil(totalRecords / payload.pageCount);

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Collections" selectedItem="Collections" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Loan Collection</h3>
            <div className="d-flex gap-2">
              {/* ✅ Download Excel */}
              <button
                className="btn btn-outline-success d-flex align-items-center"
                onClick={async () => {
                  try {
                    const res = await downloadLoanExcelServ();
                    const blob = new Blob([res.data], {
                      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "Loan_Collection.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    toast.success("Excel downloaded successfully!");
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to download Excel");
                  }
                }}
              >
                <FaFileExcel size={18} />
                <span>Download Excel</span>
              </button>

              {/* ✅ Download PDF */}
              <button
                className="btn btn-outline-danger d-flex align-items-center"
                onClick={async () => {
                  try {
                    const res = await downloadLoanPDFServ();
                    const blob = new Blob([res.data], {
                      type: "application/pdf",
                    });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "Loan_Collection.pdf");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    toast.success("PDF downloaded successfully!");
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to download PDF");
                  }
                }}
              >
                <FaFilePdf size={18} />
                <span>Download PDF</span>
              </button>

              {/* ✅ Existing Add Loan button */}
              {canCreate && (
                <button
                  className="btn text-white px-3"
                  style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                  onClick={() => handleOpenModal("add")}
                >
                  <RiAddLine size={20} className="me-1" />
                  Add Loan
                </button>
              )}
            </div>
          </div>

          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0">
            <div className="row g-2 align-items-center">
              <div className="col-lg-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Customer Name..."
                  value={payload.searchKey}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      searchKey: e.target.value,
                      pageNo: 1,
                    })
                  }
                />
              </div>

              {/* Status Filter */}
              <div className="col-lg-2">
                <select
                  className="form-select"
                  value={payload.status || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      status: e.target.value || undefined,
                      pageNo: 1,
                    })
                  }
                >
                  <option value="">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Filter by Date Type */}
              {/* <div className="col-lg-2">
                <select
                  className="form-select"
                  value={payload.dateFilter || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      dateFilter: e.target.value,
                      pageNo: 1,
                    })
                  }
                >
                  <option value="">Filter by Date</option>
                  <option value="createdAt">Created Date</option>
                  <option value="updatedAt">Updated Date</option>
                  <option value="loanStartDate">Loan Start Date</option>
                </select>
              </div> */}

              {/* Start Date */}
              {/* <div className="col-lg-2">
                <input
                  type="date"
                  className="form-control"
                  value={payload.startDate || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      startDate: e.target.value,
                      pageNo: 1,
                    })
                  }
                />
              </div> */}

              {/* End Date */}
              {/* <div className="col-lg-2">
                <input
                  type="date"
                  className="form-control"
                  value={payload.endDate || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      endDate: e.target.value,
                      pageNo: 1,
                    })
                  }
                />
              </div> */}

              {/* Filter Button */}
              {/* <div className="col-lg-1 text-end">
                <button
                  className="btn btn-success w-100"
                  onClick={handleGetLoans}
                >
                  <FaSearch size={14} />
                </button>
              </div> */}
            </div>
          </div>

          {/* Table */}
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div
              className="table-responsive"
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <table
                className="table align-middle mb-0 text-nowrap"
                style={{
                  minWidth: "1400px",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                }}
              >
                <thead
                  className="table-light sticky-top"
                  style={{
                    top: 0,
                    zIndex: 2,
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <tr>
                    {[
                      "#",
                      "Name",
                      "Phone",
                      "Loan",
                      "Given",
                      "Per Day",
                      "Days",
                      "Due Inst.",
                      "Paid Inst.",
                      "Paid Loan",
                      "Remaining",
                      "Aadhaar",
                      "PAN",
                      "Reference",
                      "Status",
                      "Installment",
                      "Actions",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className={`text-muted small text-uppercase fw-semibold ${
                          header === "Actions" ? "text-center" : ""
                        }`}
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          borderRight: "1px solid #e5e7eb",
                          backgroundColor: "#f8fafc",
                          cursor: header === "Name" ? "pointer" : "default",
                        }}
                        onClick={() => header === "Name" && handleSort("name")}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {showSkeleton ? (
                    Array.from({ length: payload.pageCount }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="16">
                          <Skeleton height={20} />
                        </td>
                      </tr>
                    ))
                  ) : list.length > 0 ? (
                    list.map((loan, i) => (
                      <tr
                        key={loan._id}
                        style={{
                          backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fbfd",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                        className="row-hover"
                      >
                        <td className="fw-medium text-secondary px-3">
                          {startIndex + i + 1}
                        </td>
                        <td className="fw-semibold text-dark px-3">
                          {loan.name}
                        </td>
                        <td className="text-muted px-3">{loan.phone}</td>
                        <td className="fw-semibold text-success px-3">
                          ₹{loan.loanAmount ?? 0}
                        </td>
                        <td className="px-3">₹{loan.givenAmount ?? 0}</td>
                        <td className="px-3">₹{loan.perDayCollection ?? 0}</td>
                        <td className="px-3">{loan.daysForLoan ?? "-"}</td>
                        <td className="px-3">
                          {loan.totalDueInstallments ?? "-"}
                        </td>
                        <td className="text-primary fw-semibold px-3">
                          {loan.totalPaidInstallments ?? 0}
                        </td>
                        <td className="px-3">₹{loan.totalPaidLoan ?? 0}</td>
                        <td className="fw-semibold text-danger px-3">
                          ₹{loan.remainingLoan ?? 0}
                        </td>
                        <td className="text-muted small px-3">
                          {loan.adharCard || "-"}
                        </td>
                        <td className="text-muted small px-3">
                          {loan.panCard || "-"}
                        </td>
                        <td className="text-muted small px-3">
                          {loan.referenceBy || "-"}
                        </td>
                        <td className="px-3 text-center">
                          <span
                            onClick={async () => {
                              const newStatus =
                                loan.status === "Open" ? "Closed" : "Open";
                              try {
                                await updateLoanServ({
                                  ...loan,
                                  _id: loan._id,
                                  status: newStatus,
                                });
                                toast.success(`Status changed to ${newStatus}`);
                                handleGetLoans();
                              } catch (err) {
                                console.error(err);
                                toast.error("Failed to update status");
                              }
                            }}
                            className={`badge px-3 py-2 text-capitalize fw-semibold`}
                            style={{
                              cursor: "pointer",
                              backgroundColor:
                                loan.status === "Closed"
                                  ? "#dc3545" // red for closed
                                  : "#198754", // green for open
                              color: "white",
                              borderRadius: "20px",
                              fontSize: "12px",
                              textAlign: "center",
                              minWidth: "80px",
                              display: "inline-block",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {loan.status?.toLowerCase() || "open"}
                          </span>
                        </td>

                        <td className="text-center px-3">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openAddInstallmentModal(loan)}
                          >
                            <FaPlus size={12} />
                          </button>
                        </td>
                        <td className="text-center px-3">
                          <div className="d-flex justify-content-center gap-1">
                            <ActionButtons
                              canView
                              canUpdate={canUpdate}
                              canDelete={canDelete}
                              onView={() => handleOpenModal("view", loan)}
                              onEdit={() => handleOpenModal("edit", loan)}
                              onDelete={() => handleDeleteLoan(loan._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="16" className="text-center py-4">
                        <NoRecordFound />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            payload={payload}
            setPayload={setPayload}
            totalCount={totalRecords}
          />
        </div>

        {/* Add/Edit/View Loan Modal (uses your overlay look) */}
        {showModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              overflowY: "auto",
              padding: "1rem",
            }}
          >
            <div
              className="modal-content p-4 rounded-4 bg-white"
              style={{ width: 520, maxHeight: "98vh", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-end mb-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={handleCloseModal}
                  alt="Close"
                />
              </div>
              <h5 className="mb-4">
                {modalMode === "add"
                  ? "Add New Loan"
                  : modalMode === "edit"
                  ? "Edit Loan"
                  : "Loan Details"}
              </h5>

              <div className="row g-2">
                {/* Left column fields (as per your screenshot) */}
                <div className="col-md-6">
                  <label className="form-label">Customer Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={loanForm.name}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    name="phone"
                    value={loanForm.phone}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Loan Amount</label>
                  <input
                    className="form-control"
                    name="loanAmount"
                    type="number"
                    value={loanForm.loanAmount}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Given Amount</label>
                  <input
                    className="form-control"
                    name="givenAmount"
                    type="number"
                    value={loanForm.givenAmount}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Per Day Collection</label>
                  <input
                    className="form-control"
                    name="perDayCollection"
                    type="number"
                    value={loanForm.perDayCollection}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Days For Loan</label>
                  <input
                    className="form-control"
                    name="daysForLoan"
                    type="number"
                    value={loanForm.daysForLoan}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Total Due Installments</label>
                  <input
                    className="form-control"
                    name="totalDueInstallments"
                    type="number"
                    value={loanForm.totalDueInstallments}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Reference By</label>
                  <input
                    className="form-control"
                    name="referenceBy"
                    value={loanForm.referenceBy}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Aadhaar Card</label>
                  <input
                    className="form-control"
                    name="adharCard"
                    value={loanForm.adharCard}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">PAN Card</label>
                  <input
                    className="form-control"
                    name="panCard"
                    value={loanForm.panCard}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={loanForm.status || "Open"}
                    onChange={handleFormChange}
                    disabled={modalMode === "view"}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Show readonly totals when viewing/editing */}
                <div className="col-md-6">
                  <label className="form-label">Total Paid Installments</label>
                  <input
                    className="form-control"
                    name="totalPaidInstallments"
                    type="number"
                    value={loanForm.totalPaidInstallments ?? 0}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Total Paid Loan</label>
                  <input
                    className="form-control"
                    name="totalPaidLoan"
                    type="number"
                    value={loanForm.totalPaidLoan ?? 0}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Remaining Loan</label>
                  <input
                    className="form-control"
                    name="remainingLoan"
                    type="number"
                    value={loanForm.remainingLoan ?? ""}
                    readOnly
                  />
                </div>
              </div>

              {/* Save Button */}
              {(modalMode === "add" || modalMode === "edit") && (
                <button
                  className="btn text-white mt-3 w-100"
                  style={{ background: "#16A34A", borderRadius: "0.5rem" }}
                  onClick={handleSaveLoan}
                >
                  {modalMode === "add" ? "Create Loan" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Installment Modal (Bootstrap-like overlay to match your existing UI) */}
        {showInstallmentModal && selectedInstallLoan && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              overflowY: "auto",
              padding: "1rem",
            }}
          >
            <div
              className="modal-content p-4 rounded-4 bg-white"
              style={{ width: 420, maxHeight: "98vh", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-end mb-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: 20, cursor: "pointer" }}
                  onClick={() => {
                    setShowInstallmentModal(false);
                    setSelectedInstallLoan(null);
                    setInstallAmount("");
                  }}
                  alt="Close"
                />
              </div>

              <h5 className="mb-4">Add Installment</h5>

              <div className="mb-3">
                <label className="form-label">Loan Amount</label>
                <input
                  className="form-control"
                  value={selectedInstallLoan.loanAmount ?? 0}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Total Paid</label>
                <input
                  className="form-control"
                  value={selectedInstallLoan.totalPaidLoan ?? 0}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Remaining Balance</label>
                <input
                  className="form-control"
                  value={
                    selectedInstallLoan.remainingLoan ??
                    selectedInstallLoan.loanAmount -
                      (selectedInstallLoan.totalPaidLoan || 0)
                  }
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Installment Amount</label>
                <input
                  className="form-control"
                  value={installAmount}
                  onChange={(e) => setInstallAmount(e.target.value)}
                  placeholder="Enter installment amount"
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowInstallmentModal(false);
                    setSelectedInstallLoan(null);
                    setInstallAmount("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleConfirmAddInstallment}
                >
                  Add Installment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanCollection;
