// components/ProtectedRoute.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
      if (!user) {
      router.push("/login");
      }
  }, [user, router]);

  if (!user) {
      return null; // Or a loading indicator, or a message
  }

return <>{children}</>
};
export default ProtectedRoute;