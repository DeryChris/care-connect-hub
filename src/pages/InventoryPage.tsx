// src/pages/InventoryPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Package, AlertTriangle, TrendingUp, Clock, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { INVENTORY_CATEGORIES } from '@/lib/constants';
import { useInventory, useProcessInventoryTransaction, useDeleteInventoryItem } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';

const InventoryPage = () => {
  const { formatCurrency } = useSettings();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [txDialog, setTxDialog] = useState<{ id: string; name: string; type: 'in' | 'out' | 'adjustment' } | null>(null);
  const [txQty, setTxQty] = useState('');

  const { data, isLoading } = useInventory({
    search: search || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    low_stock: stockFilter === 'low' ? true : undefined,
    page,
    limit: 15,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalValue = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const lowStockCount = items.filter(i => i.quantity <= i.min_quantity).length;
  const soon = new Date(); soon.setDate(soon.getDate() + 30);
  const expiringCount = items.filter(i => i.expiry_date && new Date(i.expiry_date) <= soon && new Date(i.expiry_date) > new Date()).length;

  const processTransaction = useProcessInventoryTransaction();

  const getStockLevel = (item: any) => {
    const ratio = item.min_quantity > 0 ? item.quantity / item.min_quantity : 1;
    if (ratio <= 0.5) return { color: 'bg-destructive', label: 'Critical', badgeColor: 'bg-destructive text-destructive-foreground' };
    if (ratio <= 1) return { color: 'bg-warning', label: 'Low', badgeColor: 'bg-warning text-warning-foreground' };
    return { color: 'bg-success', label: 'OK', badgeColor: 'bg-success text-success-foreground' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="text-sm text-muted-foreground">Hospital supply and equipment management</p>
        </div>
        <Link to="/inventory/create">
          <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Items', value: meta?.total ?? 0, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Total Value', value: formatCurrency(totalValue), icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Expiring (30d)', value: expiringCount, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
        ].map(stat => (
          <Card key={stat.label} className="stat-card"><CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold font-display">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {INVENTORY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={v => { setStockFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stock" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              : items.map(item => {
                  const stock = getStockLevel(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.location}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{item.quantity} {item.unit}</div>
                            <div className="text-xs text-muted-foreground">Min: {item.min_quantity}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-sm">
                        {item.expiry_date
                          ? new Date(item.expiry_date) < new Date()
                            ? <span className="text-destructive">{item.expiry_date} (Expired)</span>
                            : item.expiry_date
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell><Badge className={stock.badgeColor}>{stock.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Link to={`/inventory/${item.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Stock In"
                            onClick={() => { setTxDialog({ id: item.id, name: item.name, type: 'in' }); setTxQty(''); }}>
                            <ArrowDownToLine className="h-3.5 w-3.5 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Stock Out"
                            onClick={() => { setTxDialog({ id: item.id, name: item.name, type: 'out' }); setTxQty(''); }}>
                            <ArrowUpFromLine className="h-3.5 w-3.5 text-warning" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
            }
            {!isLoading && items.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No items found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="px-3 py-1 text-sm text-muted-foreground bg-card rounded-md">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Next</Button>
        </div>
      )}

      <Dialog open={!!txDialog} onOpenChange={() => setTxDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{txDialog?.type === 'in' ? 'Stock In' : 'Stock Out'} — {txDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input type="number" min="1" placeholder="Enter quantity" value={txQty} onChange={e => setTxQty(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTxDialog(null)}>Cancel</Button>
            <Button onClick={() => {
              if (txDialog && txQty) {
                processTransaction.mutate({ id: txDialog.id, type: txDialog.type, quantity: parseInt(txQty) }, {
                  onSuccess: () => setTxDialog(null),
                });
              }
            }} disabled={!txQty || processTransaction.isPending}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
