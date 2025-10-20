'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Dropdown, type MenuProps, Modal, Form, Input } from 'antd';
import { useAccount } from 'wagmi';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useDisconnect } from 'wagmi';

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { openChainModal } = useChainModal();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  // Auth hooks

  const authData = useAuth();
  const { user, isAuthenticated, register, logout, isRegistering } = authData;
  const { needsRegistration, isCheckingAuth, dismissRegistration } = useWalletAuth();

  const [form] = Form.useForm();

  const isActive = (href: string) => pathname === href;

  const handleRegister = async (values: { full_name: string }) => {
    if (!address) return;

    try {
      await register(address, values.full_name);
      dismissRegistration();
      form.resetFields();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCloseRegisterModal = () => {
    dismissRegistration();
    form.resetFields();
    disconnect?.();
  };

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
            {isAuthenticated && user && address ? (
              // Connected & Authenticated: Show user dropdown
              (() => {
                const userName = user.full_name || 'User';
                const displayAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
                const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                const items: MenuProps['items'] = [
                  { key: 'network', label: 'Change Network' },
                  { key: 'dashboard', label: <Link href={user.type === 'GOV' ? '/gov' : '/user'}>Dashboard</Link> },
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
                          handleLogout();
                        }
                      },
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <button className="px-3 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white text-xs">
                        {initials}
                      </span>
                      <span className="text-sm text-gray-700 font-medium">{userName}</span>
                      <span className="text-xs text-gray-500">{displayAddr}</span>
                    </button>
                  </Dropdown>
                );
              })()
            ) : isCheckingAuth ? (
              // Connected but checking auth state
              <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
                Loading...
              </button>
            ) : (
              // Not connected: Show connect wallet button
              <button
                onClick={() => openConnectModal?.()}
                className="px-4 py-2 rounded-full bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
          <Link href="/map" className="md:hidden">
            <button className="px-3 py-2 rounded-full bg-brand-primary text-white text-sm">Find Land</button>
          </Link>
        </div>
      </div>

      {/* Register Modal */}
      <Modal
        title="Complete Your Registration"
        open={needsRegistration}
        onCancel={handleCloseRegisterModal}
        footer={null}
        centered
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Welcome! Please provide your name to complete registration.
          </p>
          <Form
            form={form}
            onFinish={handleRegister}
            layout="vertical"
          >
            <Form.Item
              label="Full Name"
              name="full_name"
              rules={[
                { required: true, message: 'Please enter your full name' },
                { min: 2, message: 'Name must be at least 2 characters' },
                { max: 100, message: 'Name must be less than 100 characters' },
              ]}
            >
              <Input placeholder="Enter your full name" size="large" />
            </Form.Item>

            <div className="text-xs text-gray-500 mb-4">
              <strong>Wallet:</strong> {address}
            </div>

            <Form.Item className="mb-0">
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full px-4 py-2 rounded-lg bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isRegistering ? 'Registering...' : 'Complete Registration'}
              </button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </header>
  );
}
