import { Link } from "wouter";
import {
  TrendingUp, ShoppingBag, Package, Users, Clock, CheckCircle,
  BarChart3, ArrowRight, DollarSign, XCircle, Eye, Settings,
  ShieldCheck, Tag, Star
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetAdminStats, useGetRecentOrders } from "@workspace/api-client-react";

const statusLabels: Record<string, string> = {
  pending: "Sugitaanka",
  confirmed: "La Xaqiijiyay",
  delivered: "La Gaarsiiyay",
  cancelled: "La Joojiyay",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border border-blue-200",
  delivered: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border border-red-200",
};

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useGetAdminStats();
  const { data: recentOrders, isLoading: loadingOrders } = useGetRecentOrders();

  const statCards = [
    {
      label: "Lacagta Guud",
      value: stats ? `$${Number(stats.totalSales).toFixed(2)}` : "—",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      shadow: "shadow-emerald-100",
    },
    {
      label: "Dalabyada",
      value: stats?.totalOrders ?? "—",
      icon: ShoppingBag,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      shadow: "shadow-blue-100",
    },
    {
      label: "Alaabta",
      value: stats?.totalProducts ?? "—",
      icon: Package,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-700",
      shadow: "shadow-violet-100",
    },
    {
      label: "Macaamiisha",
      value: stats?.totalCustomers ?? "—",
      icon: Users,
      gradient: "from-rose-500 to-pink-600",
      bg: "bg-rose-50",
      text: "text-rose-700",
      shadow: "shadow-rose-100",
    },
  ];

  const quickLinks = [
    { href: "/admin/products", icon: Package, label: "Alaabta", desc: "Kudar / Wax ka badal", color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
    { href: "/admin/orders", icon: ShoppingBag, label: "Dalabyada", desc: "Xaaladda bedel", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
    { href: "/admin/customers", icon: Users, label: "Macaamiisha", desc: "Dhibco + faahfaahin", color: "text-rose-600 bg-rose-50 hover:bg-rose-100" },
    { href: "/admin/categories", icon: Tag, label: "Qaybaha", desc: "Qaybaha maamul", color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
    { href: "/admin/manage-admins", icon: ShieldCheck, label: "Adminyada", desc: "Maamulayaasha", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Maamulka</h1>
          <p className="text-muted-foreground mt-1 text-sm">Xaaladda guud ee Sahra Online</p>
        </div>
        <Link href="/admin/products">
          <Button className="gap-2 shadow-md">
            <Settings className="w-4 h-4" /> Maamul
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl bg-card border border-card-border shadow-md ${s.shadow} p-5`}>
            {loadingStats ? (
              <Skeleton className="h-20" />
            ) : (
              <>
                <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-gradient-to-br ${s.gradient}`} />
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${s.gradient} shadow-md`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-black">{s.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">{s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Order status + quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Order status */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Xaaladda Dalabyada
          </h2>
          {loadingStats ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Sugitaanka", value: stats?.pendingOrders ?? 0, color: "bg-amber-500", total: stats?.totalOrders ?? 1 },
                { label: "La Xaqiijiyay", value: (stats?.totalOrders ?? 0) - (stats?.pendingOrders ?? 0) - (stats?.deliveredOrders ?? 0), color: "bg-blue-500", total: stats?.totalOrders ?? 1 },
                { label: "La Gaarsiiyay", value: stats?.deliveredOrders ?? 0, color: "bg-emerald-500", total: stats?.totalOrders ?? 1 },
              ].map((item) => {
                const pct = stats?.totalOrders ? Math.round((item.value / stats.totalOrders) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-bold">{item.value} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Xulashooyinka Degdegga
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {quickLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${l.color}`}>
                  <l.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-none">{l.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{l.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto flex-shrink-0 opacity-50" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {stats?.topProducts && stats.topProducts.length > 0 && (
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Alaabta Ugu Badan La Iibiyo
            </h2>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="text-xs">
                Dhammaanba <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white
                  ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-700" : "bg-muted-foreground"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                </div>
                <Badge variant="secondary" className="text-xs font-bold">
                  {p.totalSold} la iibiyo
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Dalabyada Dambe
          </h2>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="text-xs">
              Dhammaanba <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
        {loadingOrders ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-muted-foreground">
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">#Dalabka</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Macmiil</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Xaaladda</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Lacagta</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders?.slice(0, 10).map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground font-bold">#{o.id}</td>
                    <td className="px-6 py-4 font-medium">{o.customerName ?? "Marti"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[o.status] ?? ""}`}>
                        {statusLabels[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">
                      ${Number(o.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Link href="/admin/orders">
                        <Button variant="ghost" size="icon" className="w-7 h-7">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
