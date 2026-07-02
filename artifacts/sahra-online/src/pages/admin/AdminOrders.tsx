import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, MapPin, Phone, CreditCard, Package, User2, MessageSquare } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Sugitaanka",
  confirmed: "La Xaqiijiyay",
  delivered: "La Gaarsiiyay",
  cancelled: "La Joojiyay",
};
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const paymentLabels: Record<string, string> = {
  hormuud_evc: "Hormuud EVC Plus",
  zaad: "Zaad (Telesom)",
  salaam: "Salaam Bank",
  cash: "Lacag Caddaan ah",
};

function OrderRow({ o, onStatusChange }: { o: any; onStatusChange: (id: number, status: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(!expanded)} data-testid={`row-order-${o.id}`}>
        <td className="p-3 font-mono text-xs text-muted-foreground">#{o.id}</td>
        <td className="p-3 hidden sm:table-cell">
          <div>
            <p className="font-medium text-sm">{o.buyerName ?? o.customerName ?? "Marti"}</p>
            {o.buyerPhone && <p className="text-xs text-muted-foreground">{o.buyerPhone}</p>}
          </div>
        </td>
        <td className="p-3 hidden md:table-cell">
          {o.address ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-400" /> {o.address}
            </span>
          ) : <span className="text-xs text-muted-foreground">—</span>}
        </td>
        <td className="p-3 hidden lg:table-cell">
          {o.paymentMethod ? (
            <span className="text-xs">{paymentLabels[o.paymentMethod] ?? o.paymentMethod}</span>
          ) : <span className="text-xs text-muted-foreground">—</span>}
        </td>
        <td className="p-3 font-semibold hidden md:table-cell">${Number(o.totalAmount).toFixed(2)}</td>
        <td className="p-3">
          <Select
            value={o.status}
            onValueChange={(val) => { onStatusChange(o.id, val); }}
          >
            <SelectTrigger
              className={`h-7 text-xs w-36 ${statusColors[o.status] ?? ""}`}
              data-testid={`select-order-status-${o.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Sugitaanka</SelectItem>
              <SelectItem value="confirmed">La Xaqiijiyay</SelectItem>
              <SelectItem value="delivered">La Gaarsiiyay</SelectItem>
              <SelectItem value="cancelled">La Joojiyay</SelectItem>
            </SelectContent>
          </Select>
        </td>
        <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">
          {new Date(o.createdAt).toLocaleDateString("so-SO")}
        </td>
        <td className="p-3 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </td>
      </tr>

      {/* Expanded details */}
      {expanded && (
        <tr className="bg-muted/20 border-b">
          <td colSpan={8} className="px-4 pb-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Customer info */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <User2 className="w-3 h-3" /> Macmiilka
                </p>
                <p className="text-sm font-medium">{o.buyerName ?? o.customerName ?? "Aan la garanayn"}</p>
                {o.buyerPhone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {o.buyerPhone}
                  </p>
                )}
                {o.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" /> {o.address}
                  </p>
                )}
              </div>

              {/* Payment */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Lacag-bixinta
                </p>
                <p className="text-sm font-medium">{o.paymentMethod ? paymentLabels[o.paymentMethod] ?? o.paymentMethod : "—"}</p>
                <p className="text-base font-bold text-primary">${Number(o.totalAmount).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{o.pointsEarned} dhibco</p>
              </div>

              {/* Items */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Package className="w-3 h-3" /> Alaabta ({o.items?.length ?? 0})
                </p>
                <div className="space-y-1">
                  {(o.items ?? []).map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.productName} ×{item.quantity}</span>
                      <span className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {o.notes && (
                <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Xusuus-qor
                  </p>
                  <p className="text-sm text-muted-foreground">{o.notes}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { data: orders, isLoading } = useListOrders(
    filterStatus !== "all" ? { status: filterStatus } : undefined
  );
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = async (orderId: number, status: string) => {
    await updateOrder.mutateAsync({ id: orderId, data: { status } });
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    toast({ title: `Dalabka #${orderId} — ${statusLabels[status]}` });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Maamul Dalabyada</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44" data-testid="select-order-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Dhammaan</SelectItem>
            <SelectItem value="pending">Sugitaanka</SelectItem>
            <SelectItem value="confirmed">La Xaqiijiyay</SelectItem>
            <SelectItem value="delivered">La Gaarsiiyay</SelectItem>
            <SelectItem value="cancelled">La Joojiyay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Dalabyo lama helin</div>
      ) : (
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left p-3 font-medium">#</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Macmiil</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Cinwaan</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Lacag-bixin</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Lacagta</th>
                <th className="text-left p-3 font-medium">Xaaladda</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Taariikhda</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders?.map((o) => (
                <OrderRow key={o.id} o={o} onStatusChange={handleStatusChange} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
