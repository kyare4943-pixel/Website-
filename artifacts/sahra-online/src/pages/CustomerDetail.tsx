import { useParams, Link } from "wouter";
import { ArrowLeft, Star, Phone, Mail, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCustomer, getGetCustomerQueryKey, useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading } = useGetCustomer(Number(id), {
    query: { enabled: !!id, queryKey: getGetCustomerQueryKey(Number(id)) },
  });
  const { data: orders } = useListOrders({ customerId: Number(id) }, {
    query: {
      enabled: !!id,
      queryKey: getListOrdersQueryKey({ customerId: Number(id) }),
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return <div className="text-center py-16 text-muted-foreground">Macmiilku ma jiro</div>;
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    pending: "Sugitaanka",
    confirmed: "La Xaqiijiyay",
    delivered: "La Gaarsiiyay",
    cancelled: "La Joojiyay",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/customers">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Macaamiisha
        </Button>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold" data-testid="text-customer-detail-name">{customer.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
              {customer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-secondary/10 rounded-lg">
            <p className="text-2xl font-bold text-secondary flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-secondary text-secondary" />
              {customer.points}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Dhibcaha</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-2xl font-bold text-primary">{customer.totalOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Dalabyada</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">${(customer.totalSpent ?? 0).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Lacagta</p>
          </div>
        </div>
      </div>

      {orders && orders.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Taariikhda Dalabyada
          </h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Dalabka #{order.id}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("so-SO")}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] ?? ""}`}>
                    {statusLabels[order.status] ?? order.status}
                  </span>
                  <span className="font-bold text-sm">${Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
