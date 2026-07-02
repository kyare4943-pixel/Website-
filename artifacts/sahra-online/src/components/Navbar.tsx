import { Link, useLocation } from "wouter";
import { ShoppingCart, Store, Menu, X, LogIn, LogOut, User, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useClerk, useUser, Show } from "@clerk/react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const publicNavLinks = [
  { href: "/", label: "Boqolka" },
  { href: "/products", label: "Alaabta" },
  { href: "/points", label: "Dhibcaha" },
];

export default function Navbar() {
  const { count } = useCart();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  const { user, isSignedIn } = useUser();
  const { isAdmin } = useIsAdmin();

  const navLinks = [
    ...publicNavLinks,
    ...(isSignedIn ? [{ href: "/dashboard", label: "Dashboard", icon: User }] : []),
    ...(isSignedIn ? [{ href: "/customers", label: "Macaamiisha" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Maamulka", icon: ShieldCheck }] : []),
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-white/10 shadow-xl"
      style={{ background: "rgba(7, 11, 20, 0.92)", backdropFilter: "blur(16px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)" }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span
            style={{
              background: "linear-gradient(90deg, #22d3ee, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SAHRA
          </span>
          <span className="text-white">ONLINE</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location === l.href || (l.href !== "/" && location.startsWith(l.href))
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {"icon" in l && l.icon ? <l.icon className="w-3 h-3 text-cyan-400" /> : null}
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon"
              className="relative text-white/60 hover:text-white hover:bg-white/10 border-0">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs border-0"
                  style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)" }}
                >
                  {count}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Auth — desktop */}
          <Show when="signed-in">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-white/50 flex items-center gap-1">
                <User className="w-3 h-3" />
                {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 text-xs border border-white/10"
                onClick={() => signOut({ redirectUrl: basePath || "/" })}
              >
                <LogOut className="w-3 h-3 mr-1" /> Ka Bax
              </Button>
            </div>
          </Show>

          <Show when="signed-out">
            <Link href="/sign-in" className="hidden md:block">
              <Button
                size="sm"
                className="text-xs font-semibold"
                style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)", border: "none" }}
              >
                <LogIn className="w-3 h-3 mr-1" /> Gal
              </Button>
            </Link>
          </Show>

          {/* Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1"
          style={{ background: "rgba(7, 11, 20, 0.98)" }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location === l.href ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {"icon" in l && l.icon ? <l.icon className="w-3 h-3 text-cyan-400" /> : null}
              {l.label}
            </Link>
          ))}

          <div className="border-t border-white/10 mt-2 pt-2">
            <Show when="signed-in">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-white/50 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10 text-xs"
                  onClick={() => { setOpen(false); signOut({ redirectUrl: basePath || "/" }); }}
                >
                  <LogOut className="w-3 h-3 mr-1" /> Ka Bax
                </Button>
              </div>
            </Show>
            <Show when="signed-out">
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                <Button
                  className="w-full font-semibold mt-1"
                  style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)", border: "none" }}
                >
                  <LogIn className="w-4 h-4 mr-2" /> Gal / Abuur Akoonto
                </Button>
              </Link>
            </Show>
          </div>
        </div>
      )}
    </nav>
  );
}
