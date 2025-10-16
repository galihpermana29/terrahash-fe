'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Tabs, Badge } from 'antd';
import {
  FileSearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  ShoppingOutlined
} from '@ant-design/icons';

function GovDashboardContent() {
  const { user } = useAuth();

  const items = [
    {
      key: 'pending',
      label: (
        <span>
          <FileSearchOutlined />
          Pending Submissions
          <Badge count={0} className="ml-2" />
        </span>
      ),
      children: (
        <Card>
          <p className="text-gray-600">Pending land ownership submissions for review will appear here.</p>
          <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
        </Card>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          <FileTextOutlined />
          All Submissions
        </span>
      ),
      children: (
        <Card>
          <p className="text-gray-600">Complete submission history will appear here.</p>
          <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
        </Card>
      ),
    },
    {
      key: 'parcels',
      label: (
        <span>
          <HomeOutlined />
          Parcel Management
        </span>
      ),
      children: (
        <Card>
          <p className="text-gray-600">Manage all land parcels in the system.</p>
          <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
        </Card>
      ),
    },
    {
      key: 'marketplace',
      label: (
        <span>
          <ShoppingOutlined />
          Marketplace Overview
        </span>
      ),
      children: (
        <Card>
          <p className="text-gray-600">Monitor marketplace listings and transactions.</p>
          <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
        </Card>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Government Dashboard</h1>
            <Badge
              count="GOV"
              style={{ backgroundColor: '#1890ff' }}
            />
          </div>
          <p className="text-gray-600 mt-2">Welcome, {user?.full_name}</p>
        </div>

        <Tabs defaultActiveKey="pending" items={items} />
      </div>
    </div>
  );
}

export default function GovDashboardPage() {
  return (
    <AuthGuard requiredUserType="GOV" redirectTo="/">
      <GovDashboardContent />
    </AuthGuard>
  );
}
