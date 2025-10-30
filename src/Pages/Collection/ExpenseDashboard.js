// src/pages/Finance/ExpenseDashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import { FiDollarSign, FiTrendingDown, FiDownload } from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";
import { usePermission } from "../../hooks/usePermission";
import {
  getExpenseServ,
  downloadExpenseExcelServ,
  downloadExpensePDFServ,
} from "../../services/loan.services";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import moment from "moment";

// --- Tooltip Component ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          padding: "8px 12px",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <p className="fw-semibold mb-1">{moment(label).format("DD MMM YYYY")}</p>
        <p className="mb-0" style={{ color: "#ef4444", fontWeight: 600 }}>
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

function ExpenseDashboard() {
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { canView, canCreate } = usePermission("Expense");

  // --- Fetch Expense Data ---
  useEffect(() => {
    if (!canView) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getExpenseServ();
        if (res?.status === 200 && res?.data?.data) {
          setExpenseData(res.data.data);
        //   toast.success(res?.data?.message || "Expense data loaded successfully");
        } else {
          toast.error(res?.data?.message || "Failed to fetch expense data");
        }
      } catch (err) {
        console.error("Expense data fetch error:", err);
        toast.error(err?.response?.data?.message || "Failed to fetch expense data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canView]);

  // --- Download Handlers ---
  const handleDownload = async (service, fileName) => {
    setDownloading(true);
    try {
      const response = await service();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const extension = fileName.includes("PDF") ? "pdf" : "xlsx";
      link.setAttribute("download", `${fileName}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${fileName.split("_").join(" ")} downloaded successfully!`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // --- Calculate Metrics ---
  const totalExpense = expenseData.reduce((sum, item) => sum + item.expense, 0);
  const lastMonth = moment().subtract(1, "month").format("YYYY-MM");
  const lastMonthExpense = expenseData
    .filter((e) => e.date.startsWith(lastMonth))
    .reduce((sum, e) => sum + e.expense, 0);

  const metrics = [
    { title: "Total Lifetime Expense", value: totalExpense, icon: <FiDollarSign />, color: "#ef4444" },
    { title: "Last Month's Expense", value: lastMonthExpense, icon: <FiTrendingDown />, color: "#f97316" },
    { title: "Total Expense Entries", value: expenseData.length, icon: <MdOutlineCategory />, color: "#8b5cf6" },
  ];

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Collections" selectedItem="Expense" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h3 className="fw-semibold mb-0">Expense Analytics Dashboard</h3>
            {/* <div className="text-muted" style={{ fontSize: "0.85rem" }}>
              Home &gt; Finance &gt; Expense Analytics
            </div> */}
          </div>

          {!canView ? (
            <div className="text-center text-danger py-5 fw-semibold">
              You do not have permission to view this section.
            </div>
          ) : (
            <>
              {/* --- Metrics --- */}
              <div className="row g-4 mb-4">
                {loading
                  ? metrics.map((_, i) => (
                      <div className="col-md-4 col-sm-6" key={i}>
                        <Skeleton height={120} />
                      </div>
                    ))
                  : metrics.map((metric) => (
                      <div className="col-md-4 col-sm-6" key={metric.title}>
                        <div
                          className="card shadow-sm p-4 rounded-3 border-0 metric-card"
                          style={{ borderLeft: `4px solid ${metric.color}` }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <div
                                className="text-muted"
                                style={{ fontSize: 14, fontWeight: 500 }}
                              >
                                {metric.title}
                              </div>
                              <div
                                className="fw-bold"
                                style={{
                                  fontSize: 28,
                                  color: "#0f172a",
                                  marginTop: 4,
                                }}
                              >
                                {metric.title.includes("Entries")
                                  ? metric.value
                                  : `₹${metric.value.toLocaleString("en-IN")}`}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                color: metric.color,
                                backgroundColor: `${metric.color}1A`,
                                padding: 10,
                                borderRadius: "50%",
                              }}
                            >
                              {metric.icon}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>

              {/* --- Chart + Downloads --- */}
              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="card shadow-sm p-4 rounded-3 border-0">
                    <h4 className="fw-semibold mb-3">Expense Trend</h4>
                    {loading ? (
                      <Skeleton height={300} />
                    ) : expenseData.length ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={expenseData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                        >
                          <defs>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => moment(date).format("DD MMM")}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="expense"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            fillOpacity={1}
                            fill="url(#expenseGradient)"
                            name="Daily Expense"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div
                        style={{
                          height: 300,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px dashed #cbd5e1",
                          borderRadius: "8px",
                        }}
                      >
                        <span className="text-muted">No expense data available</span>
                      </div>
                    )}
                  </div>
                </div>

                {canCreate && (
                  <div className="col-lg-4">
                    <div className="card shadow-sm p-4 rounded-3 border-0 d-flex flex-column h-100">
                      <h4 className="fw-semibold mb-3">Report Downloads</h4>
                      <button
                        onClick={() =>
                          handleDownload(downloadExpenseExcelServ, "Expense_Report_Excel")
                        }
                        disabled={downloading}
                        style={{
                          padding: "12px 16px",
                          borderRadius: 8,
                          backgroundColor: downloading ? "#9ca3af" : "#2563eb",
                          color: "#fff",
                          border: "none",
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: downloading ? "not-allowed" : "pointer",
                          marginBottom: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiDownload size={18} className="me-2" />
                        {downloading ? "Preparing Excel..." : "Download Excel Report"}
                      </button>

                      <button
                        onClick={() =>
                          handleDownload(downloadExpensePDFServ, "Expense_Report_PDF")
                        }
                        disabled={downloading}
                        style={{
                          padding: "12px 16px",
                          borderRadius: 8,
                          backgroundColor: downloading ? "#9ca3af" : "#dc2626",
                          color: "#fff",
                          border: "none",
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: downloading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiDownload size={18} className="me-2" />
                        {downloading ? "Preparing PDF..." : "Download PDF Report"}
                      </button>

                      <p
                        className="text-muted mt-auto pt-3 text-center"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Reports reflect data as of{" "}
                        <strong>{new Date().toLocaleDateString()}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hover animation */}
      <style>{`
        .metric-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}

export default ExpenseDashboard;
