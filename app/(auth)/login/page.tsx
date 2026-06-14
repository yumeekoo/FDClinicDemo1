"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ email và mật khẩu.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Vietnamese error mapping
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email hoặc mật khẩu không chính xác.");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // Check role & redirect in client as backup, middleware also handles it
      const role = data.user?.user_metadata?.role || "RECEPTION";
      switch (role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "RECEPTION":
          router.push("/reception");
          break;
        case "DOCTOR":
          router.push("/doctor");
          break;
        case "PARACLINICAL":
          router.push("/paraclinical");
          break;
        case "CASHIER":
          router.push("/cashier");
          break;
        case "PHARMACIST":
          router.push("/pharmacy");
          break;
        default:
          router.push("/reception");
      }
      router.refresh();
    } catch (err) {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 py-12 sm:px-6 lg:px-8">
      {/* Dynamic background gradient elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 w-full max-w-md space-y-8 px-4 sm:px-0">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-gray-900 shadow-lg shadow-blue-500/20">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
            Clinic Hub
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Hệ thống quản lý phòng khám đa chi nhánh
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50/50 p-8 shadow-2xl backdrop-blur-xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600"
              >
                Địa chỉ Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600"
              >
                Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-gray-900 shadow-lg hover:from-blue-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition duration-200"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
