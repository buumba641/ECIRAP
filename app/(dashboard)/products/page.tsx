import { Wifi, Package } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProducts } from "@/lib/data"
import { formatCurrency } from "@/lib/format"
import { ProductFormButton } from "@/components/forms/product-form"
import { DeleteButton } from "@/components/delete-button"
import { deleteProduct } from "@/lib/actions"

const CATEGORY_ICONS: Record<string, string> = {
  Router: "📡",
  Antenna: "📶",
  MiFi: "📱",
  "Mesh System": "🔗",
  Cable: "🔌",
  Accessory: "🔧",
  Enterprise: "🏢",
}

export default async function ProductsPage() {
  const products = await getProducts()

  const categories = [...new Set(products.map((p) => p.category))].sort()
  const totalProducts = products.length
  const inStock = products.filter((p) => p.in_stock).length

  return (
    <div>
      <PageHeader
        title="Product Catalog"
        description="ISP routers, antennas, and accessories — the hardware powering Infratel Zambia's connectivity services."
      >
        <ProductFormButton />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="mt-1 text-xl font-semibold">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">In Stock</p>
            <p className="mt-1 text-xl font-semibold text-chart-4">{inStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="mt-1 text-xl font-semibold text-destructive">{totalProducts - inStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="mt-1 text-xl font-semibold">{categories.length}</p>
          </CardContent>
        </Card>
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No products yet. Click &quot;New Product&quot; to add your first product.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="group transition-colors hover:border-primary/30">
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-lg">
                    {CATEGORY_ICONS[p.category] ?? "📦"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku ?? "No SKU"}</p>
                  </div>
                </div>
                <DeleteButton id={p.id} action={deleteProduct} />
              </div>

              {p.description && (
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-border pt-3">
                <p className="text-lg font-semibold">{formatCurrency(p.price)}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {p.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      p.in_stock
                        ? "border-chart-4/40 bg-chart-4/10 text-chart-4"
                        : "border-destructive/40 bg-destructive/10 text-destructive"
                    }
                  >
                    {p.in_stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
