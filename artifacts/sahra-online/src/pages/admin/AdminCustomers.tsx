import { useState } from "react";
import { Link } from "wouter";
import { Star, Plus, Minus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListCustomers, useCreateCustomer, useUpdateCustomerPoints, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const newCustSchema = z.object({
  name: z.string().min(1, "Magaca waa muhiim"),
  phone: z.string().min(1, "Telefoonka waa muhiim"),
  email: z.string().optional(),
});

const pointsSchema = z.object({
  points: z.coerce.number().int(),
  reason: z.string().min(1, "Sababta waa muhiim"),
});

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [pointsCustomer, setPointsCustomer] = useState<{ id: number; name: string } | null>(null);
  const { data: customers, isLoading } = useListCustomers();
  const createCustomer = useCreateCustomer();
  const updatePoints = useUpdateCustomerPoints();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const newForm = useForm<z.infer<typeof newCustSchema>>({
    resolver: zodResolver(newCustSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  const pointsForm = useForm<z.infer<typeof pointsSchema>>({
    resolver: zodResolver(pointsSchema),
    defaultValues: { points: 0, reason: "" },
  });

  const filtered = customers?.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const onNewSubmit = async (v: z.infer<typeof newCustSchema>) => {
    await createCustomer.mutateAsync({ data: { name: v.name, phone: v.phone, email: v.email } });
    queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    toast({ title: "Macmiil la abuuray" });
    setNewOpen(false);
    newForm.reset();
  };

  const onPointsSubmit = async (v: z.infer<typeof pointsSchema>) => {
    if (!pointsCustomer) return;
    await updatePoints.mutateAsync({ id: pointsCustomer.id, data: { points: v.points, reason: v.reason } });
    queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    toast({ title: `Dhibcaha la cusbooneysiiyay — ${pointsCustomer.name}` });
    setPointsCustomer(null);
    pointsForm.reset();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Maamul Macaamiisha</h1>
        <Button onClick={() => setNewOpen(true)} data-testid="button-admin-add-customer">
          <UserPlus className="w-4 h-4 mr-2" /> Macmiil Cusub
        </Button>
      </div>

      <Input
        placeholder="Raadi macmiil..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        data-testid="input-admin-search-customers"
      />

      {/* New Customer Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Macmiil Cusub</DialogTitle></DialogHeader>
          <Form {...newForm}>
            <form onSubmit={newForm.handleSubmit(onNewSubmit)} className="space-y-3">
              <FormField control={newForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Magaca</FormLabel>
                  <FormControl><Input placeholder="Magaca" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={newForm.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Telefoonka</FormLabel>
                  <FormControl><Input placeholder="+252..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={newForm.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Iimaylka</FormLabel>
                  <FormControl><Input placeholder="iimaylka..." {...field} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createCustomer.isPending}>Abuur</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Points Dialog */}
      <Dialog open={!!pointsCustomer} onOpenChange={() => setPointsCustomer(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dhibco — {pointsCustomer?.name}</DialogTitle></DialogHeader>
          <Form {...pointsForm}>
            <form onSubmit={pointsForm.handleSubmit(onPointsSubmit)} className="space-y-3">
              <FormField control={pointsForm.control} name="points" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dhibcaha (+ ku dar, - ka jar)</FormLabel>
                  <FormControl><Input type="number" placeholder="Tusaale: 50 ama -10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={pointsForm.control} name="reason" render={({ field }) => (
                <FormItem><FormLabel>Sababta</FormLabel>
                  <FormControl><Input placeholder="Sababta..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={updatePoints.isPending}>Kaydi</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Macmiil</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Telefoon</th>
                <th className="text-left p-3 font-medium">Dhibco</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Lacagta</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered?.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30" data-testid={`row-admin-customer-${c.id}`}>
                  <td className="p-3">
                    <Link href={`/customers/${c.id}`} className="hover:underline font-medium">{c.name}</Link>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{c.phone}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 font-bold text-secondary">
                      <Star className="w-3 h-3 fill-secondary text-secondary" />{c.points}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell">${(c.totalSpent ?? 0).toFixed(2)}</td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => { setPointsCustomer({ id: c.id, name: c.name }); pointsForm.reset({ points: 0, reason: "" }); }}
                      data-testid={`button-update-points-${c.id}`}
                    >
                      <Star className="w-3 h-3 mr-1" /> Dhibco
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
