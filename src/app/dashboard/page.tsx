'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Tabs } from 'antd';
import { FileTextOutlined, HomeOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';

function DashboardContent() {
  const { user } = useAuth();

  const items = [
    {
      key: 'submissions',
      label: (
        <span>
          <FileTextOutlined />
          My Submissions
        </span>
      ),
      children: (
        <Card>
          <p className="text-gray-600">Your land ownership submissions will appear here.</p>
          <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
        </Card>
      ),
    },
    {
      key: 'parcels',
      label: (
        <span>
          <HomeOutlined />
          My Parcels
        </span>
      ),
      children: (
        <Card>
          <p className="text-gray-600">Your owned land parcels will appear here.</p>
          <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
        </Card>
      ),
    },
    {
      key: 'listings',
      label: (
        <span>
          <ShoppingOutlined />
          My Listings
        </span>
      ),
      children: (
        <Card>
          <p className="text-gray-600">Your marketplace listings will appear here.</p>
          <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
        </Card>
      ),
    },
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile
        </span>
      ),
      children: (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900">{user?.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Wallet Address</label>
              <p className="text-gray-900 font-mono text-sm">{user?.wallet_address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Account Type</label>
              <p className="text-gray-900">{user?.type}</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">Profile editing feature coming soon...</p>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Public Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.full_name}!</p>
        </div>

        <Tabs defaultActiveKey="submissions" items={items} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requiredUserType="PUBLIC" redirectTo="/">
      <DashboardContent />
    </AuthGuard>
  );
}
