"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminCreateProductRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/create-product");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
      <div className="w-12 h-12 border-4 border-[#b89b5e] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
