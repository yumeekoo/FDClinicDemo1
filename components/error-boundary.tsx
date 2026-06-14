"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
          <div className="relative overflow-hidden max-w-md w-full rounded-2xl border border-gray-200 bg-gray-50/40 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl" />
            
            <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">Đã xảy ra sự cố hệ thống</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Hệ thống gặp lỗi không mong muốn khi tải thành phần giao diện này. Vui lòng tải lại trang hoặc liên hệ quản trị viên nếu lỗi tiếp tục xảy ra.
            </p>

            {this.state.error && (
              <details className="text-left bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 max-h-36 overflow-y-auto cursor-pointer">
                <summary className="text-[10px] text-gray-500 font-mono select-none">
                  Chi tiết lỗi kĩ thuật (Technical Details)
                </summary>
                <p className="text-[10px] text-red-400 font-mono mt-2 whitespace-pre-wrap">
                  {this.state.error.message || "Unknown Error"}
                </p>
              </details>
            )}

            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={() => window.location.href = "/"}
                variant="ghost"
                className="text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl text-xs h-10 px-4"
              >
                Trang chủ
              </Button>
              <Button
                onClick={this.handleReset}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-gray-900 font-semibold text-xs h-10 rounded-xl px-6 shadow-lg shadow-blue-500/10"
              >
                Thử tải lại trang
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
