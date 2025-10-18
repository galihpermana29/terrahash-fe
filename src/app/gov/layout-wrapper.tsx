'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Tabs } from 'antd';
import { usePathname, useRouter } from 'next/navigation';


function GovLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const items = [

    {
      key: 'history',
      label: (
        <span>
          All Submissions
        </span>
      ),

    },
    {
      key: 'parcel-management',
      label: (
        <span>
          Parcel Management
        </span>
      ),

    },
    {
      key: 'marketplace',
      label: (
        <span>
          Marketplace Overview
        </span>
      ),

    },
  ];




  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Government Dashboard</h1>
          </div>
          <p className="text-gray-600 mt-2">Welcome, {user?.full_name}</p>
        </div>

        <Tabs defaultActiveKey={pathname.split('/').pop() || "parcel-management"} items={items} onChange={(key) => {
          router.push(`/gov/${key}`);
        }} />
        {children}
      </div>
    </div>
  );
}

export default GovLayoutWrapper;
