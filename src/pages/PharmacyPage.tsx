// src/pages/PharmacyPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Pill, AlertTriangle, Package, DollarSign, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { PHARMACY_CATEGORIES } from '@/lib/constants';
import { usePharmacyItems, useAdjustPharmacyStock, useDeletePharmacyItem } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';

const PharmacyPage = () => {
  const { formatCurrency } = useSettings();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [txDialog, setTxDialog] = useState<{ id: string; name: string; type: 'in' | 'out' | 'adjustment' } | null>(null);
  const [txQty, setTxQty] = useState('');

  const { data, isLoading } = usePharmacyItems({
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

  const adjustStock = useAdjustPharmacyStock();

  const getStockStatus = (item: any) => {
    if (item.quantity <= item.min_quantity * 0.5) return { label: 'Critical', color: 'bg-destructive text-destructive-foreground' };
    if (item.quantity <= item.min_quantity) return { label: 'Low', color: 'bg-warning text-warning-foreground' };
    return { label: 'In Stock', color: 'bg-success text-success-foreground' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy</h1>
          <p className="text-sm text-muted-foreground">Manage medications and pharmaceutical stock</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Items', value: meta?.total ?? 0, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Total Value', value: formatCurrency(totalValue), icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Categories', value: new Set(items.map(i => i.category)).size, icon: Pill, color: 'text-info', bg: 'bg-info/10' },
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
            <Input placeholder="Search by name or barcode..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PHARMACY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={v => { setStockFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stock" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              : items.map(item => {
                  const stock = getStockStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        {item.generic_name && <div className="text-xs text-muted-foreground">{item.generic_name}</div>}
                      </TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell>
                        <div className="font-medium">{item.quantity} {item.unit}</div>
                        <div className="text-xs text-muted-foreground">Min: {item.min_quantity}</div>
                      </TableCell>
                      <TableCell className="text-sm">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-sm">
                        {item.expiry_date
                          ? new Date(item.expiry_date) < new Date()
                            ? <span className="text-destructive font-medium">{item.expiry_date} (Expired)</span>
                            : item.expiry_date
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell><Badge className={stock.color}>{stock.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
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
                adjustStock.mutate({ id: txDialog.id, quantity: parseInt(txQty), type: txDialog.type }, {
                  onSuccess: () => setTxDialog(null),
                });
              }
            }} disabled={!txQty || adjustStock.isPending}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyPage;
