import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Skeleton } from './components/ui/Skeleton';

// Public pages (eager)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';

// App pages (lazy — only loaded after auth)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const GuestsPage = lazy(() => import('./pages/GuestsPage'));
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const VendorsPage = lazy(() => import('./pages/VendorsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const SeatingPage = lazy(() => import('./pages/SeatingPage'));
const InspirationPage = lazy(() => import('./pages/InspirationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected app shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/guests"
          element={
            <Suspense fallback={<PageLoader />}>
              <GuestsPage />
            </Suspense>
          }
        />
        <Route
          path="/budget"
          element={
            <Suspense fallback={<PageLoader />}>
              <BudgetPage />
            </Suspense>
          }
        />
        <Route
          path="/vendors"
          element={
            <Suspense fallback={<PageLoader />}>
              <VendorsPage />
            </Suspense>
          }
        />
        <Route
          path="/tasks"
          element={
            <Suspense fallback={<PageLoader />}>
              <TasksPage />
            </Suspense>
          }
        />
        <Route
          path="/seating"
          element={
            <Suspense fallback={<PageLoader />}>
              <SeatingPage />
            </Suspense>
          }
        />
        <Route
          path="/inspiration"
          element={
            <Suspense fallback={<PageLoader />}>
              <InspirationPage />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
