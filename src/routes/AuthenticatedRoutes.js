import React from 'react';
import {Route, Routes} from "react-router-dom"
import Dashboard from '../Pages/Dashboard/Dashboard';
import CategoriesList from '../Pages/Category/CategoriesList';
import SubCategoriesList from '../Pages/Category/SubCategoryList';
import BrandsList from '../Pages/Brand/BrandsList';
import AttributeSetList from '../Pages/Attribute/AttributeSetList';
import AttributeList from '../Pages/Attribute/AttributeList';
import BannerList from '../Pages/Banner/BannerList';
import TagList from '../Pages/Tag/TagList';
import ProductTypeList from '../Pages/Product/ProductTypeList';
import TaxList from '../Pages/Tax/TaxList';
import ProductManufactureLocactionList from '../Pages/Product/ProductManufactureLocationList';
import ProductList from '../Pages/Product/ProductList';
import AddProduct from '../Pages/Product/AddProduct';
import UserFaq from '../Pages/Support/Faq/UserFaq';
import UserTermsAndCondition from '../Pages/Support/TermsAndCondition/UserTermsAndCondition';
import ProductUpdateStep2 from '../Pages/Product/ProductUpdateStep2';
import ProductUpdateStep3 from '../Pages/Product/ProductUpdateStep3';
import NotificationList from '../Pages/Notification/NotificationList';
import ProductUpdateAttribute from '../Pages/Product/ProductUpdateAtrribute';
// import RoleList from '../Pages/CommandCenter/RoleList';
import PermissionList from '../Pages/CommandCenter/PermissionList';
import AdminList from '../Pages/CommandCenter/AdminList';
import UserPrivacyPolicy from '../Pages/Support/PrivacyPolicy/UserPrivacyPolicy';
import ContactQueryList from '../Pages/Support/Contact/ContactQueryList';
import UserTicketList from '../Pages/SupportTickets/UserTicketList';
import TicketCategoryList from '../Pages/SupportTickets/TicketCategoryList';
import ChatBox from '../Pages/SupportTickets/ChatBox';
import ProductApproval from '../Pages/Product/ProductApproval';
import UserCookiePolicy from '../Pages/Support/CookiePolicy/UserCookiePolicy';
import UserShippingPolicy from '../Pages/Support/ShippingPolicy/ShippingPolicy';
import UserRefundAndReturn from '../Pages/Support/RefundAndReturn/RefundAndReturn';
import ProductUpdateStep1 from '../Pages/Product/ProductUpdateStep1';
import OrderList from '../Pages/Order/OrderList';
import AddComboProduct from '../Pages/Product/ComboProduct/AddComboProduct';
import ComboProductList from '../Pages/Product/ComboProduct/ComboProductList';
import ComboProductUpdateStep1 from '../Pages/Product/ComboProduct/ComboProductUpdateStep1';
import ComboProductUpdateStep2 from '../Pages/Product/ComboProduct/ComboProductUpdateStep2';
import ComboProductUpdateStep3 from '../Pages/Product/ComboProduct/ComboProductUpdateStep3';
import BulkOrderList from '../Pages/Order/BulkOrderList';
import UserList from '../Pages/User/UserList';
import VendorList from '../Pages/Vendor/VendorList';
import OrderDetails from '../Pages/Order/OrderDetails';
import StateList from '../Pages/Location/StateList';
import CityList from '../Pages/Location/CityList';
import OrderInvoice from '../Pages/Order/OrderInvoice';
import ProductDetails from '../Pages/Product/ProuctDetails';
import PincodeList from '../Pages/Location/PinCodeList';
import AreaList from '../Pages/Location/AreaList';
import BulkUpload from '../Pages/Location/BulkUpload';
import Scheme from '../Pages/Subscription/Scheme';
// import ChitSubscription from '../Pages/Subscription/ChitSubscription';
import SubscriptionChitDetails from '../Pages/Subscription/SubscriptionDetails';
import SubscriptionChitUsersList from '../Pages/Subscription/SubscriptionChitUsersList';
import PremiumCustomerList from '../Pages/User/PremiumCutomerList';
import RolesList from '../Pages/User/Role';
import BranchList from '../Pages/HR Management/Branches';
import DepartmentList from '../Pages/HR Management/Department';
import DesignationList from '../Pages/HR Management/Designation';
import DocumentTypeList from '../Pages/HR Management/DocumentType';
import EmployeeList from '../Pages/HR Management/Employee';
import CreateEmployee from '../Pages/HR Management/CreateEmployee';
import EditEmployee from '../Pages/HR Management/EditEmployee';
import AwardTypeList from '../Pages/HR Management/AwardType';
import AwardList from '../Pages/HR Management/AwardList';
import LeaveType from '../Pages/LeaveManagement/LeaveType';
import LeavePolicies from '../Pages/LeaveManagement/LeavePolicies';
import LeaveApplicationList from '../Pages/LeaveManagement/LeaveApplicationList';
import LeaveBalance from '../Pages/LeaveManagement/LeaveBalance';
import Shifts from '../Pages/Attendance/Shifts';
import AttendancePolicy from '../Pages/Attendance/AttendancePolicy';
import AttendanceRecord from '../Pages/Attendance/AttendanceRecord';
import AttendanceRegularization from '../Pages/Attendance/AttendanceRegularization';
import LoanCollection from '../Pages/Collection/LoanCollection';


function AuthenticatedRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Dashboard/>}/>

        {/* categories  */}
        <Route path="/category-list" element={<CategoriesList/>}/>
        <Route path="/sub-category-list" element={<SubCategoriesList/>}/>

        {/* attribute */}
        <Route path="/attribute-set-list" element={<AttributeSetList/>}/>
        <Route path="/attribute-list" element={<AttributeList/>}/>

        {/* brand */}
        <Route path="/brand-list" element={<BrandsList/>}/>

        {/* Banner */}
        <Route path="/banner-list" element={<BannerList/>}/>

        {/* tag */}
        <Route path="/tag-list" element={<TagList/>}/>

         {/* tax */}
         <Route path="/tax-list" element={<TaxList/>}/>


        {/* product type  */}
        <Route path="/product-type-list" element={<ProductTypeList/>}/>

        {/* product manufacture  */}
        <Route path="/product-manufacture-location-list" element={<ProductManufactureLocactionList/>}/>

        {/* product   */}
        <Route path="/product-list" element={<ProductList/>}/>
        <Route path="/add-product" element={<AddProduct/>}/>
        <Route path="/product-approval/:id" element={<ProductApproval/>}/>
        <Route path="/update-product-step1/:id" element={<ProductUpdateStep1/>}/>
        <Route path="/update-product-step2/:id" element={<ProductUpdateStep2/>}/>
        <Route path="/update-product-step3/:id" element={<ProductUpdateStep3/>}/>
        <Route path="/update-product-attributes/:id" element={<ProductUpdateAttribute/>}/>
        <Route path="/product-details/:id" element={<ProductDetails/>}/>

        
        {/* support */}
        <Route path="/faq-user-list" element={<UserFaq/>}/>
        <Route path="/contact-query" element={<ContactQueryList/>}/>
        
        {/* notification */}
        <Route path="/notification-list" element={<NotificationList/>}/>
        
        {/* command center */}
        {/* <Route path="/role-list" element={<RoleList/>}/> */}
        <Route path="/permission-list" element={<PermissionList/>}/>
        <Route path="/admin-list" element={<AdminList/>}/>
        
        {/* support ticket */}
        <Route path="/user-ticket-list" element={<UserTicketList/>}/>
        <Route path="/ticket-category-list" element={<TicketCategoryList/>}/>
        <Route path="/chat-box/:id" element={<ChatBox/>}/>

        {/* order */}
        <Route path="/order-list" element={<OrderList />}/>
        <Route path="/bulk-order-list" element={<BulkOrderList />}/>
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:status" element={<OrderList />} />
        <Route path="/order-details/:id" element={<OrderDetails />} />
        <Route path="/order-invoice/:id" element={<OrderInvoice />} />

        {/* Policy */}
        <Route path='/user-cookie-policy' element={<UserCookiePolicy />} />
        <Route path="/user-terms-condition" element={<UserTermsAndCondition/>}/>
        <Route path="/user-privacy-policy" element={<UserPrivacyPolicy/>}/>
        <Route path="/user-shipping-policy" element={<UserShippingPolicy />}/>
        <Route path="/user-refund-return" element={<UserRefundAndReturn />}/>

        {/* Combo Product  */}
        <Route path='/add-combo-product' element={<AddComboProduct />} />
        <Route path='/combo-product-list' element={<ComboProductList />} />
        <Route path="/update-combo-product-step1/:id" element={<ComboProductUpdateStep1/>}/>
        <Route path="/update-combo-product-step2/:id" element={<ComboProductUpdateStep2/>}/>
        <Route path="/update-combo-product-step3/:id" element={<ComboProductUpdateStep3/>}/>

        {/* user routes */}
        <Route path="/user-list" element={<UserList/>}/>
        <Route path="/role-list" element={<RolesList/>}/>
        <Route path='/premium-user' element={<PremiumCustomerList />} />

        {/* vendor routes  */}
        <Route path='/vendor-list' element={<VendorList />} />

        {/* location list  */}
        <Route path='/state-list' element={<StateList />} />
        <Route path='/city-list' element={<CityList />} />
        <Route path='/pin-code' element={<PincodeList />} />
        <Route path='/area' element={<AreaList />} />
        <Route path='/bulk-upload' element={<BulkUpload />} />

        {/* Subscription Chit  */}
        {/* <Route path='/subscription' element={<ChitSubscription />} /> */}
        <Route path='/subscription-details/:id' element={<SubscriptionChitDetails />} />
        <Route path='/scheme' element={<Scheme />} />
        <Route path='/subscription-user' element={<SubscriptionChitUsersList />} />

        {/* HR management  */}
        <Route path='/branch-list' element={<BranchList />} />
        <Route path='/department-list' element={<DepartmentList />} />
        <Route path='/designation-list' element={<DesignationList />} />
        <Route path='/document-type' element={<DocumentTypeList />} />
        <Route path='/employee-list' element={<EmployeeList />} />
        <Route path='/create-employee' element={<CreateEmployee />} />
        <Route path='/edit-employee/:id' element={<EditEmployee />} />
        <Route path='/award-type' element={<AwardTypeList />} />
        <Route path='/award-list' element={<AwardList />} />

        {/* Leave Management  */}
        <Route path='/leave-type' element={<LeaveType />} />
        <Route path='/leave-policy' element={<LeavePolicies />} />
        <Route path='/leave-application' element={<LeaveApplicationList />} />
        <Route path='/leave-balance' element={<LeaveBalance />} />

        {/* Attendance Management  */}
        <Route path='/shift' element={<Shifts />} />
        <Route path='/attendance-policy' element={<AttendancePolicy />} />
        <Route path='/attendance-record' element={<AttendanceRecord />} />
        <Route path='/attendance-regularization' element={<AttendanceRegularization />} />

        {/* loan Collection  */}
        <Route path='/collection' element={<LoanCollection />} />
    </Routes>
  )
}

export default AuthenticatedRoutes