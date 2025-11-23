import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ItemForm } from '@/components/items/ItemForm';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { useToast } from '@/hooks/use-toast';

export default function ItemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem, updateItem } = useInventoryStore();
  const { toast } = useToast();
  
  const item = id ? items.find(i => i.id === id) : undefined;
  const isEdit = !!id;

  const handleSubmit = (data: any) => {
    try {
      if (isEdit && item) {
        updateItem(item.id, data);
        toast({
          title: "Item updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Check for duplicate SKU
        const existingItem = items.find(i => i.sku === data.sku);
        if (existingItem) {
          toast({
            title: "Duplicate SKU",
            description: "An item with this SKU already exists.",
            variant: "destructive",
          });
          return;
        }
        
        addItem(data);
        toast({
          title: "Item added",
          description: `${data.name} has been added to inventory.`,
        });
      }
      navigate('/items');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate('/items');
  };

  // If editing and item not found
  if (isEdit && !item) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The item you're trying to edit doesn't exist.
          </p>
          <button 
            onClick={() => navigate('/items')}
            className="text-primary hover:underline"
          >
            Back to Items
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Edit Item' : 'Add New Item'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit 
              ? 'Update the item details below'
              : 'Fill in the details to add a new item to your inventory'
            }
          </p>
        </div>

        <ItemForm
          item={item}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </AppLayout>
  );
}