// src/pages/Finance/FinanceDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { RiAddLine, RiFileExcel2Line, RiFilePdf2Line } from "react-icons/ri";
import {
  createExpenseServ,
  createInvestmentServ,
  createProfitServ,
  createReserverFund,
  getCombinedFinanceListServ,
  downloadCombinedFinanceExcelServ,
  downloadCombinedFinancePdfServ,
} from "../../services/finance.service";
import { usePermission } from "../../hooks/usePermission";

function FinanceDashboard() {
  const [financeData, setFinanceData] = useState({
    profits: [],
    expenses: [],
    investments: [],
    reserves: [],
    totals: {},
  });
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    amount: "",
    date: moment().format("YYYY-MM-DD"),
    description: "",
    durationType: "",
    durationValue: "",
  });

  const { canView, canCreate } = usePermission("Finance");

  const fetchFinanceData = async (filters = {}) => {
    try {
      setShowSkeleton(true);

      const res = await getCombinedFinanceListServ({
        pageNo: 1,
        pageCount: 500,
        dateFrom: filters.from || dateFilter.from || "",
        dateTo: filters.to || dateFilter.to || "",
      });

      const data = res?.data?.data || {};
      setFinanceData(data);
    } catch (err) {
      console.error("Error fetching finance data:", err);
      toast.error("Failed to load finance data");
    } finally {
      setShowSkeleton(false);
    }
  };

  // Auto-filter data whenever date range changes
  useEffect(() => {
    if (canView && (dateFilter.from || dateFilter.to)) {
      fetchFinanceData(dateFilter);
    }
  }, [dateFilter.from, dateFilter.to]);

  useEffect(() => {
    if (canView) fetchFinanceData(); // Load all on mount
  }, [canView]);

  const handleAddClick = (type) => {
    setModalType(type);
    setFormData({
      name: "",
      title: "",
      amount: "",
      date: moment().format("YYYY-MM-DD"),
      description: "",
      durationType: "",
      durationValue: "",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    try {
      const { amount, date, description } = formData;
      if (!amount || !date) {
        toast.error("Please fill all required fields");
        return;
      }

      if (modalType === "expense") {
        await createExpenseServ({
          name: formData.name,
          amount: Number(amount),
          date,
          description,
        });
        toast.success("Expense added successfully");
      } else if (modalType === "investment") {
        if (!formData.durationType || !formData.durationValue) {
          toast.error("Please fill investment duration");
          return;
        }
        await createInvestmentServ({
          name: formData.name,
          amount: Number(amount),
          date,
          durationType: formData.durationType,
          durationValue: Number(formData.durationValue),
          description,
        });
        toast.success("Investment added successfully");
      } else if (modalType === "profit") {
        await createProfitServ({
          title: formData.title || formData.name,
          amount: Number(amount),
          date,
          description,
        });
        toast.success("Profit added successfully");
      } else if (modalType === "reserve") {
        await createReserverFund({
          title: formData.title || formData.name,
          amount: Number(amount),
          date,
          description,
        });
        toast.success("Reserve Fund added successfully");
      }

      setShowAddModal(false);
      fetchFinanceData();
    } catch (err) {
      console.error("Add record error:", err);
      toast.error("Failed to add record");
    }
  };

  const handleDownload = async (format) => {
    try {
      if (!dateFilter.from && !dateFilter.to) {
        toast.info("Please select a date range to filter downloads.");
        return;
      }

      setDownloading(true);
      const service =
        format === "excel"
          ? downloadCombinedFinanceExcelServ
          : downloadCombinedFinancePdfServ;

      // Pass dates as query params
      const params = {};
      if (dateFilter.from) params.dateFrom = dateFilter.from;
      if (dateFilter.to) params.dateTo = dateFilter.to;

      const res = await service(params);

      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      const ext = format === "excel" ? "xlsx" : "pdf";
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `finance_summary_${dateFilter.from || "all"}_${
          dateFilter.to || "today"
        }.${ext}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Filtered ${format.toUpperCase()} downloaded successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download");
    } finally {
      setDownloading(false);
    }
  };

  const AnimatedNumber = ({ value }) => (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fw-bold"
    >
      ₹{(value || 0).toLocaleString()}
    </motion.span>
  );

  const { profits, expenses, investments, reserves, totals } = financeData;

  // Get unique date keys across all types
  const allDates = [
    ...new Set(
      [...profits, ...expenses, ...investments, ...reserves].map((i) =>
        moment(i.date).format("YYYY-MM-DD")
      )
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Finance Management" selectedItem="Finance" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Finance Dashboard</h3>
            {canCreate && (
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-success"
                  onClick={() => handleAddClick("profit")}
                >
                  <RiAddLine /> Add Profit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleAddClick("expense")}
                >
                  <RiAddLine /> Add Expense
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddClick("investment")}
                >
                  <RiAddLine /> Add Investment
                </button>
                <button
                  className="btn btn-warning text-dark"
                  onClick={() => handleAddClick("reserve")}
                >
                  <RiAddLine /> Add Reserve Fund
                </button>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="row g-3 mb-4">
            {[
              {
                label: "Total Profit",
                value: totals.totalProfit,
                color: "#16A34A",
              },
              {
                label: "Total Expense",
                value: totals.totalExpense,
                color: "#DC2626",
              },
              {
                label: "Total Investment",
                value: totals.totalInvestment,
                color: "#2563EB",
              },
              {
                label: "Total Reserve Fund",
                value: totals.totalReserve,
                color: "#FACC15",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="col-lg-3 col-md-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div
                  className="p-4 rounded-4 shadow-sm text-white"
                  style={{ background: card.color }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{card.label}</h5>
                      <h2>
                        <AnimatedNumber value={card.value} />
                      </h2>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Date Range Filter + Download Buttons */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
            <div className="d-flex align-items-center gap-2">
              <label className="fw-semibold">From:</label>
              <input
                type="date"
                className="form-control"
                style={{ width: 160 }}
                value={dateFilter.from}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, from: e.target.value })
                }
              />
              <label className="fw-semibold ms-2">To:</label>
              <input
                type="date"
                className="form-control"
                style={{ width: 160 }}
                value={dateFilter.to}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, to: e.target.value })
                }
              />
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-success"
                disabled={downloading}
                onClick={() => handleDownload("excel")}
              >
                <RiFileExcel2Line /> Download Excel
              </button>
              <button
                className="btn btn-outline-danger"
                disabled={downloading}
                onClick={() => handleDownload("pdf")}
              >
                <RiFilePdf2Line /> Download PDF
              </button>
            </div>
          </div>

          {(dateFilter.from || dateFilter.to) && (
            <div className="filter-banner mb-3">
              <div>
                <i className="bi bi-calendar-week-fill text-primary me-2"></i>
                Showing data from{" "}
                <strong>{dateFilter.from || "Beginning"}</strong> to{" "}
                <strong>{dateFilter.to || "Latest"}</strong>
              </div>
              <button
                className="btn btn-outline-primary btn-sm btn-clear"
                onClick={() => {
                  setDateFilter({ from: "", to: "" });
                  fetchFinanceData({ from: "", to: "" });
                }}
              >
                <i className="bi bi-x-circle"></i> Clear Filter
              </button>
            </div>
          )}

          {/* Combined Table */}
          <div className="card shadow-sm rounded-4 border-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead style={{ background: "#F9FAFB" }}>
                  <tr>
                    <th>Date</th>
                    <th>Profit</th>
                    <th>Expense</th>
                    <th>Investment</th>
                    <th>Reserve Fund</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td>
                          <Skeleton width={120} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                      </tr>
                    ))
                  ) : allDates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    allDates.map((dateKey, i) => {
                      const profitSum = profits
                        .filter(
                          (p) => moment(p.date).format("YYYY-MM-DD") === dateKey
                        )
                        .reduce((sum, p) => sum + (p.amount || 0), 0);
                      const expenseSum = expenses
                        .filter(
                          (e) => moment(e.date).format("YYYY-MM-DD") === dateKey
                        )
                        .reduce((sum, e) => sum + (e.amount || 0), 0);
                      const investSum = investments
                        .filter(
                          (inv) =>
                            moment(inv.date).format("YYYY-MM-DD") === dateKey
                        )
                        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
                      const reserveSum = reserves
                        .filter(
                          (f) => moment(f.date).format("YYYY-MM-DD") === dateKey
                        )
                        .reduce((sum, f) => sum + (f.amount || 0), 0);

                      return (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <td>{moment(dateKey).format("DD MMM YYYY")}</td>
                          <td className="text-success fw-semibold">
                            {profitSum.toLocaleString()}
                          </td>
                          <td className="text-danger fw-semibold">
                            {expenseSum.toLocaleString()}
                          </td>
                          <td className="text-primary fw-semibold">
                            {investSum.toLocaleString()}
                          </td>
                          <td className="text-warning fw-semibold">
                            {reserveSum.toLocaleString()}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                  <tr
                    className="fw-bold total-row"
                    style={{
                      background: "#d1d5db", // darker gray
                      fontWeight: "600",
                      boxShadow:
                        "inset 0 2px 4px rgba(0,0,0,0.06), 0 -3px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <td style={{ color: "#111827" }}>Total</td>
                    <td className="text-success fw-semibold">
                      ₹{totals?.totalProfit?.toLocaleString() || 0}
                    </td>
                    <td className="text-danger fw-semibold">
                      ₹{totals?.totalExpense?.toLocaleString() || 0}
                    </td>
                    <td className="text-primary fw-semibold">
                      ₹{totals?.totalInvestment?.toLocaleString() || 0}
                    </td>
                    <td className="fw-semibold" style={{ color: "#eab308" }}>
                      ₹{totals?.totalReserve?.toLocaleString() || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <motion.div
                className="bg-white p-4 rounded-4 shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ width: 420 }}
              >
                <h5 className="mb-3 text-center text-capitalize">
                  Add {modalType.replace("-", " ")}
                </h5>

                {["expense", "investment"].includes(modalType) && (
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                )}

                {["profit", "reserve"].includes(modalType) && (
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>

                {modalType === "investment" && (
                  <>
                    {/* <div className="mb-3">
                      <label className="form-label">Duration Type</label>
                      <select
                        className="form-select"
                        value={formData.durationType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            durationType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select</option>
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                      </select>
                    </div> */}

                    <div className="mb-3">
                      <label className="form-label">Duration Value</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 6 for 6 months"
                        value={formData.durationValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            durationValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-secondary w-50"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success w-50"
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FinanceDashboard;
