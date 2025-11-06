"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LogoutButton from "@/components/auth/LogoutButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth/");
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar autenticación para páginas no-auth
  useEffect(() => {
    if (!isAuthPage) {
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated") {
        router.push("/auth/login");
        return;
      }
    }
  }, [session, status, router, isAuthPage]);

  // Si es una página de auth, solo mostrar el contenido sin sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">
            Verificando autenticación...
          </h2>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-white shadow-lg flex-shrink-0">
        <div className="flex h-24 items-center border-b border-slate-200 px-6 flex-shrink-0">
          <Link href="/" className="flex items-center justify-center w-full">
            <div className="w-24 h-24 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Agrotico Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <ul className="grid items-start px-4 text-sm font-medium space-y-2">
            <li>
              <Link
                href="/"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  pathname === "/"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/ai"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  pathname === "/ai"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                AI Assistant
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-auto p-4 border-t border-slate-200 flex-shrink-0">
          <ul className="grid items-start px-4 text-sm font-medium space-y-2">
            <li>
              <Link
                href="/settings"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  pathname === "/settings"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </li>
            <li>
              <LogoutButton
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2.5 transition-all duration-200"
              />
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-6 md:hidden flex-shrink-0 shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden border-slate-300"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-white">
              <Link
                href="/"
                className="flex items-center justify-center w-full py-6"
              >
                <div className="w-24 h-24 flex items-center justify-center">
                  <img
                    src="/logo.svg"
                    alt="Agrotico Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all duration-200 ${
                    pathname === "/"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/ai"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all duration-200 ${
                    pathname === "/ai"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  AI Assistant
                </Link>
                <Link
                  href="/settings"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all duration-200 ${
                    pathname === "/settings"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <div className="mx-[-0.65rem]">
                  <LogoutButton
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Search bar or other header content */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
