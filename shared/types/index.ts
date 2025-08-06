// Shared types across all microservices

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Website {
  id: string;
  projectId: string;
  url: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scan {
  id: string;
  websiteId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  scanType: 'accessibility' | 'ux' | 'seo' | 'full';
}

export interface Finding {
  id: string;
  scanId: string;
  type: 'error' | 'warning' | 'info';
  category: 'accessibility' | 'ux' | 'seo' | 'performance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  element?: string;
  screenshot?: string;
  remediation?: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  scanId: string;
  format: 'pdf' | 'html' | 'json';
  url: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'scan_complete' | 'finding_alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
