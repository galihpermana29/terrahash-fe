'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dropdown, type MenuProps } from 'antd';
import { useAccount, useDisconnect } from 'wagmi';
import { useChainModal } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openChainModal } = useChainModal();

  const isActive = (href: string) => pathname === href;

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary"></div>
          <span className="font-semibold text-brand-primary">TerraHash</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium hover:text-brand-primary ${isActive('/') ? 'text-brand-primary' : 'text-gray-600'}`}
          >
            Home
          </Link>
          <Link
            href="/map"
            className={`text-sm font-medium hover:text-brand-primary ${isActive('/map') ? 'text-brand-primary' : 'text-gray-600'}`}
          >
            Find Land
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            {(() => {
              const userName = 'galih permana';
              const displayAddr = isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x12a3...9Bf2';
              const items: MenuProps['items'] = [
                { key: 'network', label: 'Change Network' },
                { key: 'dashboard', label: <Link href="/dashboard">Dashboard</Link> },
                { key: 'logout', label: 'Logout' },
              ];
              return (
                <Dropdown
                  menu={{
                    items,
                    onClick: ({ key }) => {
                      if (key === 'network') {
                        openChainModal?.();
                      } else if (key === 'logout') {
                        disconnect?.();
                      }
                    },
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <button className="px-3 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white text-xs">GP</span>
                    <span className="text-sm text-gray-700 font-medium">{userName}</span>
                    <span className="text-xs text-gray-500">{displayAddr}</span>
                  </button>
                </Dropdown>
              );
            })()}
          </div>
          <Link href="/map" className="md:hidden">
            <button className="px-3 py-2 rounded-full bg-brand-primary text-white text-sm">Find Land</button>
          </Link>
        </div>
      </div>
    </header>
  );
}
