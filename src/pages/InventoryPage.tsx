import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, Clock, ArrowDownToLine, ArrowUpFromLine, Settings2 } from 'lucide-react';
import { mockInventory } from '@/lib/mock-data';
import { INVENTORY_CATEGORIES, InventoryItem } from '@/lib/constants';
import { useSettings } from '@/contexts/SettingsContext';

const InventoryPage = () => {
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [txDialog, setTxDialog] = useState<{ item: InventoryItem; type: 'in' | 'out' | 'adjustment' } | null>(null);
  const [txQty, setTxQty] = useState('');
  const { formatCurrency } = useSettings();

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || i.category === categoryFilter;
      const matchStock = stockFilter === 'all' || (stockFilter === 'low' ? i.quantity <= i.min_quantity : i.quantity > i.min_quantity);
      return matchSearch && matchCategory && matchStock;
    });
  }, [items, search, categoryFilter, stockFilter]);

  // Stats
  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.quantity <= i.min_quantity).length;
  const totalValue = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const expiringCount = items.filter(i => {
    if (!i.expiry_date) return false;
    const diff = new Date(i.expiry_date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const stats = [
    { label: 'Total Items', value: totalItems, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Total Value', value: formatCurrency(totalValue), icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900' },
    { label: 'Expiring (30d)', value: expiringCount, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  const processTransaction = () => {
    if (!txDialog || !txQty) return;
    const qty = parseInt(txQty);
    if (isNaN(qty) || qty <= 0) return;

    setItems(prev => prev.map(i => {
      if (i.id !== txDialog.item.id) return i;
      if (txDialog.type === 'in') return { ...i, quantity: i.quantity + qty };
      if (txDialog.type === 'out') return { ...i, quantity: Math.max(0, i.quantity - qty) };
      return { ...i, quantity: qty }; // adjustment
    }));
    setTxDialog(null);
    setTxQty('');
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setDeleteId(null);
  };

  const getStockLevel = (item: InventoryItem) => {
    const ratio = item.min_quantity > 0 ? item.quantity / item.min_quantity : 1;
    if (ratio <= 0.5) return { color: 'bg-destructive', width: Math.max(10, ratio * 100) };
    if (ratio <= 1) return { color: 'bg-warning', width: Math.max(20, ratio * 100) };
    return { color: 'bg-primary', width: Math.min(100, ratio * 50) };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} items</p>
        </div>
        <Link to="/inventory/create">
          <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.label} className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold font-display text-foreground">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {INVENTORY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stock" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="ok">In Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => {
                const stock = getStockLevel(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className={`text-sm ${item.quantity <= item.min_quantity ? 'text-destructive font-medium' : ''}`}>
                          {item.quantity} {item.unit}
                        </span>
                        <div className="h-1.5 w-16 rounded-full bg-muted">
                          <div className={`h-full rounded-full ${stock.color}`} style={{ width: `${stock.width}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{item.expiry_date || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Stock In" onClick={() => setTxDialog({ item, type: 'in' })}>
                          <ArrowDownToLine className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Stock Out" onClick={() => setTxDialog({ item, type: 'out' })}>
                          <ArrowUpFromLine className="h-4 w-4 text-warning" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Adjust" onClick={() => setTxDialog({ item, type: 'adjustment' })}>
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Link to={`/inventory/${item.id}/edit`}>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No items found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={!!txDialog} onOpenChange={() => { setTxDialog(null); setTxQty(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {txDialog?.type === 'in' ? 'Stock In' : txDialog?.type === 'out' ? 'Stock Out' : 'Stock Adjustment'}
              {txDialog && ` — ${txDialog.item.name}`}
            </DialogTitle>
            <DialogDescription>
              Current stock: {txDialog?.item.quantity} {txDialog?.item.unit}
              {txDialog?.type === 'adjustment' && ' (enter the new total quantity)'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tx-qty">Quantity *</Label>
              <Input id="tx-qty" type="number" min={1} value={txQty} onChange={e => setTxQty(e.target.value)} placeholder="Enter quantity" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTxDialog(null); setTxQty(''); }}>Cancel</Button>
            <Button onClick={processTransaction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>Are you sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteItem(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
