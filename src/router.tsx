import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ReturnPolicy from "./pages/ReturnPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import FAQ from "./pages/FAQ";
import { RequireAuth, RequireAdmin } from "./components/RouteGuards";
import AdminLayout from "./pages/admin/AdminLayout";
import TemplatesList from "./pages/admin/TemplatesList";
import NewTemplate from "./pages/admin/NewTemplate";
import EditTemplate from "./pages/admin/EditTemplate";
import ContactMessages from "./pages/admin/ContactMessages";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentsPage from "@/pages/admin/PaymentsPage";


export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/return-policy",
      element: <ReturnPolicy />,
    },
    {
      path: "/refund-policy",
      element: <RefundPolicy />,
    },
    {
      path: "/privacy-policy",
      element: <PrivacyPolicy />,
    },
    {
      path: "/terms",
      element: <TermsOfUse />,
    },
    {
      path: "/contact",
      element: <Contact />,
    },
    {
      path: "/cart",
      element: <Cart />,
    },
    {
      path: "/checkout",
      element: <Checkout />,
    },
    {
      path: "/faq",
      element: <FAQ />,
    },
    {
      element: <RequireAuth />,
      children: [
        {
          element: <RequireAdmin />,
          children: [
            {
              path: "/admin",
              element: <AdminLayout />,
              children: [
                { index: true, element: <TemplatesList /> },
                { path: "templates", element: <TemplatesList /> },
                { path: "templates/new", element: <NewTemplate /> },
                { path: "templates/:id/edit", element: <EditTemplate /> },
                { path: "payments", element: <PaymentsPage /> },
                { path: "contact", element: <ContactMessages /> },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]
);