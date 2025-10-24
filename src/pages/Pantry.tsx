import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Camera, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ImageUploader } from '@/components/pantry/ImageUploader';
import { DetectedItemCard } from '@/components/pantry/DetectedItemCard';
import { PantryItemCard } from '@/components/pantry/PantryItemCard';
import { ManualAddInput } from '@/components/pantry/ManualAddInput';
import { ShoppingListView } from '@/components/pantry/ShoppingListView';
import { mockImageDetection } from '@/utils/mockDetection';
import { DetectedItem, PantryItem, PantryUnit } from '@/types';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ViewMode = 'list' | 'detect' | 'shopping';

export default function Pantry() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    pantryItems,
    lastSyncAt,
    addPantryItem,
    addPantryItems,
    togglePantryItemUsed,
    removePantryItem,
    shoppingState,
    markShoppingItemBought,
    removeShoppingItem,
  } = useStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [editedItems, setEditedItems] = useState<Map<string, { name: string; qty: number; unit: PantryUnit }>>(new Map());

  const activeItems = pantryItems.filter(item => !item.used);
  const usedItems = pantryItems.filter(item => item.used);
  const showStaleWarning = lastSyncAt && 
    (Date.now() - new Date(lastSyncAt).getTime()) > 7 * 24 * 60 * 60 * 1000;

  // Check URL params for tab navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'shopping') {
      setViewMode('shopping');
    }
  }, [location.search]);

  useEffect(() => {
    if (uploadedImages.length > 0 && detectedItems.length === 0) {
      // Mock detection when images are uploaded
      const detected = mockImageDetection(uploadedImages.length);
      setDetectedItems(detected);
    }
  }, [uploadedImages, detectedItems.length]);

  const handleImagesChange = (images: string[]) => {
    setUploadedImages(images);
    if (images.length === 0) {
      setDetectedItems([]);
      setEditedItems(new Map());
    }
  };

  const handleStartDetection = () => {
    setViewMode('detect');
    setUploadedImages([]);
    setDetectedItems([]);
    setEditedItems(new Map());
  };

  const handleUpdateDetectedItem = (id: string, name: string, qty: number, unit: PantryUnit) => {
    setEditedItems(prev => new Map(prev).set(id, { name, qty, unit }));
  };

  const handleRemoveDetectedItem = (id: string) => {
    setDetectedItems(prev => prev.filter(item => item.id !== id));
    setEditedItems(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  };

  const handleSaveDetected = () => {
    const itemsToSave: PantryItem[] = detectedItems.map(detected => {
      const edited = editedItems.get(detected.id);
      return {
        id: `pantry-${Date.now()}-${Math.random()}`,
        name: edited?.name || detected.name,
        qty: edited?.qty || 1,
        unit: edited?.unit || 'pcs',
        source: 'photo' as const,
        confidence: detected.confidence,
        lastSeenAt: new Date().toISOString(),
        used: false,
      };
    });

    addPantryItems(itemsToSave);
    toast.success(`Added ${itemsToSave.length} items to pantry`);
    
    // Reset detection state
    setViewMode('list');
    setUploadedImages([]);
    setDetectedItems([]);
    setEditedItems(new Map());
  };

  const handleManualAdd = (name: string) => {
    const item: PantryItem = {
      id: `pantry-${Date.now()}-${Math.random()}`,
      name: name.toLowerCase(),
      qty: 1,
      unit: 'pcs',
      source: 'manual',
      lastSeenAt: new Date().toISOString(),
      used: false,
    };
    addPantryItem(item);
    toast.success(`Added ${name} to pantry`);
  };

  const handleToggleUsed = (id: string) => {
    const item = pantryItems.find(i => i.id === id);
    togglePantryItemUsed(id);
    
    if (item) {
      toast(
        item.used ? 'Moved to Active' : 'Marked as used',
        {
          action: {
            label: 'Undo',
            onClick: () => togglePantryItemUsed(id),
          },
        }
      );
    }
  };

  const handleRemoveItem = (id: string) => {
    const item = pantryItems.find(i => i.id === id);
    removePantryItem(id);
    
    if (item) {
      toast.success(`Removed ${item.name}`, {
        action: {
          label: 'Undo',
          onClick: () => addPantryItem(item),
        },
      });
    }
  };

  const handleMarkBought = (id: string) => {
    markShoppingItemBought(id);
    toast.success('Nice! Marked as bought — refresh your pantry when it arrives.');
  };

  const handleRemoveShoppingItem = (id: string) => {
    removeShoppingItem(id);
    toast.success('Removed from shopping list');
  };

  if (viewMode === 'detect') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Detect Ingredients</h1>
              <Button
                variant="ghost"
                onClick={() => setViewMode('list')}
              >
                Cancel
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Upload 2–3 photos of your fridge or pantry. I'll read the labels and detect ingredients.
              </AlertDescription>
            </Alert>

            <ImageUploader
              onImagesChange={handleImagesChange}
              maxImages={5}
            />

            {detectedItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Found {detectedItems.length} ingredients
                </h2>
                <p className="text-sm text-muted-foreground">
                  Edit names, quantities, or remove false detections before saving
                </p>
                
                <div className="space-y-3">
                  {detectedItems.map(item => (
                    <DetectedItemCard
                      key={item.id}
                      item={item}
                      onUpdate={handleUpdateDetectedItem}
                      onRemove={handleRemoveDetectedItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {detectedItems.length > 0 && (
          <div className="sticky bottom-0 border-t bg-card p-4 shadow-lg">
            <div className="max-w-2xl mx-auto">
              <Button
                onClick={handleSaveDetected}
                className="w-full h-14 text-lg font-semibold rounded-full"
                size="lg"
              >
                Save {detectedItems.length} detected items
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Pantry</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon className="h-6 w-6" />
            </Button>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="list">
                Pantry ({activeItems.length})
              </TabsTrigger>
              <TabsTrigger value="shopping">
                Shopping ({shoppingState.queue.filter(i => !i.bought).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {showStaleWarning && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                It's been a while — refresh your pantry with new photos?
              </AlertDescription>
            </Alert>
          )}

          {pantryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="bg-muted rounded-full p-8">
                <Camera className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Your pantry is empty</h2>
                <p className="text-muted-foreground max-w-md">
                  Upload 2–3 fridge photos — I'll read the labels.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Active Items */}
              {activeItems.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Active ({activeItems.length})
                  </h2>
                  <div className="space-y-3">
                    {activeItems.map(item => (
                      <PantryItemCard
                        key={item.id}
                        item={item}
                        onToggleUsed={handleToggleUsed}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Used Items */}
              {usedItems.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Used ({usedItems.length})
                  </h2>
                  <div className="space-y-3">
                    {usedItems.map(item => (
                      <PantryItemCard
                        key={item.id}
                        item={item}
                        onToggleUsed={handleToggleUsed}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add manually</h3>
            <ManualAddInput onAdd={handleManualAdd} />
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 border-t bg-card p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            onClick={handleStartDetection}
            className="flex-1 h-14 text-base font-semibold rounded-full"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            Detect from photos
          </Button>
          <Button
            onClick={() => navigate('/suggestion')}
            variant="outline"
            className="h-14 px-6 rounded-full"
            size="lg"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
