import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import { dashboardDetailsServ } from "../../services/user.service";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Dashboard() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDashboardFunc = async () => {
    try {
      const response = await dashboardDetailsServ();
      setDetails(response?.data?.data);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDashboardFunc();
  }, []);

  const COLORS = ["#00C49F", "#FF8042", "#8884d8", "#82ca9d"];

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Dashboard" selectedItem="Dashboard" />
      <div className="mainContainer">
        <TopNav />
        <div className="dashboard-content p-4">
          <h3 className="dashboard-title mb-4">Finance Dashboard</h3>

          {/* ==== TOP CARDS ==== */}
          <div className="row g-4 mb-4">
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <div className="col-lg-3 col-md-6 col-12" key={i}>
                    <div className="dash-card card-glass p-3">
                      <Skeleton height={80} />
                    </div>
                  </div>
                ))
              : (
                <>
                  {/* Users */}
                  <div className="col-lg-3 col-md-6 col-12">
                    <div className="dash-card card-glass">
                      <div className="card-icon bg-primary text-white">
                        <i className="bi bi-people"></i>
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Total Users</h6>
                        <h3>{details?.users?.totalUsers || 0}</h3>
                        <p className="small text-success">
                          {details?.users?.totalLoans} Loans Created
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Profit */}
                  <div className="col-lg-3 col-md-6 col-12">
                    <div className="dash-card card-glass">
                      <div className="card-icon bg-success text-white">
                        <i className="bi bi-cash-stack"></i>
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Total Profit</h6>
                        <h3>₹{details?.finance?.totalProfit?.toLocaleString()}</h3>
                        <p className="small text-muted">
                          Manual: ₹{details?.finance?.manualProfit} | Loan: ₹
                          {details?.finance?.loanProfit}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Expense */}
                  <div className="col-lg-3 col-md-6 col-12">
                    <div className="dash-card card-glass">
                      <div className="card-icon bg-danger text-white">
                        <i className="bi bi-wallet2"></i>
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Total Expense</h6>
                        <h3>₹{details?.finance?.totalExpense?.toLocaleString()}</h3>
                        <p className="small text-muted">All-time spend</p>
                      </div>
                    </div>
                  </div>

                  {/* Investment */}
                  <div className="col-lg-3 col-md-6 col-12">
                    <div className="dash-card card-glass">
                      <div className="card-icon bg-warning text-white">
                        <i className="bi bi-bar-chart-line"></i>
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Total Investment</h6>
                        <h3>₹{details?.finance?.totalInvestment?.toLocaleString()}</h3>
                        <p className="small text-muted">
                          + Reserve ₹{details?.finance?.totalReserveFund}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
          </div>

          {/* ==== LOAN OVERVIEW ==== */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card p-4 shadow-sm h-100">
                <h5 className="mb-3">Loan Overview</h5>
                {loading ? (
                  <Skeleton height={250} />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Loaned Amount",
                            value: details?.users?.totalLoanAmount || 0,
                          },
                          {
                            name: "Given Amount",
                            value: details?.users?.totalGivenAmount || 0,
                          },
                          {
                            name: "Remaining Loan",
                            value: details?.users?.totalRemainingLoan || 0,
                          },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={index} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* PROFIT vs EXPENSE LINE */}
            <div className="col-md-6">
              <div className="card p-4 shadow-sm h-100">
                <h5 className="mb-3">Profit & Expense Trend</h5>
                {loading ? (
                  <Skeleton height={250} />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={details?.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#28a745"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#dc3545"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* ==== DAILY PERFORMANCE BAR ==== */}
          <div className="card p-4 shadow-sm">
            <h5 className="mb-3">Daily Financial Activity</h5>
            {loading ? (
              <Skeleton height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={details?.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profit" fill="#28a745" name="Profit" />
                  <Bar dataKey="expense" fill="#dc3545" name="Expense" />
                  <Bar dataKey="investment" fill="#ffc107" name="Investment" />
                  <Bar dataKey="reserveFund" fill="#0dcaf0" name="Reserve Fund" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
