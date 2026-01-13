import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App'
import AppsPage from './pages/AppsPage'
import AppDetailPage from './pages/AppDetailPage'
import LoginPage from './pages/LoginPage'
import UsersTab from './pages/tabs/UsersTab'
import EmailTemplatesTab from './pages/tabs/EmailTemplatesTab'
import PlansTab from './pages/tabs/PlansTab'
import OrganizationsTab from './pages/tabs/OrganizationsTab'
import StorageTab from './pages/tabs/StorageTab'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<App />}>
          <Route index element={<AppsPage />} />
          <Route path="apps/:appId" element={<AppDetailPage />}>
            {/* Default redirect to users */}
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UsersTab />} />
            <Route path="emails" element={<EmailTemplatesTab />} />
            <Route path="plans" element={<PlansTab />} />
            <Route path="orgs" element={<OrganizationsTab />} />
            <Route path="storage" element={<StorageTab />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
