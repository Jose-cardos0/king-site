import { Navigate } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error('Acesso negado. Área restrita ao administrador.');
    }
  }, [loading, user, isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="spinner-crown" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
