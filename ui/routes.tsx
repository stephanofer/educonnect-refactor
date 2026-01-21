import { createBrowserRouter } from "react-router";
import { PublicLayout, DashboardLayout, AdminLayout } from "@/ui/components/layout";
import { ProtectedRoute } from "@/ui/components/auth";
import HomePage from "@/ui/pages/HomePage";
import LoginPage from "@/ui/pages/LoginPage";
import RegisterPage from "@/ui/pages/RegisterPage";
import RegisterTutorPage from "@/ui/pages/RegisterTutorPage";
import PlanesPage from "@/ui/pages/PlanesPage";
import ParaTutoresPage from "@/ui/pages/ParaTutoresPage";
import AuthCallbackPage from "@/ui/pages/AuthCallbackPage";

// Student Dashboard Pages
import StudentDashboardHome from "@/ui/pages/dashboard/StudentDashboardHome";
import SearchTutorsPage from "@/ui/pages/dashboard/SearchTutorsPage";
import MySessionsPage from "@/ui/pages/dashboard/MySessionsPage";
import MaterialsPage from "@/ui/pages/dashboard/MaterialsPage";
import LibraryPage from "@/ui/pages/dashboard/LibraryPage";
import ProfesorChatPage from "@/ui/pages/dashboard/ProfesorChatPage";
import PlansPage from "@/ui/pages/dashboard/PlansPage";
import NotificationsPage from "@/ui/pages/dashboard/NotificationsPage";
import SettingsPage from "@/ui/pages/dashboard/SettingsPage";
import ProfilePage from "@/ui/pages/dashboard/ProfilePage";

// Tutor Dashboard Pages
import TutorDashboardHome from "@/ui/pages/dashboard/TutorDashboardHome";
import TutorSessionsPage from "@/ui/pages/tutor/TutorSessionsPage";
import TutorAvailabilityPage from "@/ui/pages/tutor/TutorAvailabilityPage";
import TutorEarningsPage from "@/ui/pages/tutor/TutorEarningsPage";
import TutorStudentsPage from "@/ui/pages/tutor/TutorStudentsPage";
import TutorReviewsPage from "@/ui/pages/tutor/TutorReviewsPage";

// Admin Pages
import AdminDashboardPage from "@/ui/pages/admin/AdminDashboardPage";
import AdminLibraryPage from "@/ui/pages/admin/AdminLibraryPage";

// Video Call Page
import VideoCallPage from "@/ui/pages/call/VideoCallPage";

export const router = createBrowserRouter([
  // Public routes with layout
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "planes",
        element: <PlanesPage />,
      },
      {
        path: "para-tutores",
        element: <ParaTutoresPage />,
      },
    ],
  },

  // Auth routes (no layout)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/registro",
    element: <RegisterPage />,
  },
  {
    path: "/registro-tutor",
    element: <RegisterTutorPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },

  // Protected routes - Student Dashboard
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["student", "admin"]}>
        <DashboardLayout role="student" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <StudentDashboardHome />,
      },
      {
        path: "buscar-tutores",
        element: <SearchTutorsPage />,
      },
      {
        path: "mis-sesiones",
        element: <MySessionsPage />,
      },
      {
        path: "materiales",
        element: <MaterialsPage />,
      },
      {
        path: "biblioteca",
        element: <LibraryPage />,
      },
      {
        path: "profesor-chat",
        element: <ProfesorChatPage />,
      },
      {
        path: "planes",
        element: <PlansPage />,
      },
      {
        path: "notificaciones",
        element: <NotificationsPage />,
      },
      {
        path: "configuracion",
        element: <SettingsPage />,
      },
      {
        path: "perfil",
        element: <ProfilePage />,
      },
    ],
  },

  // Protected routes - Tutor Dashboard
  {
    path: "/tutor",
    element: (
      <ProtectedRoute allowedRoles={["tutor", "admin"]}>
        <DashboardLayout role="tutor" />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <TutorDashboardHome />,
      },
      {
        path: "sesiones",
        element: <TutorSessionsPage />,
      },
      {
        path: "disponibilidad",
        element: <TutorAvailabilityPage />,
      },
      {
        path: "ganancias",
        element: <TutorEarningsPage />,
      },
      {
        path: "estudiantes",
        element: <TutorStudentsPage />,
      },
      {
        path: "resenas",
        element: <TutorReviewsPage />,
      },
      {
        path: "configuracion",
        element: <SettingsPage />,
      },
      {
        path: "perfil",
        element: <ProfilePage />,
      },
    ],
  },

  // Protected routes - Admin Dashboard
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "biblioteca",
        element: <AdminLibraryPage />,
      },
    ],
  },

  // Video Call - accessible by both students and tutors
  {
    path: "/sala/:sessionId",
    element: (
      <ProtectedRoute allowedRoles={["student", "tutor", "admin"]}>
        <VideoCallPage />
      </ProtectedRoute>
    ),
  },
]);
