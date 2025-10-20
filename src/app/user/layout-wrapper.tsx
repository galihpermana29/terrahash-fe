'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Tabs } from 'antd';
import { usePathname, useRouter } from 'next/navigation';


function UserLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const activeKey = pathname.split('/').pop() || "parcel-management";


  const items = [
    {
      key: 'my-land',
      label: (
        <span>
          My Land
        </span>
      ),

    },
    {
      key: 'my-listing',
      label: (
        <span>
          My Listings
        </span>
      ),

    },
  ];




  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          </div>
          <p className="text-gray-600 mt-2">Welcome, {user?.full_name}</p>
        </div>

        <Tabs defaultActiveKey={activeKey} items={items} onChange={(key) => {
          router.push(`/user/${key}`);
        }} />
        {children}
      </div>
    </div>
  );
}

export default UserLayoutWrapper;
