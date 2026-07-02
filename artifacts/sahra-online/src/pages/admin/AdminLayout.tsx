import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, ArrowLeft, ShieldCheck, UserCircle2 } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Maamulka", icon: LayoutDashboard },
  { href: "/admin/products", label: "Alaabta", icon: Package },
  { href: "/admin/orders", label: "Dalabyada", icon: ShoppingBag },
  { href: "/admin/customers", label: "Macaamiisha", icon: Users },
  { href: "/admin/categories", label: "Qaybaha", icon: Tag },
  { href: "/admin/users", label: "Isticmaalayaasha", icon: UserCircle2 },
  { href: "/admin/manage-admins", label: "Adminyada", icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r bg-sidebar hidden md:block">
        <div className="p-4 space-y-1">
          <Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="w-3 h-3" /> Ku Laabo Suuqa
          </Link>
          {adminLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === l.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden w-full border-b bg-sidebar px-4 py-2 flex gap-2 overflow-x-auto fixed top-16 z-40">
        {adminLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              location === l.href
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <l.icon className="w-3 h-3" />
            {l.label}
          </Link>
        ))}
      </div>

      <main className="flex-1 p-6 md:mt-0 mt-10">{children}</main>
    </div>
  );
}
