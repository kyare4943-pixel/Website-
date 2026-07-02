import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListProducts, useCreateProduct, useDeleteProduct, useUpdateProduct,
  getListProductsQueryKey, useListCategories,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export default function AdminProducts() {
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<{ id: number } & FormValues | null>(null);
  const { data: products, isLoading } = useListProducts();
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", price: 0, stock: 0, imageUrl: "", categoryId: "", featured: false },
  });

  const openEdit = (p: typeof products extends (infer T)[] | undefined ? T : never) => {
    if (!p) return;
    const vals = {
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: Number(p.price),
      stock: p.stock,
      imageUrl: p.imageUrl ?? "",
      categoryId: p.categoryId ? String(p.categoryId) : "",
      featured: p.featured ?? false,
    };
    setEditProduct(vals);
    form.reset(vals);
    setOpen(true);
  };

  const openNew = () => {
    setEditProduct(null);
    form.reset({ name: "", description: "", price: 0, stock: 0, imageUrl: "", categoryId: "", featured: false });
    setOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      imageUrl: values.imageUrl,
      categoryId: values.categoryId ? Number(values.categoryId) : null,
      featured: values.featured,
    };
    if (editProduct) {
      await updateProduct.mutateAsync({ id: editProduct.id, data: payload });
      toast({ title: "Alaabta la cusbooneysiiyay" });
    } else {
      await createProduct.mutateAsync({ data: payload });
      toast({ title: "Alaabta la abuuray" });
    }
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    setOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ma hubtaa in aad tirtirto alaabtan?")) return;
    await deleteProduct.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    toast({ title: "La tirtiray" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maamul Alaabta</h1>
        <Button onClick={openNew} data-testid="button-add-product">
          <Plus className="w-4 h-4 mr-2" /> Alaab Cusub
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Wax ka Badal" : "Alaab Cusub"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Magaca</FormLabel>
                  <FormControl><Input data-testid="input-product-name" placeholder="Magaca alaabta" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Faahfaahin</FormLabel>
                  <FormControl><Textarea placeholder="Sharaxaad..." {...field} /></FormControl>
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Qiimaha ($)</FormLabel>
                    <FormControl><Input type="number" min={0} step={0.01} data-testid="input-product-price" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem><FormLabel>Kaydka</FormLabel>
                    <FormControl><Input type="number" min={0} data-testid="input-product-stock" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>URL Sawirka</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>Qaybta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Dooro qaybta..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Qaybta Ma Jirto</SelectItem>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="featured" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel className="mt-0">Muuqda?</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
                {editProduct ? "Kaydi" : "Abuur"}
              </Button>
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
                <th className="text-left p-3 font-medium">Alaabta</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Qaybta</th>
                <th className="text-left p-3 font-medium">Qiimaha</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Kaydka</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products?.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30" data-testid={`row-product-${p.id}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded object-cover" />}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.featured && <Star className="w-3 h-3 text-secondary inline fill-secondary" />}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{p.categoryName ?? "—"}</td>
                  <td className="p-3 font-semibold text-primary">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className={p.stock === 0 ? "text-destructive" : ""}>{p.stock}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)} data-testid={`button-edit-product-${p.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)} data-testid={`button-delete-product-${p.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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
