// src/pages/Finance/FinanceDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getExpenseListServ,
  getInvestmentListServ,
  getProfitSummaryServ,
  createExpenseServ,
  createInvestmentServ,
  downloadExpenseExcelServ,
  downloadExpensePdfServ,
  downloadInvestmentExcelServ,
  downloadInvestmentPdfServ,
  downloadProfitExcelServ,
  downloadProfitPdfServ,
} from "../../services/finance.service";
import { motion, AnimatePresence } from "framer-motion";
import { RiAddLine, RiFileExcel2Line, RiFilePdf2Line } from "react-icons/ri";
import moment from "moment";
import { usePermission } from "../../hooks/usePermission";

function FinanceDashboard() {
  const [expenseList, setExpenseList] = useState([]);
  const [investmentList, setInvestmentList] = useState([]);
  const [profitList, setProfitList] = useState([]);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [downloading, setDownloading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: moment().format("YYYY-MM-DD"),
    description: "",
    durationType: "",
    durationValue: "",
  });

  const { canView, canCreate } = usePermission("Finance");

  const [totals, setTotals] = useState({
    expense: 0,
    investment: 0,
    profit: 0,
  });

  // ✅ Fetch All Finance Data
  const fetchData = async () => {
    try {
      setShowSkeleton(true);
      const [expenseRes, investmentRes, profitRes] = await Promise.all([
        getExpenseListServ({ pageNo: 1, pageCount: 500 }),
        getInvestmentListServ({ pageNo: 1, pageCount: 500 }),
        getProfitSummaryServ(),
      ]);

      const expenseData = expenseRes?.data?.data?.expenses || [];
      const investmentData = investmentRes?.data?.data?.investments || [];
      const profitData = profitRes?.data?.data?.dailyTrend || [];

      setExpenseList(expenseData);
      setInvestmentList(investmentData);
      setProfitList(profitData);

      const totalExpense = expenseData.reduce((a, b) => a + (b.amount || 0), 0);
      const totalInvestment = investmentData.reduce(
        (a, b) => a + (b.amount || 0),
        0
      );
      const totalProfit = profitRes?.data?.data?.totalProfit || 0;

      setTotals({
        expense: totalExpense,
        investment: totalInvestment,
        profit: totalProfit,
      });
    } catch (err) {
      toast.error("Failed to load finance data");
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    if (canView) fetchData();
  }, []);

  // ✅ Modal Handlers
  const handleAddClick = (type) => {
    setModalType(type);
    setFormData({
      name: "",
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
      if (!formData.name || !formData.amount || !formData.date) {
        toast.error("Please fill all required fields");
        return;
      }

      if (modalType === "expense") {
        await createExpenseServ({
          name: formData.name,
          date: formData.date,
          amount: Number(formData.amount),
          description: formData.description,
        });
        toast.success("Expense added successfully");
      } else {
        if (!formData.durationType || !formData.durationValue) {
          toast.error("Please enter investment duration");
          return;
        }
        await createInvestmentServ({
          name: formData.name,
          date: formData.date,
          amount: Number(formData.amount),
          durationType: formData.durationType,
          durationValue: Number(formData.durationValue),
          description: formData.description,
        });
        toast.success("Investment added successfully");
      }

      setShowAddModal(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to add record");
    }
  };

  // ✅ Handle File Download from Backend
  const handleDownload = async (type, format) => {
    try {
      setDownloading(true);
      let service;

      if (type === "expense") {
        service =
          format === "excel"
            ? downloadExpenseExcelServ
            : downloadExpensePdfServ;
      } else if (type === "investment") {
        service =
          format === "excel"
            ? downloadInvestmentExcelServ
            : downloadInvestmentPdfServ;
      } else {
        service =
          format === "excel" ? downloadProfitExcelServ : downloadProfitPdfServ;
      }

      const res = await service();
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      const ext = format === "excel" ? "xlsx" : "pdf";
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `${type}_report.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${type} ${format.toUpperCase()} downloaded successfully`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download file");
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
      ₹{value.toLocaleString()}
    </motion.span>
  );

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Finance Management" selectedItem="Finance" />
      <div className="mainContainer">
        <TopNav />

        <div className="p-lg-4 p-md-3 p-2">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Finance Dashboard</h3>
            {canCreate && (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-success"
                  onClick={() => handleAddClick("expense")}
                >
                  <RiAddLine size={18} /> Add Expense
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddClick("investment")}
                >
                  <RiAddLine size={18} /> Add Investment
                </button>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="row g-3 mb-4">
            {[
              {
                label: "Total Profit",
                value: totals.profit,
                color: "#16A34A",
                type: "profit",
              },
              {
                label: "Total Expense",
                value: totals.expense,
                color: "#DC2626",
                type: "expense",
              },
              {
                label: "Total Investment",
                value: totals.investment,
                color: "#2563EB",
                type: "investment",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="col-lg-4 col-md-6"
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
                    <div className="d-flex flex-column align-items-end gap-1">
                      <button
                        className="btn btn-sm btn-light text-dark"
                        disabled={downloading}
                        onClick={() => handleDownload(card.type, "excel")}
                      >
                        <RiFileExcel2Line size={18} />
                      </button>
                      <button
                        className="btn btn-sm btn-light text-dark"
                        disabled={downloading}
                        onClick={() => handleDownload(card.type, "pdf")}
                      >
                        <RiFilePdf2Line size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Profit Table */}
          <div className="card shadow-sm rounded-4 border-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead style={{ background: "#F9FAFB" }}>
                  <tr>
                    <th>Date</th>
                    <th>Profit</th>
                    <th>Expense</th>
                    <th>Investment</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td>
                            <Skeleton width={120} />
                          </td>
                          <td>
                            <Skeleton width={100} />
                          </td>
                          <td>
                            <Skeleton width={100} />
                          </td>
                          <td>
                            <Skeleton width={100} />
                          </td>
                        </tr>
                      ))
                    : (() => {
                        // ✅ Combine all unique dates from profit, expense, and investment
                        const allDates = [
                          ...new Set([
                            ...profitList.map((p) =>
                              moment(p.date).format("YYYY-MM-DD")
                            ),
                            ...expenseList.map((e) =>
                              moment(e.date).format("YYYY-MM-DD")
                            ),
                            ...investmentList.map((i) =>
                              moment(i.date).format("YYYY-MM-DD")
                            ),
                          ]),
                        ].sort((a, b) => new Date(b) - new Date(a));

                        if (allDates.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="text-center py-4">
                                No records found
                              </td>
                            </tr>
                          );
                        }

                        // ✅ Initialize totals
                        let totalProfit = 0;
                        let totalExpense = 0;
                        let totalInvestment = 0;

                        const rows = allDates.map((dateKey, i) => {
                          const profit =
                            profitList.find(
                              (p) =>
                                moment(p.date).format("YYYY-MM-DD") === dateKey
                            )?.profit || 0;

                          const expense = expenseList
                            .filter(
                              (e) =>
                                moment(e.date).format("YYYY-MM-DD") === dateKey
                            )
                            .reduce((sum, e) => sum + e.amount, 0);

                          const investment = investmentList
                            .filter(
                              (inv) =>
                                moment(inv.date).format("YYYY-MM-DD") ===
                                dateKey
                            )
                            .reduce((sum, inv) => sum + inv.amount, 0);

                          totalProfit += profit;
                          totalExpense += expense;
                          totalInvestment += investment;

                          return (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <td>{moment(dateKey).format("DD MMM YYYY")}</td>
                              <td className="text-success fw-semibold">
                                {profit.toLocaleString()}
                              </td>
                              <td className="text-danger fw-semibold">
                                {expense.toLocaleString()}
                              </td>
                              <td className="text-primary fw-semibold">
                                {investment.toLocaleString()}
                              </td>
                            </motion.tr>
                          );
                        });

                        // ✅ Add total row at the bottom
                        rows.push(
                          <tr
                            key="total"
                            style={{ background: "#F1F5F9", fontWeight: "600" }}
                          >
                            <td className="fw-bold">Total</td>
                            <td className="text-success fw-bold">
                              {totalProfit.toLocaleString()}
                            </td>
                            <td className="text-danger fw-bold">
                              {totalExpense.toLocaleString()}
                            </td>
                            <td className="text-primary fw-bold">
                              {totalInvestment.toLocaleString()}
                            </td>
                          </tr>
                        );

                        return rows;
                      })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ✅ Add Modal */}
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
                <h5 className="mb-3 text-center">
                  Add {modalType === "expense" ? "Expense" : "Investment"}
                </h5>

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
                    <div className="mb-3">
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
                    </div>

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
