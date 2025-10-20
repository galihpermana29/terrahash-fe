"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from '@/components/auth/AuthGuard';

const PageUser = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/user/my-land');
  }, []);
  return <></>;
}




export default function PageUserAuth() {
  return (
    <AuthGuard requiredUserType="PUBLIC" redirectTo="/">
      <PageUser />
    </AuthGuard>
  );
}