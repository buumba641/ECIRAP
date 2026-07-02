import { Wifi, Package } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProducts, getServices } from "@/lib/data"
import { formatCurrency } from "@/lib/format"
import { ProductFormButton } from "@/components/forms/product-form"
import { ServiceFormButton } from "@/components/forms/service-form"
import { DeleteButton } from "@/components/delete-button"
import { deleteProduct, deleteService } from "@/lib/actions"

const CATEGORY_ICONS: Record<string, string> = {
  Router: "📡",
  Antenna: "📶",
  MiFi: "📱",
  "Mesh System": "🔗",
  Cable: "🔌",
  Accessory: "🔧",
  Enterprise: "🏢",
}

const SERVICE_ICONS: Record<string, string> = {
  Bandwidth: "🌐",
  SLA: "📋",
  "Managed Service": "⚙️",
  Installation: "🔨",
  Support: "🛟",
}

export default async function ProductsPage() {
  const [products, services] = await Promise.all([
    getProducts(),
    getServices(),
  ])

  const totalProducts = products.length
  const inStock = products.filter((p) => p.in_stock).length
  const totalServices = services.length
  const activeServices = services.filter((s) => s.is_active).length

  return (
    <div>
      <PageHeader
        title="Products & Services"
        description="Complete catalog — hardware products and connectivity services powering Infratel Zambia's operations."
      >
        <div className="flex items-center gap-2">
          <ServiceFormButton />
          <ProductFormButton />
        </div>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Products</p>
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
            <p className="text-sm text-muted-foreground">Services</p>
            <p className="mt-1 text-xl font-semibold">{totalServices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active Services</p>
            <p className="mt-1 text-xl font-semibold text-chart-4">{activeServices}</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <div className="mb-4 flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">Hardware Products</h2>
      </div>

      {products.length === 0 && (
        <Card className="mb-6">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No products yet. Click &quot;New Product&quot; to add your first product.
          </CardContent>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Services Section */}
      <div className="mb-4 flex items-center gap-2">
        <Wifi className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">Connectivity Services</h2>
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No services yet. Click &quot;New Service&quot; to add your first service.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id} className="group transition-colors hover:border-primary/30">
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-lg">
                    {SERVICE_ICONS[s.category] ?? "🌐"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-tight">{s.name}</p>
                    <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                  </div>
                </div>
                <DeleteButton id={s.id} action={deleteService} />
              </div>

              {s.description && (
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {s.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div>
                  <p className="text-lg font-semibold">{formatCurrency(s.monthly_price)}/mo</p>
                  {s.setup_fee > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Setup: {formatCurrency(s.setup_fee)}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={
                    s.is_active
                      ? "border-chart-4/40 bg-chart-4/10 text-chart-4"
                      : "border-muted-foreground/40 bg-muted text-muted-foreground"
                  }
                >
                  {s.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
