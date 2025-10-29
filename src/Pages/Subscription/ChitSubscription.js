// import React, { useState, useEffect } from "react";
// import Sidebar from "../../Components/Sidebar";
// import TopNav from "../../Components/TopNav";
// import {
//   getSubscriptionChitListServ,
//   updateSubscriptionChitServ,
// } from "../../services/subscriptionChit.services";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import moment from "moment";
// import NoRecordFound from "../../Components/NoRecordFound";
// import { useNavigate } from "react-router-dom";

// function ChitSubscription() {
//   const [list, setList] = useState([]);
//   const [statics, setStatics] = useState(null);
//   const [showSkelton, setShowSkelton] = useState(false);
//   const [editFormData, setEditFormData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);


//   const navigate = useNavigate();

//   const [payload, setPayload] = useState({
//     searchKey: "",
//     status: "",
//     pageNo: 1,
//     pageCount: 10,
//     sortByField: "",
//   });

//   const handleGetSubscriptionChitFunc = async () => {
//     if (list.length === 0) setShowSkelton(true);
//     try {
//       let response = await getSubscriptionChitListServ(payload);
//       setList(response?.data?.data);
//       setStatics(response?.data?.documentCount);
//     } catch (error) {
//       toast.error("Failed to fetch subscription chits.");
//     }
//     setShowSkelton(false);
//   };

//   useEffect(() => {
//     handleGetSubscriptionChitFunc();
//   }, [payload]);

//   const handleUpdateSubscriptionChitFunc = async () => {
//     setIsLoading(true);
//     try {
//       let response = await updateSubscriptionChitServ(editFormData);
//       if (response?.data?.statusCode === 200) {
//         toast.success(response?.data?.message || "Updated successfully");
//         setEditFormData(null);
//         handleGetSubscriptionChitFunc();
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Internal Server Error");
//     }
//     setIsLoading(false);
//   };

//   const [totalPages, setTotalPages] = useState(1);
//   useEffect(() => {
//     if (statics?.totalCount && payload.pageCount) {
//       const pages = Math.ceil(statics.totalCount / payload.pageCount);
//       setTotalPages(pages);
//     }
//   }, [statics, payload.pageCount]);

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setPayload({ ...payload, pageNo: newPage });
//     }
//   };

//   return (
//     <div className="bodyContainer">
//       <Sidebar selectedMenu="Subscription" selectedItem="Chit Subscription" />
//       <div className="mainContainer">
//         <TopNav />
//         <div className="p-lg-4 p-md-3 p-2">
//           <div className="row m-0 p-0 d-flex align-items-center my-4 topActionForm">
//             <div className="col-lg-2 mb-2 col-md-12 col-12">
//               <h3 className="mb-0 text-bold text-secondary">
//                 Subscription Chits
//               </h3>
//             </div>
//             <div className="col-lg-4 mb-2 col-md-12 col-12">
//               <input
//                 className="form-control borderRadius24"
//                 placeholder="Search"
//                 onChange={(e) =>
//                   setPayload({ ...payload, searchKey: e.target.value })
//                 }
//               />
//             </div>
//             <div className="col-lg-3 mb-2 col-md-6 col-12">
//               <select
//                 className="form-control borderRadius24"
//                 onChange={(e) =>
//                   setPayload({ ...payload, status: e.target.value })
//                 }
//               >
//                 <option value="">Select Status</option>
//                 <option value={true}>Active</option>
//                 <option value={false}>Inactive</option>
//               </select>
//             </div>
//           </div>

//           <div className="mt-3">
//             <div className="card-body px-2">
//               <div className="table-responsive table-invoice">
//                 <table className="table">
//                   <thead>
//                     <tr style={{ background: "#F3F3F3", color: "#000" }}>
//                       <th className="text-center py-3">Sr. No</th>
//                       <th className="text-center py-3">Name</th>
//                       <th className="text-center py-3">User Name</th>
//                       <th className="text-center py-3">Price</th>
//                       <th className="text-center py-3">Start Date</th>
//                       <th className="text-center py-3">End Date</th>
//                       {/* <th className="text-center py-3">Paid Month</th> */}
//                       <th className="text-center py-3">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {showSkelton
//                       ? [...Array(10)].map((_, i) => (
//                           <tr key={i}>
//                             {[...Array(7)].map((_, j) => (
//                               <td className="text-center" key={j}>
//                                 <Skeleton />
//                               </td>
//                             ))}
//                           </tr>
//                         ))
//                       : list?.map((v, i) => (
//                           <tr key={v?._id}>
//                             <td className="text-center">
//                               {(payload.pageNo - 1) * payload.pageCount + i + 1}
//                             </td>
//                             <td className="text-center">{v?.name}</td>
//                             <td className="text-center">
//                               {v?.userId?.firstName} {v?.userId?.lastName}
//                             </td>
//                             <td className="text-center">{v?.totalAmount}</td>
//                             <td className="text-center">
//                               {v?.schemeStartDate
//                                 ? moment(v?.schemeStartDate).format("DD-MM-YY")
//                                 : "-"}
//                             </td>
//                             <td className="text-center">
//                               {v?.schemeEndDate
//                                 ? moment(v?.schemeEndDate).format("DD-MM-YY")
//                                 : "-"}
//                             </td>

//                             <td className="text-center">
//                             <button
//                                 className="btn btn-primary btn-sm mx-1"
//                                 onClick={() =>
//                                   navigate(`/subscription-details/${v?._id}`)
//                                 }
//                               >
//                                 View
//                               </button>
//                               {/* <button
//                                 className="btn btn-info btn-sm mx-1"
//                                 onClick={() =>
//                                   setEditFormData({
//                                     _id: v?._id,
//                                     name: v?.name,
//                                     totalAmount: v?.totalAmount,
//                                     monthlyAmount: v?.monthlyAmount,
//                                     totalMonths: v?.totalMonths,
//                                     schemeStartDate: v?.schemeStartDate
//                                       ? moment(v?.schemeStartDate).format(
//                                           "YYYY-MM-DD"
//                                         )
//                                       : "",
//                                     schemeEndDate: v?.schemeEndDate
//                                       ? moment(v?.schemeEndDate).format(
//                                           "YYYY-MM-DD"
//                                         )
//                                       : "",
//                                     status: v?.status,
//                                   })
//                                 }
//                               >
//                                 Edit
//                               </button> */}
//                             </td>
//                           </tr>
//                         ))}
//                   </tbody>
//                 </table>

//                 {list.length === 0 && !showSkelton && <NoRecordFound />}
//               </div>

//               {/* Pagination */}
//               <div className="d-flex justify-content-center mt-3">
//                 <nav>
//                   <ul className="pagination pagination-sm">
//                     <li
//                       className={`page-item ${
//                         payload.pageNo === 1 && "disabled"
//                       }`}
//                     >
//                       <button
//                         className="page-link"
//                         onClick={() => handlePageChange(payload.pageNo - 1)}
//                       >
//                         &lt;
//                       </button>
//                     </li>
//                     {[...Array(totalPages)].map((_, i) => (
//                       <li
//                         key={i}
//                         className={`page-item ${
//                           payload.pageNo === i + 1 && "active"
//                         }`}
//                       >
//                         <button
//                           className="page-link"
//                           onClick={() => handlePageChange(i + 1)}
//                         >
//                           {i + 1}
//                         </button>
//                       </li>
//                     ))}
//                     <li
//                       className={`page-item ${
//                         payload.pageNo === totalPages && "disabled"
//                       }`}
//                     >
//                       <button
//                         className="page-link"
//                         onClick={() => handlePageChange(payload.pageNo + 1)}
//                       >
//                         &gt;
//                       </button>
//                     </li>
//                   </ul>
//                 </nav>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Modal */}
//       {editFormData && (
//         <div
//           className="modal fade show d-flex align-items-center justify-content-center"
//           tabIndex="-1"
//         >
//           <div className="modal-dialog">
//             <div
//               className="modal-content"
//               style={{
//                 borderRadius: "16px",
//                 background: "#f7f7f5",
//                 width: "400px",
//               }}
//             >
//               <div className="d-flex justify-content-end pt-4 pb-0 px-4">
//                 <img
//                   src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
//                   style={{ height: "20px", cursor: "pointer" }}
//                   onClick={() => setEditFormData(null)}
//                 />
//               </div>

//               <div className="modal-body">
//                 <h5 className="mb-4">Edit Subscription Chit</h5>

//                 <label>Name</label>
//                 <input
//                   className="form-control"
//                   value={editFormData?.name}
//                   onChange={(e) =>
//                     setEditFormData({ ...editFormData, name: e.target.value })
//                   }
//                 />

//                 <label className="mt-3">Total Amount</label>
//                 <input
//                   className="form-control"
//                   type="number"
//                   value={editFormData?.totalAmount}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       totalAmount: e.target.value,
//                     })
//                   }
//                 />

//                 <label className="mt-3">Monthly Amount</label>
//                 <input
//                   className="form-control"
//                   type="number"
//                   value={editFormData?.monthlyAmount}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       monthlyAmount: e.target.value,
//                     })
//                   }
//                 />

//                 <label className="mt-3">Total Months</label>
//                 <input
//                   className="form-control"
//                   type="number"
//                   value={editFormData?.totalMonths}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       totalMonths: e.target.value,
//                     })
//                   }
//                 />

//                 <label className="mt-3">Start Date</label>
//                 <input
//                   className="form-control"
//                   type="date"
//                   value={editFormData?.schemeStartDate}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       schemeStartDate: e.target.value,
//                     })
//                   }
//                 />

//                 <label className="mt-3">End Date</label>
//                 <input
//                   className="form-control"
//                   type="date"
//                   value={editFormData?.schemeEndDate}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       schemeEndDate: e.target.value,
//                     })
//                   }
//                 />

//                 <button
//                   className="btn btn-success w-100 mt-4"
//                   onClick={!isLoading && handleUpdateSubscriptionChitFunc}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Saving..." : "Update"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       {editFormData && <div className="modal-backdrop fade show"></div>}
//     </div>
//   );
// }

// export default ChitSubscription;
