"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from '@/components/auth/AuthGuard';

const PageGov = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/gov/parcel-management');
  }, []);
  return <></>;
}




export default function PageGovAuth() {
  return (
    <AuthGuard requiredUserType="GOV" redirectTo="/">
      <PageGov />
    </AuthGuard>
  );
}