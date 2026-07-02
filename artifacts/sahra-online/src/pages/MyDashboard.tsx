import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Link } from "wouter";
import {
  ShoppingBag, ShieldCheck, ArrowRight, MapPin, CreditCard,
  Phone, Package, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const statusLabels: Record<string, string> = {
  pending: "Sugitaan",
  confirmed: "La Xaqiijiyay",
  delivered: "La Gaarsiiyay",
  cancelled: "La Joojiyay",
};
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};
const statusSteps = ["pending", "confirmed", "delivered"];

const paymentLabels: Record<string, string> = {
  hormuud_evc: "Hormuud EVC Plus",
  zaad: "Zaad (Telesom)",
  salaam: "Salaam Bank",
  cash: "Lacag Caddaan ah",
};

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}
interface MyOrder {
  id: number;
  status: string;
  totalAmount: number;
  pointsEarned: number;
  paymentMethod: string | null;
  address: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

async function fetchMyOrders(): Promise<MyOrder[]> {
  const res = await fetch(`${BASE}/api/my/orders`, { credentials: "include" });
  if (!res.ok) throw new Error("Khalad");
  return res.json();
}

function ProgressBar({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex gap-1 mt-3">
        {statusSteps.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-red-500/40" />
        ))}
      </div>
    );
  }
  const step = statusSteps.indexOf(status);
  return (
    <div className="flex gap-1 mt-3">
      {statusSteps.map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full transition-all ${
            i <= step ? "bg-gradient-to-r from-cyan-400 to-purple-500" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: MyOrder }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#131929] border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-cyan-400" />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">Order #{String(order.id).padStart(5, "0")}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[order.status] ?? "bg-white/10 text-white/60"}`}>
                {statusLabels[order.status] ?? order.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
              <Clock className="w-3 h-3" />
              {new Date(order.createdAt).toLocaleDateString("so-SO", { year: "numeric", month: "short", day: "numeric" })}
              {order.paymentMethod && (
                <span className="ml-1">· {paymentLabels[order.paymentMethod] ?? order.paymentMethod}</span>
              )}
            </div>
            {order.address && (
              <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400" />
                {order.address}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="text-right flex-shrink-0">
            <p
              className="font-black text-lg"
              style={{ background: "linear-gradient(90deg,#22d3ee,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              ${order.totalAmount.toFixed(2)}
            </p>
            {order.status !== "delivered" && (
              <p className="text-xs text-yellow-400 font-medium">Aan la bixin</p>
            )}
            {order.status === "delivered" && (
              <p className="text-xs text-emerald-400 font-medium">La bixiyay</p>
            )}
          </div>
        </div>

        <ProgressBar status={order.status} />

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Xir" : "Faahfaahinta Eeg"} ({order.items.length} alaab)
        </button>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-white/5 bg-white/[0.02] px-4 py-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-white/70">{item.productName} <span className="text-white/30">×{item.quantity}</span></span>
              <span className="text-white/60 font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {order.notes && (
            <p className="text-xs text-white/30 pt-1 border-t border-white/5 mt-2">{order.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyDashboard() {
  const { user, isLoaded } = useUser();
  const { isAdmin } = useIsAdmin();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    enabled: !!user,
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#070b14" }}>
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const displayName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Isticmaale" : "";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto space-y-8" style={{ background: "#070b14" }}>
      {/* Header */}
      <h1 className="text-3xl font-black text-white">
        My{" "}
        <span style={{ background: "linear-gradient(90deg,#22d3ee,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Dashboard
        </span>
      </h1>

      {/* Profile Card */}
      <div className="bg-[#131929] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
        {/* Avatar */}
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt={displayName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#22d3ee,#a855f7)" }}
          >
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base truncate">{displayName}</p>
          <p className="text-white/40 text-xs truncate">{email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {isAdmin && (
              <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20">
                <ShieldCheck className="w-3 h-3 mr-1" /> Admin
              </Badge>
            )}
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
                → Admin Panel <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Order count */}
        <div className="text-right flex-shrink-0">
          <p
            className="text-3xl font-black"
            style={{ background: "linear-gradient(90deg,#22d3ee,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {orders.length}
          </p>
          <p className="text-white/40 text-xs">Orders</p>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-cyan-400" />
          Order History
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#131929] border border-white/10 rounded-2xl p-4 animate-pulse h-28" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#131929] border border-white/10 rounded-2xl p-10 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">Wali dalabyo ma lihid</p>
            <Link href="/products">
              <button className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2">
                Alaabta eeg →
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
