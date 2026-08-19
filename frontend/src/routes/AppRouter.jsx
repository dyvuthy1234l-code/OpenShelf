import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import LibrarianLayout from '../layouts/LibrarianLayout';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

// Website Layout
import PublicLayout from '../components/public/PublicLayout';

// Public Pages
import Home from '../pages/public/Home';
import LibrariesList from '../pages/public/LibrariesList';
import LibraryDetail from '../pages/public/LibraryDetail';
import BooksList from '../pages/public/BooksList';
import BookDetail from '../pages/public/BookDetail';
import CategoriesList from '../pages/public/CategoriesList';
import BecomeLibrarian from '../pages/public/BecomeLibrarian';

// Member Account Pages
import MemberBorrowings from '../pages/member/MemberBorrowings';
import MemberFavorites from '../pages/member/MemberFavorites';
import MemberNotifications from '../pages/member/MemberNotifications';
import MemberProfile from '../pages/member/MemberProfile';

// Librarian Portal Pages
import Dashboard from '../pages/librarian/Dashboard';
import LibraryPage from '../pages/librarian/Library';
import BooksPage from '../pages/librarian/Books';
import BookDetails from '../pages/librarian/BookDetails';
import CategoriesPage from '../pages/librarian/Categories';
import CategoryDetails from '../pages/librarian/CategoryDetails';
import BorrowRequestsPage from '../pages/librarian/BorrowRequests';
import BorrowRequestDetails from '../pages/librarian/BorrowRequestDetails';
import ReturnsPage from '../pages/librarian/Returns';
import ReturnDetails from '../pages/librarian/ReturnDetails';
import MembersPage from '../pages/librarian/Members';
import MemberDetails from '../pages/librarian/MemberDetails';
import SubscriptionPage from '../pages/librarian/Subscription';
import ReportsPage from '../pages/librarian/Reports';
import LibrarianProfile from '../pages/librarian/LibrarianProfile';
import LibrarianNotifications from '../pages/librarian/LibrarianNotifications';

// Admin Portal Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLibraries from '../pages/admin/AdminLibraries';
import AdminLibraryDetails from '../pages/admin/AdminLibraryDetails';
import AdminLibrarians from '../pages/admin/AdminLibrarians';
import AdminLibrarianDetails from '../pages/admin/AdminLibrarianDetails';
import AdminMembers from '../pages/admin/AdminMembers';
import AdminMemberDetails from '../pages/admin/AdminMemberDetails';
import AdminSubscriptions from '../pages/admin/AdminSubscriptions';
import AdminSubscriptionDetails from '../pages/admin/AdminSubscriptionDetails';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminPaymentDetails from '../pages/admin/AdminPaymentDetails';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminProfile from '../pages/admin/AdminProfile';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Unauthenticated Guest Auth Routes (Login & Register) */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}
