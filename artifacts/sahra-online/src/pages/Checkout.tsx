import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { useCreateOrder, useListCustomers, useCreateCustomer } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/react";
import { CheckCircle, MapPin, CreditCard, User2, Phone } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const schema = z.object({
  buyerName: z.string().min(1, "Magaca ayaa waajib ah"),
  buyerPhone: z.string().min(6, "Telefoonka ayaa waajib ah"),
  address: z.string().min(3, "Cinwaanka ayaa waajib ah"),
  paymentMethod: z.enum(["hormuud_evc", "zaad", "salaam", "cash"], {
    required_error: "Habka lacag-bixinta dooro",
  }),
  notes: z.string().optional(),
});

const paymentLabels: Record<string, string> = {
  hormuud_evc: "Hormuud EVC Plus",
  zaad: "Zaad (Telesom)",
  salaam: "Salaam Bank",
  cash: "Lacag Caddaan ah",
};

const statusSteps = ["pending", "confirmed", "delivered"];
const statusLabels: Record<string, string> = {
  pending: "Sugitaan",
  confirmed: "La Xaqiijiyay",
  delivered: "La Gaarsiiyay",
  cancelled: "La Joojiyay",
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useUser();
  const [success, setSuccess] = useState(false);

  const createOrder = useCreateOrder();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      buyerName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
      buyerPhone: "",
      address: "",
      paymentMethod: undefined,
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (items.length === 0) {
      toast({ title: "Baaskiilku waa faaruq", variant: "destructive" });
      return;
    }

    await fetch(`${BASE}/api/orders`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkUserId: user?.id ?? null,
        buyerName: values.buyerName,
        buyerPhone: values.buyerPhone,
        address: values.address,
        paymentMethod: values.paymentMethod,
        totalAmount: total,
        notes: values.notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
          productName: i.name,
        })),
      }),
    });

    clearCart();
    setSuccess(true);
    setTimeout(() => setLocation(user ? "/dashboard" : "/"), 2500);
  };

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Baaskiilku waa faaruq</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h2 className="text-2xl font-bold">Dalabkaaga la Qaabilay!</h2>
        <p className="text-muted-foreground">
          {user ? "Dashboard-kaaga ayaad u gudbinaysaa..." : "Boqolka ayaad u gudbinaysaa..."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Dalabka</h1>

      {/* Order summary */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-2">
        <h3 className="font-semibold mb-3">Alaabta Dalabay</h3>
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between text-sm">
            <span>{i.name} x{i.quantity}</span>
            <span className="font-medium">${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Wadarta</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Buyer Name */}
          <FormField
            control={form.control}
            name="buyerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><User2 className="w-3.5 h-3.5" /> Magacaaga</FormLabel>
                <FormControl>
                  <Input placeholder="Magaca dhameystiran" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buyer Phone */}
          <FormField
            control={form.control}
            name="buyerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefoonka</FormLabel>
                <FormControl>
                  <Input placeholder="+252 61..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Cinwaanka Gaarsiinta</FormLabel>
                <FormControl>
                  <Input placeholder="Xafada, Degmada, Magaalada..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Habka Lacag-bixinta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Dooro habka..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hormuud_evc">💳 Hormuud EVC Plus</SelectItem>
                    <SelectItem value="zaad">📱 Zaad (Telesom)</SelectItem>
                    <SelectItem value="salaam">🏦 Salaam Bank</SelectItem>
                    <SelectItem value="cash">💵 Lacag Caddaan ah</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xusuus-qor (Ikhtiyaari)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Wax ku dar ama faahfaahin dheeraad ah..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={createOrder.isPending || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "La Diraya..." : "✅ Dalabso"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
