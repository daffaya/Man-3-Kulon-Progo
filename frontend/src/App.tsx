import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { Outlet } from "react-router-dom";
// import "./i18n";

// Pages
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import ArticlePage from "./pages/ArticlePage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NewArticlePage from "./pages/admin/NewArticlePage";
import EditArticlePage from "./pages/admin/EditArticlePage";
import LoginPage from "./pages/auth/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import WebAppPage from "./pages/WebAppPage";

const AdminLayout = () => (
  <ProtectedRoute>
    <Outlet />{" "}
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <ArticleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
            <Route path="/Profile" element={<ProfilePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/webApp" element={<WebAppPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/atmin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />{" "}
              <Route path="new" element={<NewArticlePage />} />
              <Route path="edit/:id" element={<EditArticlePage />} />
              <Route path="category" element={<AdminCategoriesPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ArticleProvider>
    </ThemeProvider>
  );
}

export default App;
