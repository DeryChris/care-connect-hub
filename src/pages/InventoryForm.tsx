import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from '@/lib/constants';

const InventoryForm = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/inventory');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">Add Inventory Item</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Item Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input id="name" required placeholder="Enter item name" />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {INVENTORY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {INVENTORY_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="init_qty">Initial Quantity</Label>
              <Input id="init_qty" type="number" min={0} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_qty">Minimum Quantity *</Label>
              <Input id="min_qty" type="number" min={0} required placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input id="unit_price" type="number" min={0} step={0.01} required placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" placeholder="Supplier name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Shelf A1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" placeholder="Item barcode" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes..." rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit"><Save className="h-4 w-4 mr-2" />Save Item</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
