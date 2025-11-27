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
  addNewLoanForExistingServ,
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
  loanType: "new",
  manualProfit: "",
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

  const [actionLoading, setActionLoading] = useState(false); // for create/update
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [installmentLoading, setInstallmentLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [payload, setPayload] = useState({
    searchKey: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "createdAt",
    sortByOrder: "desc",
    fromDate: "",
    toDate: "",
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

  const handleAddNewLoanForExisting = async (loan) => {
    // Prefill modal with existing customer data
    setLoanForm({
      ...initialLoanForm,
      name: loan.name,
      phone: loan.phone,
      adharCard: loan.adharCard,
      panCard: loan.panCard,
      referenceBy: loan.referenceBy,
    });

    setModalMode("addExisting");
    setEditingRecord(loan);
    setShowModal(true);
  };

  // --- Save / Update Loan ---
  const handleSaveLoan = async () => {
    try {
      if (!loanForm.name || !loanForm.phone) {
        toast.error("Please enter Name and Phone.");
        return;
      }

      setActionLoading(true);

      const payloadToSend = {
        ...loanForm,
        status: loanForm.status
          ? String(loanForm.status).charAt(0).toUpperCase() +
            String(loanForm.status).slice(1)
          : "Open",
        loanType: loanForm.loanType || "new",
        manualProfit:
          loanForm.manualProfit === "" || loanForm.manualProfit === null
            ? null
            : Number(loanForm.manualProfit),
      };

      if (modalMode === "add") {
        await addLoanServ(payloadToSend);
        toast.success("Loan created successfully!");
      } else if (modalMode === "addExisting" && editingRecord) {
        await addNewLoanForExistingServ({
          ...payloadToSend,
          phone: editingRecord.phone,
        });
        toast.success("New loan added for existing user!");
      } else if (modalMode === "edit" && editingRecord) {
        await updateLoanServ({ ...payloadToSend, _id: editingRecord._id });
        toast.success("Loan updated successfully!");
      }

      handleCloseModal();
      handleGetLoans();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save loan"
      );
    } finally {
      setActionLoading(false);
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
      const res = await addInstallmentServ(selectedInstallLoan._id, {
        installAmount: amountValue,
      });
      const message = res?.data?.message || "Installment added successfully!";
      toast.success(message);
      setShowInstallmentModal(false);
      setInstallAmount("");
      handleGetLoans();
    } catch (err) {
      console.error(err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add installment";

      toast.error(backendMessage);
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

  const [showColumnModal, setShowColumnModal] = useState(false);

  const columnOptions = [
    { key: "name", label: "Customer Name" },
    { key: "phone", label: "Phone" },
    { key: "loanAmount", label: "Loan Amount" },
    { key: "givenAmount", label: "Given Amount" },
    { key: "perDayCollection", label: "Per Day" },
    { key: "daysForLoan", label: "Days" },
    { key: "totalDueInstallments", label: "Due Installments" },
    { key: "totalPaidInstallments", label: "Paid Installments" },
    { key: "totalPaidLoan", label: "Total Paid" },
    { key: "remainingLoan", label: "Remaining Loan" },
    { key: "adharCard", label: "Aadhaar" },
    { key: "panCard", label: "PAN" },
    { key: "referenceBy", label: "Reference" },
    { key: "status", label: "Status" },
  ];

  const [selectedColumns, setSelectedColumns] = useState([]);

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
                onClick={() => {
                  window.exportType = "excel"; // 👈 SET EXCEL TYPE
                  if (selectedRows.length === 0) {
                    toast.error("Please select rows to export.");
                    return;
                  }
                  setShowColumnModal(true);
                }}
              >
                <FaFileExcel size={18} />
                <span>Download Excel</span>
              </button>

              {/* ✅ Download PDF */}
              <button
                className="btn btn-outline-danger d-flex align-items-center"
                onClick={() => {
                  window.exportType = "pdf"; // 👈 SET PDF TYPE
                  if (selectedRows.length === 0) {
                    toast.error("Please select rows to export.");
                    return;
                  }
                  setShowColumnModal(true);
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

          <div className="card shadow-sm p-3 mb-4 rounded-3 border-0 filterCard">
            <div className="row g-3 align-items-end">
              {/* 🔍 Search */}
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-semibold small text-muted">
                  Search by Customer
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer name..."
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

              {/* ⚙️ Status */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label fw-semibold small text-muted">
                  Status
                </label>
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

              {/* 📅 Start Date */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label fw-semibold small text-muted">
                  Start Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={payload.fromDate || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      fromDate: e.target.value,
                      pageNo: 1,
                    })
                  }
                />
              </div>

              {/* 📅 End Date */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label fw-semibold small text-muted">
                  End Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={payload.toDate || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      toDate: e.target.value,
                      pageNo: 1,
                    })
                  }
                />
              </div>

              {/* 🔎 Search Button */}
              <div className="col-lg-2 col-md-6 text-end">
                <button
                  className="btn btn-success w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGetLoans}
                  style={{ gap: "6px", fontWeight: 600 }}
                >
                  <FaSearch size={14} />
                  <span>Search</span>
                </button>
              </div>
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
                    <th>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(list.map((row) => row._id)); // select all
                          } else {
                            setSelectedRows([]); // unselect all
                          }
                        }}
                        checked={
                          selectedRows.length === list.length && list.length > 0
                        }
                      />
                    </th>
                    {[
                      "#",
                      "Name",
                      "Phone",
                      "Loan",
                      "Given",
                      "Per Day",
                      "Days",
                     
                      "Paid Inst.",
                      "Paid Loan",
                      "Remaining",
                      "Aadhaar",
                      "PAN",
                      "Reference",
                      "Status",
                      "Installment",
                      "New Loan",
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
                        <td colSpan="18">
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
                        <td className="px-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(loan._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows([...selectedRows, loan._id]);
                              } else {
                                setSelectedRows(
                                  selectedRows.filter((id) => id !== loan._id)
                                );
                              }
                            }}
                          />
                        </td>

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

                        {/* ✅ STATUS — no click event now */}
                        <td className="px-3 text-center">
                          <span
                            className={`badge px-3 py-2 text-capitalize fw-semibold`}
                            style={{
                              backgroundColor:
                                loan.status === "Closed"
                                  ? "#dc3545"
                                  : "#198754",
                              color: "white",
                              borderRadius: "20px",
                              fontSize: "12px",
                              textAlign: "center",
                              minWidth: "80px",
                              display: "inline-block",
                            }}
                          >
                            {loan.status?.toLowerCase() || "open"}
                          </span>
                        </td>

                        {/* ✅ INSTALLMENT BUTTON — disabled if Closed */}
                        <td className="text-center px-3">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openAddInstallmentModal(loan)}
                            disabled={loan.status === "Closed"}
                            title={
                              loan.status === "Closed"
                                ? "Loan is closed"
                                : "Add new installment"
                            }
                            style={{
                              filter:
                                loan.status === "Closed"
                                  ? "blur(1px) brightness(0.6)"
                                  : "none",
                              cursor:
                                loan.status === "Closed"
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: loan.status === "Closed" ? 0.6 : 1,
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <FaPlus size={12} />
                          </button>
                        </td>

                        {/* ✅ ADD NEW LOAN BUTTON — always visible */}
                        <td className="text-center px-3">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleAddNewLoanForExisting(loan)}
                            title="Add new loan for this user"
                          >
                            <FaPlus size={12} className="me-1" /> New Loan
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
                      <td colSpan="18" className="text-center py-4">
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

        {showModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            {modalMode === "view" ? (
              <div
                className="modal-content p-4 rounded-4 bg-white shadow-lg"
                style={{
                  // CSS Variables for a cleaner look
                  "--primary": "#10b981", // Emerald green
                  "--text-secondary": "#6b7280",
                  "--shadow-sm": "0 4px 12px rgba(2,6,23,0.06)",
                  "--shadow-md": "0 10px 30px rgba(2,6,23,0.1)",

                  width: 860,
                  maxWidth: "98vw",
                  maxHeight: "92vh",
                  overflowY: "auto",
                  borderRadius: 12,
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {/* Close Button */}
                <div className="d-flex justify-content-end mb-3">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                    style={{ height: 22, cursor: "pointer", opacity: 0.7 }}
                    onClick={handleCloseModal}
                    alt="Close"
                  />
                </div>

                {/* Header */}
                <div className="d-flex align-items-start gap-4 mb-4 pb-2 border-bottom">
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, var(--primary), #34d399)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 24,
                      boxShadow: "0 8px 20px rgba(16,185,129,0.25)",
                      minWidth: 68,
                    }}
                  >
                    {loanForm.name
                      ? loanForm.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                      {loanForm.name || "Unknown Customer"}
                    </h4>
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        marginTop: 4,
                        fontSize: 14,
                      }}
                    >
                      {loanForm.phone} • Ref: {loanForm.referenceBy || "-"}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        borderRadius: 999,
                        color: "#fff",
                        background:
                          (loanForm.status || "").toLowerCase() === "closed"
                            ? "#ef4444" // Red for Closed
                            : "var(--primary)", // Green for Open
                        fontWeight: 600,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                        textTransform: "uppercase",
                        fontSize: 12,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {loanForm.status?.toLowerCase() || "Open"}
                    </div>
                  </div>
                </div>

                {/* Top cards: loan summary */}
                <div className="d-flex flex-wrap gap-4 mb-4">
                  {/* Card: Loan summary */}
                  <div
                    style={{
                      minWidth: 200,
                      flex: "1 1 200px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      padding: "18px 20px",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        marginBottom: 4,
                      }}
                    >
                      Loan Details
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "var(--primary)",
                      }}
                    >
                      ₹{loanForm.loanAmount ?? 0}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        marginTop: 12,
                        alignItems: "center",
                        borderTop: "1px dashed #e2e8f0",
                        paddingTop: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Given
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                          ₹{loanForm.givenAmount ?? 0}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Per Day
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                          ₹{loanForm.perDayCollection ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card: Payment status */}
                  <div
                    style={{
                      minWidth: 200,
                      flex: "1 1 240px",
                      background: "#ffffff",
                      borderRadius: 10,
                      padding: "18px 20px",
                      boxShadow: "var(--shadow-sm)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{ fontSize: 14, color: "var(--text-secondary)" }}
                    >
                      Paid / Remaining
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        marginTop: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Paid
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: "var(--primary)",
                          }}
                        >
                          ₹{loanForm.totalPaidLoan ?? 0}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-secondary)",
                            marginTop: 4,
                          }}
                        >
                          Installments: {loanForm.totalPaidInstallments ?? 0}
                        </div>
                      </div>

                      <div
                        style={{ borderLeft: "1px solid #eef2f6", height: 50 }}
                      />

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Remaining
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#dc2626",
                          }}
                        >
                          ₹{loanForm.remainingLoan ?? 0}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-secondary)",
                            marginTop: 4,
                          }}
                        >
                          Due: {loanForm.totalDueInstallments ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card: Dates */}
                  <div
                    style={{
                      minWidth: 180,
                      flex: "1 1 180px",
                      background: "#ffffff",
                      borderRadius: 10,
                      padding: "18px 20px",
                      boxShadow: "var(--shadow-sm)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        marginBottom: 8,
                      }}
                    >
                      Loan Duration
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {loanForm.loanStartDate
                        ? moment(loanForm.loanStartDate).format("DD MMM YYYY")
                        : moment(loanForm.createdAt).format("DD MMM YYYY")}
                      {" → "}
                      {loanForm.loanEndDate
                        ? moment(loanForm.loanEndDate).format("DD MMM YYYY")
                        : loanForm.daysForLoan
                        ? moment(loanForm.createdAt)
                            .add(Number(loanForm.daysForLoan), "days")
                            .format("DD MMM YYYY")
                        : "-"}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Total Days: {loanForm.daysForLoan ?? "-"}
                    </div>
                  </div>
                </div>

                {/* Installment Timeline + Customer Details */}
                <div
                  style={{
                    display: "flex",
                    gap: 30,
                    alignItems: "flex-start",
                    marginTop: 20,
                  }}
                >
                  {/* Left: Timeline */}
                  <div style={{ flex: 1.2, minWidth: 350 }}>
                    <div
                      style={{
                        marginBottom: 15,
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      <span style={{ color: "var(--primary)" }}>₹</span> Payment
                      History
                    </div>

                    {/* Timeline container */}
                    <div
                      style={{
                        position: "relative",
                        paddingLeft: 10,
                        // Added keyframe definition here for the pulse effect on the latest bullet
                        "--primary": "#10b981", // Ensure primary color is defined or accessible
                        "--pulse-color": "rgba(16, 185, 129, 0.4)", // Faint emerald for pulse
                        "@keyframes pulse": {
                          "0%": { boxShadow: "0 0 0 0 var(--pulse-color)" },
                          "70%": {
                            boxShadow: "0 0 0 10px rgba(16, 185, 129, 0)",
                          },
                          "100%": {
                            boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)",
                          },
                        },
                      }}
                    >
                      {/* vertical line */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 4,
                          bottom: 4,
                          width: 2,
                          background: "#eef2f6",
                          borderRadius: 2,
                        }}
                      />

                      {/* items */}
                      {Array.isArray(loanForm.installments) &&
                      loanForm.installments.length > 0 ? (
                        [...loanForm.installments]
                          .slice()
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((inst, idx) => (
                            <div
                              key={inst._id || idx}
                              style={{
                                display: "flex",
                                gap: 15,
                                alignItems: "flex-start",
                                marginBottom: 20,
                                position: "relative",
                              }}
                            >
                              {/* bullet container */}
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 16,
                                  background:
                                    idx === 0 ? "var(--primary)" : "#ffffff", // Changed previous to white background
                                  border:
                                    idx === 0
                                      ? "4px solid #ccfbf1"
                                      : "1px solid var(--primary)", // Previous border is primary color
                                  position: "relative",
                                  zIndex: 2,
                                  marginLeft: -17,
                                  marginTop: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  // Apply subtle animation to the latest bullet
                                  animation:
                                    idx === 0 ? "pulse 2s infinite" : "none",
                                }}
                              >
                                {/* Checkmark for previous payments */}
                                {idx !== 0 && (
                                  <img
                                    src="https://cdn-icons-png.flaticon.com/128/190/190411.png" // Green tick icon
                                    alt="Paid"
                                    style={{ width: 10, height: 10 }}
                                  />
                                )}
                              </div>

                              {/* content */}
                              <div
                                style={{
                                  background: "#ffffff",
                                  borderRadius: 12,
                                  padding: "12px 16px",
                                  boxShadow: "var(--shadow-sm)",
                                  border:
                                    idx === 0
                                      ? "1px solid var(--primary)"
                                      : "1px solid #f1f5f9", // Highlight border for latest
                                  width: "100%",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <div>
                                    <div
                                      style={{
                                        fontWeight: 700,
                                        fontSize: 16,
                                        color: "#0f172a",
                                      }}
                                    >
                                      ₹{inst.installAmount} Paid
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        marginTop: 4,
                                      }}
                                    >
                                      {moment(inst.date).format(
                                        "DD MMM YYYY, hh:mm A"
                                      )}
                                    </div>
                                  </div>

                                  {/* small badge for remaining after payment (if you have it) */}
                                  {inst.remainingAfterInstallment !==
                                    undefined && (
                                    <div
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 999,
                                        background: "#eff6ff",
                                        color: "#1e40af",
                                        fontSize: 12,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Rem: ₹{inst.remainingAfterInstallment}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div
                          style={{
                            color: "var(--text-secondary)",
                            padding: "12px 10px",
                            border: "1px dashed #e2e8f0",
                            borderRadius: 8,
                            textAlign: "center",
                          }}
                        >
                          No installments yet.
                        </div>
                      )}
                      <style>{`
        /* Define the pulse animation globally, as inline styles don't support @keyframes */
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 var(--pulse-color, rgba(16, 185, 129, 0.4)); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0)); }
        }
        .modal-content > div > div > div > div:first-child[style*="animation: pulse"] {
            /* This targets the pulsing bullet and ensures the inline style is applied */
            animation: pulse 2s infinite;
        }
    `}</style>
                    </div>
                  </div>

                  {/* Right: Customer + Loan meta */}
                  <div style={{ flex: 1, minWidth: 280 }}>
                    {/* Customer Details Card */}
                    <div
                      style={{
                        background: "#ffffff",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "var(--shadow-sm)",
                        border: "1px solid #e2e8f0",
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          marginBottom: 12,
                        }}
                      >
                        Customer Info
                      </div>

                      <div style={{ display: "grid", gap: 12, fontSize: 14 }}>
                        {[
                          { label: "Phone", value: loanForm.phone },
                          {
                            label: "Aadhaar",
                            value: loanForm.adharCard || "-",
                          },
                          { label: "PAN", value: loanForm.panCard || "-" },
                          {
                            label: "Reference",
                            value: loanForm.referenceBy || "-",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderBottom: "1px dotted #e2e8f0",
                              paddingBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: 13,
                              }}
                            >
                              {item.label}
                            </div>
                            <div style={{ fontWeight: 600 }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Loan Summary Card */}
                    <div
                      style={{
                        background: "#ffffff",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "var(--shadow-sm)",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          marginBottom: 12,
                        }}
                      >
                        Financial Overview
                      </div>

                      <div style={{ display: "grid", gap: 10, fontSize: 15 }}>
                        {[
                          {
                            label: "Total Loan",
                            value: `₹${loanForm.loanAmount}`,
                          },
                          {
                            label: "Total Paid",
                            value: `₹${loanForm.totalPaidLoan}`,
                            color: "var(--primary)",
                          },
                          {
                            label: "Remaining",
                            value: `₹${loanForm.remainingLoan}`,
                            color: "#dc2626",
                          },
                          {
                            label: "Due Installments",
                            value: loanForm.totalDueInstallments,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ color: "var(--text-secondary)" }}>
                              {item.label}
                            </div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: item.color || "#0f172a",
                              }}
                            >
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Area */}
                    <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={handleCloseModal}
                        style={{ borderRadius: 8, padding: "10px 15px" }}
                      >
                        Close View
                      </button>

                      <button
                        className="btn w-100 text-white"
                        onClick={() => {
                          handleCloseModal();
                          setTimeout(
                            () => handleOpenModal("edit", loanForm),
                            120
                          );
                        }}
                        disabled={loanForm.status === "Closed"}
                        style={{
                          borderRadius: 8,
                          background: "var(--primary)",
                          padding: "10px 15px",
                          filter:
                            loanForm.status === "Closed"
                              ? "grayscale(100%) opacity(0.7)"
                              : "none",
                          cursor:
                            loanForm.status === "Closed"
                              ? "not-allowed"
                              : "pointer",
                          border: "none",
                          fontWeight: 600,
                        }}
                      >
                        Edit Loan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline styles to make fonts crisp on all browsers and mobile adjustment */}
                <style>{`
                    .modal-content h4, .modal-content div, .modal-content button {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                    }
                    @media (max-width: 900px) {
                        .modal-content { max-width: 96vw; }
                        .d-flex.flex-wrap.gap-4 { flex-direction: column; gap: 15px !important; }
                        .d-flex.align-items-start { flex-direction: column; align-items: center !important; text-align: center; }
                        .d-flex.align-items-start > div:first-child { margin-bottom: 15px; }
                        .d-flex.align-items-start > div:last-child { margin-top: 10px; }
                        .d-flex { flex-direction: column; gap: 15px; }
                        .d-flex > div { width: 100% !important; min-width: unset !important; }
                        .d-flex > div:last-child { margin-top: 0 !important; }
                    }
                `}</style>
              </div>
            ) : (
              /* EXISTING ADD/EDIT MODAL - Styled to match view mode */
              <div
                className="modal-content p-4 rounded-4 bg-white"
                style={{
                  "--primary": "#10b981",
                  width: 540,
                  maxHeight: "98vh",
                  overflowY: "auto",
                  borderRadius: 12,
                  boxShadow: "0 10px 30px rgba(2,6,23,0.1)",
                }}
              >
                <div className="d-flex justify-content-end mb-3">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                    style={{ height: 22, cursor: "pointer", opacity: 0.7 }}
                    onClick={handleCloseModal}
                    alt="Close"
                  />
                </div>
                <h5 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  {modalMode === "add"
                    ? "➕ Add New Loan"
                    : modalMode === "edit"
                    ? "✍️ Edit Loan"
                    : modalMode === "addExisting"
                    ? "🟢 Add New Loan for Existing User"
                    : "Loan Details"}
                </h5>

                <div className="row g-3">
                  {/* Input Fields */}
                  {/* The original Bootstrap grid and form-control classes are kept for simplicity */}
                  {[
                    {
                      name: "name",
                      label: "Customer Name",
                      type: "text",
                      value: loanForm.name,
                    },
                    {
                      name: "phone",
                      label: "Mobile Number",
                      type: "text",
                      value: loanForm.phone,
                    },
                    {
                      name: "loanAmount",
                      label: "Loan Amount",
                      type: "number",
                      value: loanForm.loanAmount,
                    },
                    {
                      name: "givenAmount",
                      label: "Given Amount",
                      type: "number",
                      value: loanForm.givenAmount,
                    },
                    {
                      name: "perDayCollection",
                      label: "Per Day Collection",
                      type: "number",
                      value: loanForm.perDayCollection,
                    },
                    {
                      name: "daysForLoan",
                      label: "Days For Loan",
                      type: "number",
                      value: loanForm.daysForLoan,
                    },
                    // {
                    //   name: "totalDueInstallments",
                    //   label: "Total Due Installments",
                    //   type: "number",
                    //   value: loanForm.totalDueInstallments,
                    // },
                    {
                      name: "referenceBy",
                      label: "Reference By",
                      type: "text",
                      value: loanForm.referenceBy,
                    },
                    {
                      name: "adharCard",
                      label: "Aadhaar Card",
                      type: "text",
                      value: loanForm.adharCard,
                    },
                    {
                      name: "panCard",
                      label: "PAN Card",
                      type: "text",
                      value: loanForm.panCard,
                    },
                    // Readonly fields are grouped below
                  ].map((field, index) => (
                    <div key={index} className="col-md-6">
                      <label
                        className="form-label"
                        style={{ fontSize: 13, color: "#6b7280" }}
                      >
                        {field.label}
                      </label>
                      <input
                        className="form-control"
                        name={field.name}
                        type={field.type}
                        value={field.value}
                        onChange={handleFormChange}
                        disabled={
                          modalMode === "view" ||
                          (modalMode === "addExisting" &&
                            [
                              "name",
                              "phone",
                              "adharCard",
                              "panCard",
                              "referenceBy",
                            ].includes(field.name))
                        }
                        style={{ borderRadius: 8, padding: "10px 12px" }}
                      />
                    </div>
                  ))}

                  {/* Loan Type */}
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{ fontSize: 13, color: "#6b7280" }}
                    >
                      Loan Type
                    </label>
                    <select
                      className="form-select"
                      name="loanType"
                      value={loanForm.loanType || "new"}
                      onChange={handleFormChange}
                      style={{ borderRadius: 8, padding: "10px 12px" }}
                    >
                      <option value="new">New</option>
                      <option value="renew">Renew</option>
                    </select>
                  </div>

                  {/* Manual Profit */}
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{ fontSize: 13, color: "#6b7280" }}
                    >
                      Manual Profit (Optional)
                    </label>
                    <input
                      className="form-control"
                      name="manualProfit"
                      type="number"
                      value={loanForm.manualProfit ?? ""}
                      onChange={handleFormChange}
                      placeholder="Enter manual profit amount (overrides auto profit)"
                      style={{ borderRadius: 8, padding: "10px 12px" }}
                    />
                  </div>

                  {/* Status Select Field */}
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{ fontSize: 13, color: "#6b7280" }}
                    >
                      Status
                    </label>
                    <select
                      className="form-select"
                      name="status"
                      value={loanForm.status || "Open"}
                      onChange={handleFormChange}
                      disabled={modalMode === "view"}
                      style={{ borderRadius: 8, padding: "10px 12px" }}
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {[
                    {
                      name: "totalPaidInstallments",
                      label: "Total Paid Installments",
                      value: loanForm.totalPaidInstallments ?? 0,
                    },
                    {
                      name: "totalPaidLoan",
                      label: "Total Paid Loan",
                      value: loanForm.totalPaidLoan ?? 0,
                    },
                    {
                      name: "remainingLoan",
                      label: "Remaining Loan",
                      value: loanForm.remainingLoan ?? "",
                    },
                  ].map((field, index) => (
                    <div key={index} className="col-md-6">
                      <label
                        className="form-label"
                        style={{ fontSize: 13, color: "#6b7280" }}
                      >
                        {field.label}
                      </label>
                      <input
                        className="form-control"
                        name={field.name}
                        type="number"
                        value={field.value}
                        onChange={handleFormChange}
                        style={{
                          borderRadius: 8,
                          padding: "10px 12px",
                          background:
                            modalMode === "addExisting" ? "white" : "#f8fafc",
                          fontWeight: 600,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                {["add", "edit", "addExisting"].includes(modalMode) && (
                  <button
                    className="btn text-white mt-4 w-100"
                    style={{
                      background: "var(--primary)",
                      borderRadius: "0.5rem",
                      padding: "12px 15px",
                      fontWeight: 600,
                    }}
                    onClick={handleSaveLoan}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Saving...
                      </>
                    ) : modalMode === "add" ? (
                      "Create New Loan"
                    ) : modalMode === "addExisting" ? (
                      "Add Loan for Existing User"
                    ) : (
                      "Save All Changes"
                    )}
                  </button>
                )}
              </div>
            )}
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

        {showColumnModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3000,
            }}
          >
            <div
              className="modal-content bg-white p-4 rounded-3 shadow"
              style={{ width: 420 }}
            >
              <h5 className="fw-bold mb-3">Select Columns for Export</h5>

              <div
                style={{
                  maxHeight: 300,
                  overflowY: "auto",
                  paddingRight: 5,
                }}
              >
                {columnOptions.map((col) => (
                  <div key={col.key} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => {
                        if (selectedColumns.includes(col.key)) {
                          setSelectedColumns(
                            selectedColumns.filter((c) => c !== col.key)
                          );
                        } else {
                          setSelectedColumns([...selectedColumns, col.key]);
                        }
                      }}
                    />
                    <label className="form-check-label">{col.label}</label>
                  </div>
                ))}
              </div>

              {/* Modal Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowColumnModal(false)}
                >
                  Cancel
                </button>

                {/* EXPORT BUTTON */}
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    if (selectedColumns.length === 0) {
                      toast.error("Please select at least one column.");
                      return;
                    }

                    try {
                      // Excel or PDF based on user’s last selection
                      if (window.exportType === "excel") {
                        const res = await downloadLoanExcelServ({
                          params: {
                            rows: selectedRows.join(","),
                            fields: selectedColumns.join(","),
                          },
                        });

                        const blob = new Blob([res.data], {
                          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", "Loan_Export.xlsx");
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      } else {
                        const res = await downloadLoanPDFServ({
                          params: {
                            rows: selectedRows.join(","),
                            fields: selectedColumns.join(","),
                          },
                        });

                        const blob = new Blob([res.data], {
                          type: "application/pdf",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "Loan_Export.pdf";
                        a.click();
                      }

                      toast.success("File downloaded successfully!");
                      setShowColumnModal(false);
                    } catch (err) {
                      console.error(err);
                      toast.error("Export failed");
                    }
                  }}
                >
                  Export
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
