import { useAuth } from "@/lib/auth-context";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function Protected({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (admin && role !== "admin") return <Navigate to="/" />;
  return <>{children}</>;
}
