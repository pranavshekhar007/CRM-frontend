// import React, { useState, useEffect } from "react";
// import Sidebar from "../../Components/Sidebar";
// import TopNav from "../../Components/TopNav";
// import { dashboardDetailsServ } from "../../services/user.service";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
// } from "recharts";
// import {
//   FaUserFriends,
//   FaRegBuilding,
//   FaChartLine,
//   FaClipboardList,
//   FaUsers,
//   FaCalendarAlt,
//   FaEnvelopeOpenText,
//   FaBell,
//   FaBriefcase,
// } from "react-icons/fa"; // Using react-icons for cleaner icons

// // --- MOCK DATA STRUCTURES (REPLACE WITH REAL API DATA) ---

// // 1. Top Stat Cards Data
// // New colors and placeholder icons to match the screenshot
// const CARD_COLORS = {
//   employee: {
//     iconBg: "#F0F5FF",
//     iconUrl: "https://cdn-icons-png.flaticon.com/128/1077/1077114.png",
//   }, // Blue
//   branch: {
//     iconBg: "#EEFFF0",
//     iconUrl: "https://cdn-icons-png.flaticon.com/128/2550/2550474.png",
//   }, // Green
//   attendance: {
//     iconBg: "#FFF7EB",
//     iconUrl: "https://cdn-icons-png.flaticon.com/128/3602/3602123.png",
//   }, // Orange
//   leave: {
//     iconBg: "#FFFBEB",
//     iconUrl: "https://cdn-icons-png.flaticon.com/128/3208/3208759.png",
//   }, // Yellow/Gold
//   jobs: {
//     iconBg: "#FFF2E6",
//     iconUrl: "https://cdn-icons-png.flaticon.com/128/3514/3514491.png",
//   }, // Peach/Orange
//   candidates: {
//     iconBg: "#F0F5FF",
//     iconUrl: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png",
//   }, // Light Blue
// };

// // 1. Top Stat Cards Data
// const STAT_CARDS_DATA = [
//   {
//     title: "Total Employees",
//     count: 12,
//     change: "+0 this month",
//     description: null,
//     ...CARD_COLORS.employee,
//   },
//   {
//     title: "Branches",
//     count: 9,
//     change: null,
//     description: "24 departments",
//     ...CARD_COLORS.branch,
//   },
//   {
//     title: "Attendance Rate",
//     count: "0%",
//     change: null,
//     description: "0 present today",
//     ...CARD_COLORS.attendance,
//   },
//   {
//     title: "Pending Leaves",
//     count: 0,
//     change: null,
//     description: "60 on leave today",
//     ...CARD_COLORS.leave,
//   },
//   {
//     title: "Active Jobs",
//     count: 6,
//     change: "+0 this month",
//     description: null,
//     ...CARD_COLORS.jobs,
//   },
//   {
//     title: "Total Candidates",
//     count: 20,
//     change: "+0 this month",
//     description: null,
//     ...CARD_COLORS.candidates,
//   },
// ];

// // 2. Department Distribution Pie Chart Data
// const DEPARTMENT_DATA = [
//   { name: "Finance", value: 10 },
//   { name: "HR", value: 15 },
//   { name: "Marketing", value: 20 },
//   { name: "IT", value: 35 },
//   { name: "Sales", value: 18 },
// ];
// const DEPARTMENT_COLORS = [
//   "#FF6384",
//   "#36A2EB",
//   "#FFCE56",
//   "#4BC0C0",
//   "#9966FF",
//   "#FF9F40",
// ];

// // 3. Hiring Trend (6 Months) Bar Chart Data
// const HIRING_TREND_DATA = [
//   { month: "Jun 2025", hires: 0 },
//   { month: "Jul 2025", hires: 0 },
//   { month: "Aug 2025", hires: 0 },
//   { month: "Sep 2025", hires: 0 },
//   { month: "Oct 2025", hires: 10 },
// ];

// // 4. Employee Growth Line Chart Data (The second image)
// const EMPLOYEE_GROWTH_DATA = [
//   { name: "January", employees: 0 },
//   { name: "February", employees: 0 },
//   { name: "March", employees: 0 },
//   { name: "April", employees: 0 },
//   { name: "May", employees: 0 },
//   { name: "June", employees: 0 },
//   { name: "July", employees: 0 },
//   { name: "August", employees: 0 },
//   { name: "September", employees: 10 },
//   { name: "October", employees: 2 },
//   { name: "November", employees: 0 },
//   { name: "December", employees: 0 },
// ];

// // 5. Candidate Status Pie Chart Data
// const CANDIDATE_STATUS_DATA = [
//   { name: "Hired", value: 15 },
//   { name: "Interview", value: 10 },
//   { name: "New", value: 5 },
//   { name: "Offer", value: 8 },
//   { name: "Rejected", value: 12 },
//   { name: "Screening", value: 10 },
// ];
// const CANDIDATE_COLORS = [
//   "#38C172",
//   "#1C7BC8",
//   "#FFCC00",
//   "#FF7F50",
//   "#DC3545",
//   "#00BCD4",
// ];

// // 6. Leave Types Donut Chart Data
// const LEAVE_TYPES_DATA = [
//   { name: "Annual Leave", value: 10 },
//   { name: "Emergency Leave", value: 5 },
//   { name: "Sick Leave", value: 8 },
//   { name: "Maternity Leave", value: 2 },
//   { name: "Paternity Leave", value: 1 },
//   { name: "Study Leave", value: 3 },
//   { name: "Bereavement Leave", value: 1 },
//   { name: "Compensatory Leave", value: 4 },
// ];

// // 7. Recent Applications/Candidates/Announcements/Meetings Lists Data
// const RECENT_LEAVES = [
//   {
//     employee: "Sikha Devi",
//     status: "approved",
//     period: "Annual Leave · Jan 07 - Jan 08",
//   },
//   {
//     employee: "Jhon Smith",
//     status: "approved",
//     period: "Sick Leave · Feb 10 - Feb 10",
//   },
//   // Add more...
// ];

// const RECENT_CANDIDATES = [
//   {
//     name: "Sanjay Verma",
//     status: "New",
//     role: "Digital Marketing Specialist",
//     date: "Sep 19, 2025",
//   },
//   {
//     name: "Rahul Jain",
//     status: "New",
//     role: "HR Business Partner",
//     date: "Sep 19, 2025",
//   },
//   // Add more...
// ];

// const RECENT_ANNOUNCEMENTS = [
//   { title: "events", date: "Oct 14, 2025", priority: "Low" },
//   {
//     title: "Welcome to New Financial Year 2025",
//     date: "Sep 19, 2025",
//     priority: "High Priority",
//   },
//   {
//     title: "Updated Employee Handbook and Policies",
//     date: "Sep 19, 2025",
//     priority: "High Priority",
//   },
//   {
//     title: "Annual Performance Review Process",
//     date: "Sep 19, 2025",
//     priority: "High Priority",
//   },
//   // Add more...
// ];

// const RECENT_MEETINGS = [
//   {
//     title: "Daily Scrum Meeting",
//     status: "Scheduled",
//     time: "Oct 09, 2025 · 10:00:00 - 10:30:00",
//   },
//   {
//     title: "Daily Scrum Meeting",
//     status: "Scheduled",
//     time: "Oct 06, 2025 · 10:00:00 - 10:30:00",
//   },
//   {
//     title: "Daily Scrum Meeting",
//     status: "Scheduled",
//     time: "Oct 07, 2025 · 10:00:00 - 10:30:00",
//   },
//   {
//     title: "Daily Scrum Meeting",
//     status: "Scheduled",
//     time: "Oct 08, 2025 · 10:00:00 - 10:30:00",
//   },
//   {
//     title: "Daily Scrum Meeting",
//     status: "Scheduled",
//     time: "Oct 09, 2025 · 10:00:00 - 10:30:00",
//   },
//   {
//     title: "Daily Scrum Meeting",
//     status: "Scheduled",
//     time: "Oct 06, 2025 · 10:00:00 - 10:30:00",
//   },
//   {
//     title: "Daily Scrum Meeting",
//     status: "Scheduled",
//     time: "Oct 07, 2025 · 10:00:00 - 10:30:00",
//   },
//   {
//     title: "Daily Scrum Meeting",
//     status: "Scheduled",
//     time: "Oct 08, 2025 · 10:00:00 - 10:30:00",
//   },
//   // Add more...
// ];

// // --- COMPONENTS FOR REUSABILITY ---

// const TopStatCard = ({
//   title,
//   count,
//   description,
//   iconUrl,
//   iconBg,
//   change,
// }) => (
//   // *** KEY CHANGE: Use col-lg-4 for 3 cards per row ***
//   <div className="col-lg-4 col-md-6 col-12 mb-4">
//     {/* Card with shadow, padding, and high rounded corners */}
//     <div className="card h-100 shadow-sm p-4 border-0 rounded-4">
//       {/* Align title and icon on top, separated by space */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <p
//           className="text-muted mb-0"
//           style={{ fontSize: "1rem", fontWeight: 500 }}
//         >
//           {title}
//         </p>

//         {/* Right Side: Circular Icon Area (Placeholder) */}
//         <div
//           className="p-1 rounded-circle"
//           style={{
//             backgroundColor: iconBg,
//             width: "40px",
//             height: "40px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           {/* Using a small image placeholder to represent the illustration */}
//           <img
//             src={iconUrl}
//             alt={title}
//             style={{
//               width: "70%",
//               height: "70%",
//               objectFit: "contain",
//             }}
//           />
//         </div>
//       </div>

//       {/* Count and Description/Change text */}
//       <h1 className="fw-bold mb-1" style={{ fontSize: "2.5rem" }}>
//         {count}
//       </h1>

//       {/* Description or Change text, aligned below the count */}
//       {change && (
//         <p
//           className="text-success mb-0"
//           style={{ fontSize: "0.9rem", fontWeight: 600 }}
//         >
//           {change}
//         </p>
//       )}
//       {description && (
//         <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
//           {description}
//         </p>
//       )}
//     </div>
//   </div>
// );

// const SectionTitle = ({ title, icon, actionText, actionCount }) => (
//   <div className="d-flex justify-content-between align-items-center mb-3">
//     <h5 className="mb-0 d-flex align-items-center">
//       {icon} <span className="ms-2">{title}</span>
//     </h5>
//     {actionText && (
//       <div className="d-flex align-items-center">
//         {actionCount && (
//           <span className="badge bg-light text-dark me-2">{actionCount}</span>
//         )}
//         <button className="btn btn-sm btn-outline-secondary">
//           {actionText}
//         </button>
//       </div>
//     )}
//   </div>
// );

// // --- MAIN DASHBOARD COMPONENT ---

// function Dashboard() {
//   const [details, setDetails] = useState(null);

//   // NOTE: Keep your actual API call in handleDashboardFunc and useEffect
//   const handleDashboardFunc = async () => {
//     try {
//       // let response = await dashboardDetailsServ();
//       // setDetails(response?.data?.data);
//       console.log("Fetching dashboard data...");
//     } catch (error) {
//       console.error("Dashboard fetch failed:", error);
//     }
//   };
//   useEffect(() => {
//     handleDashboardFunc();
//   }, []);

//   // --- RENDERING ---
//   return (
//     <div className="bodyContainer">
//       <Sidebar selectedMenu="Dashboard" selectedItem="Dashboard" />
//       <div className="mainContainer">
//         <TopNav />
//         <div className="p-lg-4 p-md-3 p-2 dashboard-content">
//           {/* Title and Refresh Button */}
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h3 className="fw-bold">Dashboard</h3>
//             <button className="btn btn-outline-secondary d-flex align-items-center">
//               <FaCalendarAlt className="me-2" /> Refresh
//             </button>
//           </div>
//           {/* 1. TOP STAT CARDS (ROW 1 - 6 CARDS) */}
//           <div className="row mx-0 p-0 mb-4">
//             {STAT_CARDS_DATA.map((v, i) => (
//               <TopStatCard key={i} {...v} />
//             ))}
//           </div>
//           {/* 2. MAIN CHARTS (ROW 2 - 2 COLUMNS) */}
//           <div className="row mb-4">
//             {/* Department Distribution (Pie Chart) */}
//             <div className="col-lg-6 col-12 mb-4">
//               <div className="card shadow-sm p-4 h-100 border-0">
//                 <SectionTitle
//                   title="Department Distribution"
//                   icon={<FaRegBuilding />}
//                 />
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={DEPARTMENT_DATA}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={80}
//                       fill="#8884d8"
//                       labelLine={false}
//                     >
//                       {DEPARTMENT_DATA.map((entry, index) => (
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={
//                             DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]
//                           }
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend
//                       layout="horizontal"
//                       verticalAlign="bottom"
//                       align="center"
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* Hiring Trend (Bar Chart) */}
//             <div className="col-lg-6 col-12 mb-4">
//               <div className="card shadow-sm p-4 h-100 border-0">
//                 <SectionTitle
//                   title="Hiring Trend (6 Months)"
//                   icon={<FaChartLine />}
//                 />
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart
//                     data={HIRING_TREND_DATA}
//                     margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="hires" fill="#36A2EB" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//           {/* 3. EMPLOYEE GROWTH CHART (ROW 3 - Full Width) */}
//           <div className="row mb-4">
//             <div className="col-12">
//               <div className="card shadow-sm p-4 border-0">
//                 <SectionTitle
//                   title="Employee Growth (2025)"
//                   icon={<FaUserFriends />}
//                 />
//                 <ResponsiveContainer width="100%" height={300}>
//                   <AreaChart
//                     data={EMPLOYEE_GROWTH_DATA}
//                     margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Area
//                       type="monotone"
//                       dataKey="employees"
//                       stroke="#36A2EB"
//                       fill="#36A2EB"
//                       fillOpacity={0.3}
//                     />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//           {/* 4. CANDIDATE & LEAVE CHARTS (ROW 4 - 2 COLUMNS) */}
//           <div className="row mb-4">
//             {/* Candidate Status (Pie Chart) */}
//             <div className="col-lg-6 col-12 mb-4">
//               <div className="card shadow-sm p-4 h-100 border-0">
//                 <SectionTitle title="Candidate Status" icon={<FaUsers />} />
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={CANDIDATE_STATUS_DATA}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={80}
//                       fill="#8884d8"
//                     >
//                       {CANDIDATE_STATUS_DATA.map((entry, index) => (
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={
//                             CANDIDATE_COLORS[index % CANDIDATE_COLORS.length]
//                           }
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend
//                       layout="horizontal"
//                       verticalAlign="bottom"
//                       align="center"
//                       iconType="circle"
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* Leave Types (Donut Chart) */}
//             <div className="col-lg-6 col-12 mb-4">
//               <div className="card shadow-sm p-4 h-100 border-0">
//                 <SectionTitle title="Leave Types" icon={<FaClipboardList />} />
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={LEAVE_TYPES_DATA}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={100}
//                       paddingAngle={5}
//                       fill="#8884d8"
//                     >
//                       {LEAVE_TYPES_DATA.map((entry, index) => (
//                         // Reusing department colors for simplicity, or define a new set
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={
//                             DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]
//                           }
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend
//                       layout="horizontal"
//                       verticalAlign="bottom"
//                       align="center"
//                       iconType="circle"
//                       wrapperStyle={{ padding: "10px 0" }}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//           {/* 5. RECENT LISTS (ROW 5 - 4 COLUMNS) */}
//           <div className="row">
//             {/* Recent Leave Applications */}
//             {/* KEY CHANGE: col-xl-6 for 2 cards per row on large screens */}
//             <div className="col-lg-6 col-xl-6 col-12 mb-4">
//               <div className="card shadow-sm p-4 h-100 border-0 rounded-4">
//                 <SectionTitle
//                   title="Recent Leave Applications"
//                   icon={<FaClipboardList />}
//                   actionText="View All"
//                   actionCount={60}
//                 />

//                 {/* Scrollable List Container */}
//                 <div
//                   className="list-group list-group-flush"
//                   style={{ maxHeight: "350px", overflowY: "auto" }} // ADDED SCROLLING
//                 >
//                   {RECENT_LEAVES.map((leave, index) => (
//                     <div
//                       key={index}
//                       className="list-group-item d-flex justify-content-between align-items-center"
//                       style={{ paddingLeft: 0, paddingRight: 0 }} // Remove default list-group-item horizontal padding
//                     >
//                       <div>
//                         {/* Image shows "Employee" text for all, followed by status */}
//                         <p className="mb-0 fw-bold">
//                           Employee{" "}
//                           <span className={`badge bg-success ms-2`}>
//                             {leave.status}
//                           </span>
//                         </p>
//                         <small className="text-muted">{leave.period}</small>
//                       </div>
//                       {/* If you wanted to show the employee name, use this: */}
//                       {/* <small className="text-muted">{leave.employee}</small> */}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Recent Candidates */}
//             {/* KEY CHANGE: col-xl-6 for 2 cards per row on large screens */}
//             <div className="col-lg-6 col-xl-6 col-12 mb-4">
//               <div className="card shadow-sm p-4 h-100 border-0 rounded-4">
//                 <SectionTitle
//                   title="Recent Candidates"
//                   icon={<FaUsers />}
//                   actionText="View All"
//                   actionCount={5}
//                 />

//                 {/* Scrollable List Container */}
//                 <div
//                   className="list-group list-group-flush"
//                   style={{ maxHeight: "350px", overflowY: "auto" }} // ADDED SCROLLING
//                 >
//                   {RECENT_CANDIDATES.map((candidate, index) => (
//                     <div
//                       key={index}
//                       className="list-group-item"
//                       style={{ paddingLeft: 0, paddingRight: 0 }} // Remove default list-group-item horizontal padding
//                     >
//                       <div className="d-flex justify-content-start align-items-center mb-1">
//                         <p className="mb-0 fw-bold">{candidate.name}</p>
//                         {/* Status badge based on image colors */}
//                         <span
//                           className={`badge ms-2 ${
//                             candidate.status === "New"
//                               ? "bg-primary"
//                               : candidate.status === "Interview"
//                               ? "bg-info"
//                               : candidate.status === "Rejected"
//                               ? "bg-danger"
//                               : candidate.status === "Screening"
//                               ? "bg-warning"
//                               : "bg-secondary"
//                           }`}
//                           style={{ opacity: 0.8, fontSize: "0.7em" }}
//                         >
//                           {candidate.status}
//                         </span>
//                       </div>
//                       <small className="text-muted">
//                         {candidate.role} · {candidate.date}
//                       </small>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Recent Announcements */}
//             <div className="col-lg-6 col-xl-6 col-12 mb-4">
//               <div className="card shadow-sm p-4 h-100 border-0 rounded-4">
//                 <SectionTitle
//                   title="Recent Announcements"
//                   icon={<FaBell />}
//                   actionText="View All"
//                   actionCount={5}
//                 />
//                 {/* Scrollable List Container */}
//                 <div
//                   className="list-group list-group-flush"
//                   style={{ maxHeight: "350px", overflowY: "auto" }} // ADDED SCROLLING
//                 >
//                   {RECENT_ANNOUNCEMENTS.map((ann, index) => (
//                     <div
//                       key={index}
//                       className="list-group-item"
//                       style={{ paddingLeft: 0, paddingRight: 0 }}
//                     >
//                       <p className="mb-1 fw-bold">{ann.title}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <small className="text-muted">{ann.date}</small>
//                         {ann.priority === "High Priority" && (
//                           <span className={`badge bg-danger`}>
//                             {ann.priority}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Recent Meetings */}
//             <div className="col-lg-6 col-xl-6 col-12 mb-4">
//               <div className="card shadow-sm p-4 h-100 border-0 rounded-4">
//                 <SectionTitle
//                   title="Recent Meetings"
//                   icon={<FaCalendarAlt />}
//                   actionText="View All"
//                   actionCount={5}
//                 />
//                 {/* Scrollable List Container */}
//                 <div
//                   className="list-group list-group-flush"
//                   style={{ maxHeight: "350px", overflowY: "auto" }} // ADDED SCROLLING
//                 >
//                   {RECENT_MEETINGS.map((meeting, index) => (
//                     <div
//                       key={index}
//                       className="list-group-item"
//                       style={{ paddingLeft: 0, paddingRight: 0 }}
//                     >
//                       <p className="mb-0 fw-bold">{meeting.title}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <small className="text-muted">{meeting.time}</small>
//                         <span className={`badge bg-secondary`}>
//                           {meeting.status}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;


import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
// Import the actual service function
import { dashboardDetailsServ } from "../../services/user.service"; 
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  FaUserFriends,
  FaRegBuilding,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaCalendarAlt,
  FaBell,
} from "react-icons/fa";

// --- CONSTANTS AND MOCK DATA (KEPT AS FALLBACK/STRUCTURE) ---

// Card colors and helper map (Keep this, as it's for styling)
const CARD_COLORS = {
  employee: {
    iconBg: "#F0F5FF",
    iconUrl: "https://cdn-icons-png.flaticon.com/128/1077/1077114.png",
    key: "total_employees",
  },
  branch: {
    iconBg: "#EEFFF0",
    iconUrl: "https://cdn-icons-png.flaticon.com/128/2550/2550474.png",
    key: "total_branches",
  },
  attendance: {
    iconBg: "#FFF7EB",
    iconUrl: "https://cdn-icons-png.flaticon.com/128/3602/3602123.png",
    key: "attendance_rate",
  },
  leave: {
    iconBg: "#FFFBEB",
    iconUrl: "https://cdn-icons-png.flaticon.com/128/3208/3208759.png",
    key: "pending_leaves",
  },
  jobs: {
    iconBg: "#FFF2E6",
    iconUrl: "https://cdn-icons-png.flaticon.com/128/3514/3514491.png",
    key: "active_jobs",
  },
  candidates: {
    iconBg: "#F0F5FF",
    iconUrl: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png",
    key: "total_candidates",
  },
};

// Map the structure of the STAT_CARDS_DATA to the CARD_COLORS map
const INITIAL_STAT_CARDS_DATA = [
  { title: "Total Employees", count: 0, change: null, description: null, ...CARD_COLORS.employee, dataKey: CARD_COLORS.employee.key },
  { title: "Branches", count: 0, change: null, description: null, ...CARD_COLORS.branch, dataKey: CARD_COLORS.branch.key },
  { title: "Attendance Rate", count: "0%", change: null, description: null, ...CARD_COLORS.attendance, dataKey: CARD_COLORS.attendance.key },
  { title: "Pending Leaves", count: 0, change: null, description: null, ...CARD_COLORS.leave, dataKey: CARD_COLORS.leave.key },
  { title: "Active Jobs", count: 0, change: null, description: null, ...CARD_COLORS.jobs, dataKey: CARD_COLORS.jobs.key },
  { title: "Total Candidates", count: 0, change: null, description: null, ...CARD_COLORS.candidates, dataKey: CARD_COLORS.candidates.key },
];


const DEPARTMENT_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

const CANDIDATE_COLORS = [
  "#38C172",
  "#1C7BC8",
  "#FFCC00",
  "#FF7F50",
  "#DC3545",
  "#00BCD4",
];

// Fallback empty data for state initialization
const EMPTY_CHART_DATA = [];
const EMPTY_LIST_DATA = [];

// --- REUSABLE COMPONENTS (KEEP AS-IS) ---
// TopStatCard and SectionTitle components are fine and remain unchanged.
const TopStatCard = ({
  title,
  count,
  description,
  iconUrl,
  iconBg,
  change,
}) => (
  <div className="col-lg-4 col-md-6 col-12 mb-4">
    <div className="card h-100 shadow-sm p-4 border-0 rounded-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p
          className="text-muted mb-0"
          style={{ fontSize: "1rem", fontWeight: 500 }}
        >
          {title}
        </p>
        <div
          className="p-1 rounded-circle"
          style={{
            backgroundColor: iconBg,
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={iconUrl}
            alt={title}
            style={{
              width: "70%",
              height: "70%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
      <h1 className="fw-bold mb-1" style={{ fontSize: "2.5rem" }}>
        {count}
      </h1>
      {change && (
        <p
          className="text-success mb-0"
          style={{ fontSize: "0.9rem", fontWeight: 600 }}
        >
          {change}
        </p>
      )}
      {description && (
        <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
          {description}
        </p>
      )}
    </div>
  </div>
);

const SectionTitle = ({ title, icon, actionText, actionCount }) => (
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h5 className="mb-0 d-flex align-items-center">
      {icon} <span className="ms-2">{title}</span>
    </h5>
    {actionText && (
      <div className="d-flex align-items-center">
        {actionCount && (
          <span className="badge bg-light text-dark me-2">{actionCount}</span>
        )}
        <button className="btn btn-sm btn-outline-secondary">
          {actionText}
        </button>
      </div>
    )}
  </div>
);


// --- MAIN DASHBOARD COMPONENT ---

function Dashboard() {
  // State to hold the top stat cards data
  const [statCards, setStatCards] = useState(INITIAL_STAT_CARDS_DATA);
  // State to hold chart data
  const [departmentData, setDepartmentData] = useState(EMPTY_CHART_DATA);
  const [hiringTrendData, setHiringTrendData] = useState(EMPTY_CHART_DATA);
  const [employeeGrowthData, setEmployeeGrowthData] = useState(EMPTY_CHART_DATA);
  const [candidateStatusData, setCandidateStatusData] = useState(EMPTY_CHART_DATA);
  const [leaveTypesData, setLeaveTypesData] = useState(EMPTY_CHART_DATA);
  // State to hold list data
  const [recentLeaves, setRecentLeaves] = useState(EMPTY_LIST_DATA);
  const [recentCandidates, setRecentCandidates] = useState(EMPTY_LIST_DATA);
  const [recentAnnouncements, setRecentAnnouncements] = useState(EMPTY_LIST_DATA);
  const [recentMeetings, setRecentMeetings] = useState(EMPTY_LIST_DATA);


  // Function to map the API response data to the stat card structure
  const mapStatCardsData = (apiData) => {
    return statCards.map(card => {
      // Find the corresponding value from the API data using the 'dataKey'
      const apiValue = apiData[card.dataKey];
      
      // Determine the count, description, and change based on the key
      let newCount = apiValue || card.count;
      let newDescription = card.description;
      let newChange = card.change;

      // Custom logic for specific cards based on expected API structure
      if (card.dataKey === 'total_employees' && apiData.employee_change_this_month !== undefined) {
          newChange = apiData.employee_change_this_month > 0 ? `+${apiData.employee_change_this_month} this month` : `${apiData.employee_change_this_month} this month`;
      } else if (card.dataKey === 'attendance_rate' && apiData.present_today !== undefined) {
          newDescription = `${apiData.present_today} present today`;
      } else if (card.dataKey === 'pending_leaves' && apiData.on_leave_today !== undefined) {
          newDescription = `${apiData.on_leave_today} on leave today`;
      }

      return {
        ...card,
        count: newCount,
        description: newDescription,
        change: newChange,
      };
    });
  };


  const handleDashboardFunc = async () => {
    try {
      console.log("Fetching dashboard data...");
      // 1. Call the service
      let response = await dashboardDetailsServ();
      const apiData = response?.data?.data || {};

      // 2. Set Top Stat Cards Data
      setStatCards(mapStatCardsData(apiData));

      // 3. Set Chart Data (Assuming API returns keys like: department_distribution, hiring_trend, etc.)
      setDepartmentData(apiData.department_distribution || EMPTY_CHART_DATA);
      setHiringTrendData(apiData.hiring_trend || EMPTY_CHART_DATA);
      setEmployeeGrowthData(apiData.employee_growth || EMPTY_CHART_DATA);
      setCandidateStatusData(apiData.candidate_status || EMPTY_CHART_DATA);
      setLeaveTypesData(apiData.leave_types || EMPTY_CHART_DATA);

      // 4. Set List Data (Assuming API returns keys like: recent_leaves, recent_candidates, etc.)
      setRecentLeaves(apiData.recent_leaves || EMPTY_LIST_DATA);
      setRecentCandidates(apiData.recent_candidates || EMPTY_LIST_DATA);
      setRecentAnnouncements(apiData.recent_announcements || EMPTY_LIST_DATA);
      setRecentMeetings(apiData.recent_meetings || EMPTY_LIST_DATA);
      
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      // Optional: Set an error state or keep fallback mock data visible
    }
  };

  useEffect(() => {
    handleDashboardFunc();
  }, []);

  // --- RENDERING ---
  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Dashboard" selectedItem="Dashboard" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2 dashboard-content">
          {/* Title and Refresh Button */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold">Dashboard</h3>
            <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleDashboardFunc}>
              <FaCalendarAlt className="me-2" /> Refresh
            </button>
          </div>
          {/* 1. TOP STAT CARDS (ROW 1) */}
          <div className="row mx-0 p-0 mb-4">
            {/* Now mapping the dynamic statCards state */}
            {statCards.map((v, i) => (
              <TopStatCard key={i} {...v} />
            ))}
          </div>
          {/* 2. MAIN CHARTS (ROW 2 - Department & Hiring) */}
          <div className="row mb-4">
            {/* Department Distribution (Pie Chart) - uses departmentData */}
            <div className="col-lg-6 col-12 mb-4">
              <div className="card shadow-sm p-4 h-100 border-0">
                <SectionTitle
                  title="Department Distribution"
                  icon={<FaRegBuilding />}
                />
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData} // DYNAMIC DATA
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      labelLine={false}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hiring Trend (Bar Chart) - uses hiringTrendData */}
            <div className="col-lg-6 col-12 mb-4">
              <div className="card shadow-sm p-4 h-100 border-0">
                <SectionTitle
                  title="Hiring Trend (6 Months)"
                  icon={<FaChartLine />}
                />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={hiringTrendData} // DYNAMIC DATA
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hires" fill="#36A2EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* 3. EMPLOYEE GROWTH CHART (ROW 3 - Full Width) */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm p-4 border-0">
                <SectionTitle
                  title="Employee Growth (2025)"
                  icon={<FaUserFriends />}
                />
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={employeeGrowthData} // DYNAMIC DATA
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="employees"
                      stroke="#36A2EB"
                      fill="#36A2EB"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* 4. CANDIDATE & LEAVE CHARTS (ROW 4 - 2 COLUMNS) */}
          <div className="row mb-4">
            {/* Candidate Status (Pie Chart) - uses candidateStatusData */}
            <div className="col-lg-6 col-12 mb-4">
              <div className="card shadow-sm p-4 h-100 border-0">
                <SectionTitle title="Candidate Status" icon={<FaUsers />} />
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={candidateStatusData} // DYNAMIC DATA
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {candidateStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CANDIDATE_COLORS[index % CANDIDATE_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leave Types (Donut Chart) - uses leaveTypesData */}
            <div className="col-lg-6 col-12 mb-4">
              <div className="card shadow-sm p-4 h-100 border-0">
                <SectionTitle title="Leave Types" icon={<FaClipboardList />} />
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leaveTypesData} // DYNAMIC DATA
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      fill="#8884d8"
                    >
                      {leaveTypesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      wrapperStyle={{ padding: "10px 0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* 5. RECENT LISTS (ROW 5) */}
          <div className="row">
            {/* Recent Leave Applications - uses recentLeaves */}
            <div className="col-lg-6 col-xl-6 col-12 mb-4">
              <div className="card shadow-sm p-4 h-100 border-0 rounded-4">
                <SectionTitle
                  title="Recent Leave Applications"
                  icon={<FaClipboardList />}
                  actionText="View All"
                  actionCount={recentLeaves.length} // DYNAMIC COUNT
                />
                <div
                  className="list-group list-group-flush"
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                  {recentLeaves.map((leave, index) => (
                    <div
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                      style={{ paddingLeft: 0, paddingRight: 0 }}
                    >
                      <div>
                        <p className="mb-0 fw-bold">
                          {leave.employee || "Employee"} 
                          <span className={`badge bg-${leave.status === 'approved' ? 'success' : 'warning'} ms-2`}>
                            {leave.status}
                          </span>
                        </p>
                        <small className="text-muted">{leave.period}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Candidates - uses recentCandidates */}
            <div className="col-lg-6 col-xl-6 col-12 mb-4">
              <div className="card shadow-sm p-4 h-100 border-0 rounded-4">
                <SectionTitle
                  title="Recent Candidates"
                  icon={<FaUsers />}
                  actionText="View All"
                  actionCount={recentCandidates.length} // DYNAMIC COUNT
                />
                <div
                  className="list-group list-group-flush"
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                  {recentCandidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="list-group-item"
                      style={{ paddingLeft: 0, paddingRight: 0 }}
                    >
                      <div className="d-flex justify-content-start align-items-center mb-1">
                        <p className="mb-0 fw-bold">{candidate.name}</p>
                        <span
                          className={`badge ms-2 ${
                            candidate.status === "New"
                              ? "bg-primary"
                              : candidate.status === "Interview"
                              ? "bg-info"
                              : candidate.status === "Rejected"
                              ? "bg-danger"
                              : candidate.status === "Screening"
                              ? "bg-warning"
                              : "bg-secondary"
                          }`}
                          style={{ opacity: 0.8, fontSize: "0.7em" }}
                        >
                          {candidate.status}
                        </span>
                      </div>
                      <small className="text-muted">
                        {candidate.role} · {candidate.date}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Announcements - uses recentAnnouncements */}
            <div className="col-lg-6 col-xl-6 col-12 mb-4">
              <div className="card shadow-sm p-4 h-100 border-0 rounded-4">
                <SectionTitle
                  title="Recent Announcements"
                  icon={<FaBell />}
                  actionText="View All"
                  actionCount={recentAnnouncements.length} // DYNAMIC COUNT
                />
                <div
                  className="list-group list-group-flush"
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                  {recentAnnouncements.map((ann, index) => (
                    <div
                      key={index}
                      className="list-group-item"
                      style={{ paddingLeft: 0, paddingRight: 0 }}
                    >
                      <p className="mb-1 fw-bold">{ann.title}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{ann.date}</small>
                        {ann.priority === "High Priority" && (
                          <span className={`badge bg-danger`}>
                            {ann.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Meetings - uses recentMeetings */}
            <div className="col-lg-6 col-xl-6 col-12 mb-4">
              <div className="card shadow-sm p-4 h-100 border-0 rounded-4">
                <SectionTitle
                  title="Recent Meetings"
                  icon={<FaCalendarAlt />}
                  actionText="View All"
                  actionCount={recentMeetings.length} // DYNAMIC COUNT
                />
                <div
                  className="list-group list-group-flush"
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                  {recentMeetings.map((meeting, index) => (
                    <div
                      key={index}
                      className="list-group-item"
                      style={{ paddingLeft: 0, paddingRight: 0 }}
                    >
                      <p className="mb-0 fw-bold">{meeting.title}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{meeting.time}</small>
                        <span className={`badge bg-secondary`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;