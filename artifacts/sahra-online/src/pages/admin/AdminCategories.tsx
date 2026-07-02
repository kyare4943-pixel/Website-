import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListCategories, useCreateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Magaca waa muhiim"),
  icon: z.string().optional(),
});

export default function AdminCategories() {
  const [open, setOpen] = useState(false);
  const { data: categories, isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", icon: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await createCategory.mutateAsync({ data: { name: values.name, icon: values.icon } });
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    toast({ title: "Qaybta la abuuray" });
    setOpen(false);
    form.reset();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ma hubtaa in aad tirtirto qaybtan?")) return;
    await deleteCategory.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    toast({ title: "La tirtiray" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maamul Qaybaha</h1>
        <Button onClick={() => setOpen(true)} data-testid="button-add-category">
          <Plus className="w-4 h-4 mr-2" /> Qaybta Cusub
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Qaybta Cusub</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Magaca</FormLabel>
                  <FormControl><Input data-testid="input-category-name" placeholder="Magaca qaybta" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem><FormLabel>Calaamadda (optional, e.g. emoji)</FormLabel>
                  <FormControl><Input placeholder="Tusaale: 👗 ama 📱" {...field} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createCategory.isPending}>Abuur</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {categories?.map((cat) => (
            <div key={cat.id} data-testid={`card-category-${cat.id}`} className="flex items-center justify-between bg-card border border-card-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.productCount ?? 0} alaab</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(cat.id)}
                data-testid={`button-delete-category-${cat.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {categories?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Qaybaha lama helin</div>
          )}
        </div>
      )}
    </div>
  );
}
