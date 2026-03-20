// src/pages/InventoryForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from '@/lib/constants';
import { useCreateInventoryItem, useUpdateInventoryItem, useInventoryItem } from '@/hooks';

const InventoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existing } = useInventoryItem(id ?? '');
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const [formData, setFormData] = useState({
    name: '', category: 'Medicine', unit: 'pcs',
    quantity: 0, min_quantity: 0, unit_price: 0,
    supplier: '', location: '', expiry_date: '',
    barcode: '', notes: '',
  });

  useEffect(() => {
    if (existing?.data) {
      const i = existing.data;
      setFormData({
        name: i.name ?? '', category: i.category ?? 'Medicine',
        unit: i.unit ?? 'pcs', quantity: i.quantity ?? 0,
        min_quantity: i.min_quantity ?? 0, unit_price: i.unit_price ?? 0,
        supplier: i.supplier ?? '', location: i.location ?? '',
        expiry_date: i.expiry_date ?? '', barcode: i.barcode ?? '',
        notes: i.notes ?? '',
      });
    }
  }, [existing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target as HTMLInputElement;
    setFormData(p => ({ ...p, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updateItem.mutate({ id, data: formData }, { onSuccess: () => navigate('/inventory') });
    } else {
      createItem.mutate(formData, { onSuccess: () => navigate('/inventory') });
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="page-title">{isEdit ? 'Edit Item' : 'Add Inventory Item'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Item Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input id="name" required placeholder="Enter item name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVENTORY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select value={formData.unit} onValueChange={v => setFormData(p => ({ ...p, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVENTORY_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Quantity</Label>
              <Input id="quantity" type="number" min="0" value={formData.quantity} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_quantity">Minimum Quantity *</Label>
              <Input id="min_quantity" type="number" min="0" required value={formData.min_quantity} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input id="unit_price" type="number" min="0" step="0.01" required value={formData.unit_price} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" placeholder="Supplier name" value={formData.supplier} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input id="location" placeholder="e.g. Shelf A1" value={formData.location} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input id="expiry_date" type="date" value={formData.expiry_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" placeholder="Barcode / SKU" value={formData.barcode} onChange={handleChange} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes" value={formData.notes} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />{isPending ? 'Saving...' : 'Save Item'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
