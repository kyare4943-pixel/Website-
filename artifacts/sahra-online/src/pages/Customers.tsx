import { useState } from "react";
import { Link } from "wouter";
import { Search, UserPlus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListCustomers, useCreateCustomer, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Magaca waa muhiim"),
  phone: z.string().min(1, "Telefoonka waa muhiim"),
  email: z.string().optional(),
});

export default function Customers() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: customers, isLoading } = useListCustomers();
  const createCustomer = useCreateCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  const filtered = customers?.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await createCustomer.mutateAsync({ data: { name: values.name, phone: values.phone, email: values.email } });
    queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    toast({ title: "Macmiil la abuuray" });
    setOpen(false);
    form.reset();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Macaamiisha</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-customer">
              <UserPlus className="w-4 h-4 mr-2" /> Macmiil Cusub
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Macmiil Cusub</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Magaca</FormLabel>
                    <FormControl><Input data-testid="input-new-customer-name" placeholder="Magaca macmiilka" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoonka</FormLabel>
                    <FormControl><Input data-testid="input-new-customer-phone" placeholder="+252..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Iimaylka (Optional)</FormLabel>
                    <FormControl><Input data-testid="input-new-customer-email" placeholder="iimaylka..." {...field} /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createCustomer.isPending}>
                  {createCustomer.isPending ? "La Abuurayaa..." : "Abuur"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Raadi macmiil..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-customers"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((c) => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <div
                data-testid={`card-customer-${c.id}`}
                className="flex items-center gap-4 bg-card border border-card-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" data-testid={`text-customer-name-${c.id}`}>{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.phone}</p>
                </div>
                <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-secondary text-secondary" />
                  {c.points} dhibco
                </Badge>
              </div>
            </Link>
          ))}
          {filtered?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Macmiil lama helin</div>
          )}
        </div>
      )}
    </div>
  );
}
