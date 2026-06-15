import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 space-y-6">
      <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-4">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold">Chưa được cấp quyền</h1>
      <p className="text-gray-500 max-w-md text-center">
        Tài khoản của bạn đã đăng nhập thành công, nhưng hiện tại chưa được cấp bất kỳ vai trò (Role) nào trong hệ thống Clinic Hub.
      </p>
      <div className="pt-6 flex gap-4">
        <form action="/api/auth/signout" method="POST">
          <Button variant="outline" type="submit">Đăng xuất</Button>
        </form>
      </div>
    </div>
  );
}
