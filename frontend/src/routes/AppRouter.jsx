import { lazyWithRetry as lazy } from '../utils/lazyWithRetry';
import { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import LibrarianLayout from '../layouts/LibrarianLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import PublicLayout from '../components/public/PublicLayout';
import ScrollToTop from '../components/common/ScrollToTop';

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

// Public Pages
const Home = lazy(() => import('../pages/public/Home'));
const LibrariesList = lazy(() => import('../pages/public/LibrariesList'));
const LibraryDetail = lazy(() => import('../pages/public/LibraryDetail'));
const BooksList = lazy(() => import('../pages/public/BooksList'));
const BookDetail = lazy(() => import('../pages/public/BookDetail'));
const CategoriesList = lazy(() => import('../pages/public/CategoriesList'));
const BecomeLibrarian = lazy(() => import('../pages/public/BecomeLibrarian'));

// Member Account Pages
const MemberBorrowings = lazy(() => import('../pages/member/MemberBorrowings'));
const MemberFavorites = lazy(() => import('../pages/member/MemberFavorites'));
const MemberNotifications = lazy(() => import('../pages/member/MemberNotifications'));
const MemberProfile = lazy(() => import('../pages/member/MemberProfile'));

// Librarian Portal Pages
const Dashboard = lazy(() => import('../pages/librarian/Dashboard'));
const LibraryPage = lazy(() => import('../pages/librarian/Library'));
const BooksPage = lazy(() => import('../pages/librarian/Books'));
const BookDetails = lazy(() => import('../pages/librarian/BookDetails'));
const CategoriesPage = lazy(() => import('../pages/librarian/Categories'));
const CategoryDetails = lazy(() => import('../pages/librarian/CategoryDetails'));
const BorrowRequestsPage = lazy(() => import('../pages/librarian/BorrowRequests'));
const BorrowRequestDetails = lazy(() => import('../pages/librarian/BorrowRequestDetails'));
const ReturnsPage = lazy(() => import('../pages/librarian/Returns'));
const ReturnDetails = lazy(() => import('../pages/librarian/ReturnDetails'));
const MembersPage = lazy(() => import('../pages/librarian/Members'));
const MemberDetails = lazy(() => import('../pages/librarian/MemberDetails'));
const SubscriptionPage = lazy(() => import('../pages/librarian/Subscription'));
const ReportsPage = lazy(() => import('../pages/librarian/Reports'));
const LibrarianProfile = lazy(() => import('../pages/librarian/LibrarianProfile'));
const LibrarianNotifications = lazy(() => import('../pages/librarian/LibrarianNotifications'));

// Admin Portal Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminLibraries = lazy(() => import('../pages/admin/AdminLibraries'));
const AdminLibraryDetails = lazy(() => import('../pages/admin/AdminLibraryDetails'));
const AdminLibrarians = lazy(() => import('../pages/admin/AdminLibrarians'));
const AdminLibrarianDetails = lazy(() => import('../pages/admin/AdminLibrarianDetails'));
const AdminMembers = lazy(() => import('../pages/admin/AdminMembers'));
const AdminMemberDetails = lazy(() => import('../pages/admin/AdminMemberDetails'));
const AdminSubscriptions = lazy(() => import('../pages/admin/AdminSubscriptions'));
const AdminSubscriptionDetails = lazy(() => import('../pages/admin/AdminSubscriptionDetails'));
const AdminPayments = lazy(() => import('../pages/admin/AdminPayments'));
const AdminPaymentDetails = lazy(() => import('../pages/admin/AdminPaymentDetails'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminProfile = lazy(() => import('../pages/admin/AdminProfile'));

const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AppRouter() {
  return (
    <HashRouter>
      <ScrollToTop />
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Unauthenticated Guest Auth Routes (Login & Register) */}
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth" element={<Login />} />
              </Route>
            </Route>

            {/* Public Catalogue & Website Routes (Guests & Members) */}
            <Route element={<ProtectedRoute publicWebsite={true} />}>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/libraries" element={<LibrariesList />} />
                <Route path="/libraries/:id" element={<LibraryDetail />} />
                <Route path="/books" element={<BooksList />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/categories" element={<CategoriesList />} />
                <Route path="/become-librarian" element={<BecomeLibrarian />} />
              </Route>
            </Route>

            {/* Member Only Account Routes */}
            <Route element={<ProtectedRoute allowedRoles={['member']} />}>
              <Route element={<PublicLayout />}>
                <Route path="/member" element={<Navigate to="/" replace />} />
                <Route path="/member/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/member/borrowings" element={<MemberBorrowings />} />
                <Route path="/member/favorites" element={<MemberFavorites />} />
                <Route path="/member/notifications" element={<MemberNotifications />} />
                <Route path="/member/profile" element={<MemberProfile />} />
              </Route>
            </Route>

            {/* Protected Librarian Workspace */}
            <Route element={<ProtectedRoute allowedRoles={['librarian']} />}>
              <Route element={<LibrarianLayout />}>
                <Route path="/librarian" element={<Dashboard />} />
                <Route path="/librarian/dashboard" element={<Navigate to="/librarian" replace />} />
                <Route path="/librarian/library" element={<LibraryPage />} />
                <Route path="/librarian/books" element={<BooksPage />} />
                <Route path="/librarian/books/:id" element={<BookDetails />} />
                <Route path="/librarian/categories" element={<CategoriesPage />} />
                <Route path="/librarian/categories/:id" element={<CategoryDetails />} />
                <Route path="/librarian/borrow-requests" element={<BorrowRequestsPage />} />
                <Route path="/librarian/borrow-requests/:id" element={<BorrowRequestDetails />} />
                <Route path="/librarian/returns" element={<ReturnsPage />} />
                <Route path="/librarian/returns/:id" element={<ReturnDetails />} />
                <Route path="/librarian/members" element={<MembersPage />} />
                <Route path="/librarian/members/:id" element={<MemberDetails />} />
                <Route path="/librarian/subscription" element={<SubscriptionPage />} />
                <Route path="/librarian/reports" element={<ReportsPage />} />
                <Route path="/librarian/notifications" element={<LibrarianNotifications />} />
                <Route path="/librarian/profile" element={<LibrarianProfile />} />
              </Route>
            </Route>

            {/* Protected Admin Portal */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/libraries" element={<AdminLibraries />} />
                <Route path="/admin/libraries/:id" element={<AdminLibraryDetails />} />
                <Route path="/admin/librarians" element={<AdminLibrarians />} />
                <Route path="/admin/librarians/:id" element={<AdminLibrarianDetails />} />
                <Route path="/admin/members" element={<AdminMembers />} />
                <Route path="/admin/members/:id" element={<AdminMemberDetails />} />
                <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/admin/subscriptions/:id" element={<AdminSubscriptionDetails />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/payments/:id" element={<AdminPaymentDetails />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </HashRouter>
  );
}
