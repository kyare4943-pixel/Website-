import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { useListProducts, useListCategories } from "@workspace/api-client-react";

export default function Products() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  const { data: categories } = useListCategories();
  const { data: products, isLoading } = useListProducts(
    selectedCat ? { categoryId: selectedCat } : undefined
  );

  const filtered = products?.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold">Dhammaan Alaabta</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search-products"
            className="pl-9"
            placeholder="Raadi alaab..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCat === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCat(null)}
          >
            Dhammaan
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCat === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCat(cat.id)}
              data-testid={`button-filter-cat-${cat.id}`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Alaab lama helin</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered?.map((p) => <ProductCard key={p.id} product={{ ...p, price: Number(p.price) }} />)}
        </div>
      )}
    </div>
  );
}
