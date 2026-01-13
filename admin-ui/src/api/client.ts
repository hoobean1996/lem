const API_BASE = 'http://localhost:8000/admin/api';
const ADMIN_BASE = 'http://localhost:8000/admin';

// Helper for cross-origin fetch with credentials
const fetchApi = (url: string, options?: RequestInit) =>
  fetch(url, { ...options, credentials: 'include' });

export interface App {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  device_id: string | null;
  last_login_at: string | null;
}

export interface UserApp {
  user_id: number;
  app_id: number;
  enabled_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  status: string;
  plan: Plan | null;
}

export interface Plan {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  price_cents: number;
  currency?: string;
  billing_interval?: 'monthly' | 'yearly' | 'lifetime';
  stripe_price_id?: string | null;
  features?: string | null;
  is_active?: boolean;
  is_default?: boolean;
  created_at?: string;
}

export interface PlanCreate {
  name: string;
  slug: string;
  description?: string | null;
  price_cents?: number;
  currency?: string;
  billing_interval?: 'monthly' | 'yearly' | 'lifetime';
  stripe_price_id?: string | null;
  features?: string | null;
  is_default?: boolean;
}

export interface PlanUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  price_cents?: number;
  currency?: string;
  billing_interval?: 'monthly' | 'yearly' | 'lifetime';
  stripe_price_id?: string | null;
  features?: string | null;
  is_default?: boolean;
  is_active?: boolean;
}

export interface ShenbiProfile {
  id: number;
  user_id: number;
  role: string;
  display_name: string | null;
  grade: string | null;
  age: number | null;
}

export interface AppUser {
  user: User;
  user_app: UserApp;
  subscription: Subscription | null;
  shenbi_profile: ShenbiProfile | null;
}

export interface AdminUser {
  email: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  description: string | null;
  subject: string;
  variables: string[] | null;
}

export interface EmailTemplateDetail extends EmailTemplate {
  body_html: string;
  body_text: string | null;
}

export interface EmailTemplateCreate {
  name: string;
  description?: string | null;
  subject: string;
  body_html: string;
  body_text?: string | null;
  variables?: string[] | null;
}

export interface EmailTemplateUpdate {
  description?: string | null;
  subject?: string;
  body_html?: string;
  body_text?: string | null;
  variables?: string[] | null;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  member_count: number;
  created_at: string;
}

export interface OrganizationCreate {
  name: string;
  slug: string;
  description?: string | null;
}

export interface OrganizationUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
}

export interface StorageFile {
  path: string;
  filename: string;
  size: number;
  content_type: string | null;
  created: string | null;
  updated: string | null;
}

export const api = {
  // Apps
  async getApps(): Promise<App[]> {
    const res = await fetchApi(`${API_BASE}/apps`);
    if (!res.ok) throw new Error('Failed to fetch apps');
    const data = await res.json();
    return data.apps;
  },

  async getApp(appId: number): Promise<App> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}`);
    if (!res.ok) throw new Error('Failed to fetch app');
    return res.json();
  },

  // Users
  async getAppUsers(appId: number): Promise<{ users: AppUser[]; is_shenbi_app: boolean; active_count: number; paid_count: number }> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async updateShenbiRole(appId: number, userId: number, role: string): Promise<void> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/users/${userId}/shenbi-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update role');
    }
  },

  async generateToken(appId: number, userId: number): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/users/${userId}/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to generate token');
    }
    return res.json();
  },

  async resetProgress(appId: number, userId: number): Promise<{ success: boolean; progress_deleted: number; achievements_deleted: number }> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/users/${userId}/reset-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to reset progress');
    }
    return res.json();
  },

  async sendEmail(appId: number, userId: number, subject: string, body: string): Promise<void> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/users/${userId}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to send email');
    }
  },

  async sendTemplateEmail(appId: number, userId: number, templateName: string, variables: Record<string, string>): Promise<void> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/users/${userId}/send-template-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_name: templateName, variables }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to send email');
    }
  },

  // Email Templates
  async getEmailTemplates(appId: number): Promise<EmailTemplate[]> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/email-templates`);
    if (!res.ok) throw new Error('Failed to fetch email templates');
    const data = await res.json();
    return data.templates;
  },

  async getEmailTemplate(appId: number, templateId: number): Promise<EmailTemplateDetail> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/email-templates/${templateId}`);
    if (!res.ok) throw new Error('Failed to fetch email template');
    return res.json();
  },

  async createEmailTemplate(appId: number, data: EmailTemplateCreate): Promise<{ id: number }> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/email-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create email template');
    }
    return res.json();
  },

  async updateEmailTemplate(appId: number, templateId: number, data: EmailTemplateUpdate): Promise<void> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/email-templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update email template');
    }
  },

  async deleteEmailTemplate(appId: number, templateId: number): Promise<void> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/email-templates/${templateId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to delete email template');
    }
  },

  // Plans
  async getPlans(appId: number): Promise<Plan[]> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/plans`);
    if (!res.ok) throw new Error('Failed to fetch plans');
    const data = await res.json();
    return data.plans;
  },

  async createPlan(appId: number, data: PlanCreate): Promise<{ id: number }> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create plan');
    }
    return res.json();
  },

  async updatePlan(appId: number, planId: number, data: PlanUpdate): Promise<void> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/plans/${planId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update plan');
    }
  },

  async deletePlan(appId: number, planId: number): Promise<void> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/plans/${planId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to delete plan');
    }
  },

  // Organizations
  async getOrganizations(appId: number): Promise<Organization[]> {
    const res = await fetchApi(`${API_BASE}/apps/${appId}/organizations`);
    if (!res.ok) throw new Error('Failed to fetch organizations');
    const data = await res.json();
    return data.organizations;
  },

  async createOrganization(appId: number, data: OrganizationCreate): Promise<{ id: number }> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create organization');
    }
    return res.json();
  },

  async updateOrganization(appId: number, orgId: number, data: OrganizationUpdate): Promise<void> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/organizations/${orgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update organization');
    }
  },

  async toggleOrganizationStatus(appId: number, orgId: number): Promise<{ is_active: boolean }> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/organizations/${orgId}/toggle-status`, {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to toggle organization status');
    }
    return res.json();
  },

  async deleteOrganization(appId: number, orgId: number): Promise<void> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/organizations/${orgId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to delete organization');
    }
  },

  // Storage
  async getStorageFiles(appId: number, folder: string = 'shared'): Promise<StorageFile[]> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/storage/files?folder=${encodeURIComponent(folder)}`);
    if (!res.ok) throw new Error('Failed to fetch storage files');
    const data = await res.json();
    return data.files;
  },

  async uploadFile(appId: number, file: File, folder: string = 'shared'): Promise<StorageFile> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/storage/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to upload file');
    }
    return res.json();
  },

  async getSignedUrl(appId: number, path: string): Promise<{ url: string; expires_in_minutes: number }> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/storage/signed-url?path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to get signed URL');
    }
    return res.json();
  },

  async deleteStorageFile(appId: number, path: string): Promise<void> {
    const res = await fetchApi(`${ADMIN_BASE}/apps/${appId}/storage/file?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to delete file');
    }
  },

  // Auth
  async getAdminUser(): Promise<AdminUser | null> {
    const res = await fetchApi(`${API_BASE}/me`);
    if (res.status === 401) return null;
    if (!res.ok) throw new Error('Failed to fetch admin user');
    return res.json();
  },

  async logout(): Promise<void> {
    const res = await fetchApi(`${API_BASE}/logout`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to logout');
  },
};
