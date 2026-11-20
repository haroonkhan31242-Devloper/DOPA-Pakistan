import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import {
  AboutPage,
  ContactPage,
  FaqPage,
  PrivacyPage,
  ServicesPage,
  TermsPage,
  UniversitiesPage,
} from './pages/InfoPages';
import { ArticleDetailPage, ResourcesPage } from './pages/ArticlesPages';
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from './pages/AuthPages';
import { DopaAssociationPage, VerifyMemberPage } from './pages/DopaAssociationPages';
import {
  CartPage,
  CheckoutPage,
  OrderSuccessPage,
  ProductDetailPage,
  ShopPage,
} from './pages/ShopPages';
import {
  PharmaciesPage,
  PharmacyProfilePage,
  PharmacyRegisterPage,
} from './pages/PharmaciesPages';
import { PharmacyDashboardPage } from './pages/PharmacyDashboardPage';
import { RequestMedicinePage } from './pages/RequestMedicinePage';
import {
  MaterialDetailPage,
  RawMaterialsPage,
  SellRawMaterialsPage,
  SellerDashboardPage,
} from './pages/RawMaterialsPages';
import { JobDetailPage, JobsPage, PostJobPage } from './pages/JobsPages';
import {
  LifePartnerBrowsePage,
  LifePartnerDetailPage,
  LifePartnerLandingPage,
  LifePartnerPaymentPage,
  LifePartnerProfilePage,
  LifePartnerRequestsPage,
} from './pages/LifePartnerPages';
import { CommunityPage, VideosPage } from './pages/CommunityVideosPages';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            {/* M3 Home */}
            <Route path="/" element={<HomePage />} />

            {/* M4 Informational Pages */}
            <Route path="/about/" element={<AboutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services/" element={<ServicesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/universities/" element={<UniversitiesPage />} />
            <Route path="/universities" element={<UniversitiesPage />} />
            <Route path="/faq/" element={<FaqPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact/" element={<ContactPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy/" element={<PrivacyPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms/" element={<TermsPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* M5 Articles & News */}
            <Route path="/resources/" element={<ResourcesPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/category/:slug/" element={<ResourcesPage />} />
            <Route path="/category/:slug" element={<ResourcesPage />} />

            {/* M2 Auth */}
            <Route path="/register/" element={<RegisterPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password/" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/" element={<ResetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* M6 DOPA Association */}
            <Route path="/dopa-association/" element={<DopaAssociationPage />} />
            <Route path="/dopa-association" element={<DopaAssociationPage />} />
            <Route path="/verify-member/" element={<VerifyMemberPage />} />
            <Route path="/verify-member" element={<VerifyMemberPage />} />

            {/* M7 Shop, Cart, Checkout */}
            <Route path="/shop/" element={<ShopPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug/" element={<ProductDetailPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart/" element={<CartPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/" element={<CheckoutPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />

            {/* M8 & M9 Pharmacies & Pharmacy Dashboard */}
            <Route path="/pharmacies/" element={<PharmaciesPage />} />
            <Route path="/pharmacies" element={<PharmaciesPage />} />
            <Route path="/pharmacy/" element={<PharmacyProfilePage />} />
            <Route path="/pharmacy" element={<PharmacyProfilePage />} />
            <Route path="/pharmacy-register/" element={<PharmacyRegisterPage />} />
            <Route path="/pharmacy-register" element={<PharmacyRegisterPage />} />
            <Route path="/pharmacy-dashboard/*" element={<PharmacyDashboardPage />} />

            {/* M10 Medicine Request */}
            <Route path="/request-medicine/" element={<RequestMedicinePage />} />
            <Route path="/request-medicine" element={<RequestMedicinePage />} />

            {/* M11 Raw Materials */}
            <Route path="/raw-materials/" element={<RawMaterialsPage />} />
            <Route path="/raw-materials" element={<RawMaterialsPage />} />
            <Route path="/raw-materials/:slug/" element={<MaterialDetailPage />} />
            <Route path="/raw-materials/:slug" element={<MaterialDetailPage />} />
            <Route path="/sell-raw-materials/" element={<SellRawMaterialsPage />} />
            <Route path="/sell-raw-materials" element={<SellRawMaterialsPage />} />
            <Route path="/seller-dashboard/*" element={<SellerDashboardPage />} />

            {/* M12 Jobs */}
            <Route path="/jobs/" element={<JobsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:slug/" element={<JobDetailPage />} />
            <Route path="/jobs/:slug" element={<JobDetailPage />} />
            <Route path="/post-job/" element={<PostJobPage />} />
            <Route path="/post-job" element={<PostJobPage />} />

            {/* M13 Life Partner */}
            <Route path="/life-partner/" element={<LifePartnerLandingPage />} />
            <Route path="/life-partner" element={<LifePartnerLandingPage />} />
            <Route path="/life-partner/profile/" element={<LifePartnerProfilePage />} />
            <Route path="/life-partner/profile" element={<LifePartnerProfilePage />} />
            <Route path="/life-partner/payment/" element={<LifePartnerPaymentPage />} />
            <Route path="/life-partner/payment" element={<LifePartnerPaymentPage />} />
            <Route path="/life-partner/browse/" element={<LifePartnerBrowsePage />} />
            <Route path="/life-partner/browse" element={<LifePartnerBrowsePage />} />
            <Route path="/life-partner/requests/" element={<LifePartnerRequestsPage />} />
            <Route path="/life-partner/requests" element={<LifePartnerRequestsPage />} />
            <Route path="/life-partner/:id" element={<LifePartnerDetailPage />} />

            {/* M14 & M15 Community & Videos */}
            <Route path="/community/" element={<CommunityPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/post/:id" element={<CommunityPage />} />
            <Route path="/videos/" element={<VideosPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/videos/:id" element={<VideosPage />} />

            {/* M16 Account */}
            <Route path="/account/*" element={<AccountPage />} />

            {/* M17 Admin */}
            <Route path="/admin/*" element={<AdminPage />} />

            {/* Single Article Slug (with 404 fallback inside ArticleDetailPage) */}
            <Route path="/:articleSlug/" element={<ArticleDetailPage />} />
            <Route path="/:articleSlug" element={<ArticleDetailPage />} />
            <Route path="*" element={<ArticleDetailPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
