import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";

// @mui icons
import Icon from "@mui/material/Icon";
import Users from "layouts/tables/Users";
import Vendors from "layouts/tables/vendors";
import DeliveryPartners from "layouts/tables/delivery-partner";
import Products from "layouts/tables/product";
import LabTests from "layouts/tables/labtest";
import Charges from "layouts/tables/charges";
import Coupons from "layouts/tables/Coupan";
import Banners from "layouts/tables/banner";
import Notifications from "layouts/notifications";
import QmNotifications from "layouts/tables/notification";
import Orders from "layouts/tables/Order";
import SendNotification from "layouts/tables/notification";
import Incentives from "layouts/tables/incentive";
import Policies from "layouts/tables/policy";
import Authors from "layouts/tables/author";
import ProductCategories from "layouts/tables/Productcategory";
import Commissions from "layouts/tables/commition";
import Packages from "layouts/tables/package";
import Reports from "layouts/tables/invoiceandreports";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>, // keep the default dashboard icon
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Author",
    key: "author",
    icon: <Icon fontSize="small">people</Icon>, // people icon for users
    route: "/author",
    component: <Authors />,
  },
  {
    type: "collapse",
    name: "User",
    key: "user",
    icon: <Icon fontSize="small">people</Icon>, // people icon for users
    route: "/user",
    component: <Users />,
  },
  {
    type: "collapse",
    name: "Vendor",
    key: "vendor",
    icon: <Icon fontSize="small">storefront</Icon>, // storefront icon for vendors
    route: "/vendor",
    component: <Vendors />,
  },
  {
    type: "collapse",
    name: "Delivery Partner",
    key: "dpartner",
    icon: <Icon fontSize="small">local_shipping</Icon>, // local_shipping icon for delivery partners
    route: "/delivery-partner",
    component: <DeliveryPartners />,
  },
  {
    type: "collapse",
    name: "ProductCategory",
    key: "ProductCategory",
    icon: <Icon fontSize="small">category</Icon>, // shopping_bag icon for products
    route: "/productcatogory",
    component: <ProductCategories />,
  },
  {
    type: "collapse",
    name: "Product",
    key: "Product",
    icon: <Icon fontSize="small">shopping_bag</Icon>, // shopping_bag icon for products
    route: "/product",
    component: <Products />,
  },
  {
    type: "collapse",
    name: "Commissions",
    key: "Commissions",
    icon: <Icon fontSize="small">attach_money</Icon>, // local_shipping icon for delivery partners
    route: "/comition",
    component: <Commissions />,
  },
  {
    type: "collapse",
    name: "Package",
    key: "Package",
    icon: <Icon fontSize="small">inventory</Icon>, // local_shipping icon for delivery partners
    route: "/package",
    component: <Packages />,
  },
  {
    type: "collapse",
    name: "Order",
    key: "order",
    icon: <Icon fontSize="small">assignment</Icon>, // assignment icon for orders
    route: "/order",
    component: <Orders />,
  },
  {
    type: "collapse",
    name: "Report",
    key: "Report",
    icon: <Icon fontSize="small">assignment</Icon>, // assignment icon for orders
    route: "/report",
    component: <Reports />,
  },
  {
    type: "collapse",
    name: "Lab Test",
    key: "labtest",
    icon: <Icon fontSize="small">local_hospital</Icon>, // local_hospital icon for lab tests
    route: "/labtest",
    component: <LabTests />,
  },
  {
    type: "collapse",
    name: "Charges",
    key: "charges",
    icon: <Icon fontSize="small">account_balance_wallet</Icon>, // account_balance_wallet icon for charges
    route: "/charges",
    component: <Charges />,
  },
  {
    type: "collapse",
    name: "Coupon",
    key: "coupon",
    icon: <Icon fontSize="small">card_giftcard</Icon>, // card_giftcard icon for coupons
    route: "/coupon",
    component: <Coupons />,
  },
  {
    type: "collapse",
    name: "Banner",
    key: "banner",
    icon: <Icon fontSize="small">image</Icon>, // image icon for banners
    route: "/banner",
    component: <Banners />,
  },
  {
    type: "collapse",
    name: "Notification",
    key: "notification",
    icon: <Icon fontSize="small">notifications</Icon>, // notifications icon for notifications
    route: "/send-notification",
    component: <SendNotification />,
  },
  {
    type: "collapse",
    name: "Incentive",
    key: "incentive",
    icon: <Icon fontSize="small">emoji_events</Icon>, // emoji_events icon for incentives
    route: "/incentive",
    component: <Incentives />,
  },
  {
    type: "collapse",
    name: "Policies",
    key: "policies",
    icon: <Icon fontSize="small">policy</Icon>, // policy icon for policies
    route: "/policies",
    component: <Policies />,
  },
  {
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
