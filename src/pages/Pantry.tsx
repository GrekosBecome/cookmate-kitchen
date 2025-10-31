import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/pantry/ImageUploader';
import { PantryItemCard } from '@/components/pantry/PantryItemCard';
import { ManualAddInput } from '@/components/pantry/ManualAddInput';
import { ShoppingListView } from '@/components/pantry/ShoppingListView';
import { DetectedItemCard } from '@/components/pantry/DetectedItemCard';
import { AddOptionsSheet } from '@/components/pantry/AddOptionsSheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Camera, Info, ChefHat, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FloatingButtons } from '@/components/FloatingButtons';
import { analyzeImagesForFood, detectIngredientsFromImages } from '@/utils/visionDetection';
import { DetectedItem, PantryItem, PantryUnit } from '@/types';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ViewMode = 'list' | 'detect' | 'shopping' | 'manual';

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
  const [isDetecting, setIsDetecting] = useState(false);
  const [showBorderlineDialog, setShowBorderlineDialog] = useState(false);
  const [borderlineCoverage, setBorderlineCoverage] = useState(0);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [autoAction, setAutoAction] = useState<'camera' | 'gallery' | null>(null);

  const activeItems = pantryItems.filter(item => !item.used);
  const usedItems = pantryItems.filter(item => item.used);
  const showStaleWarning = lastSyncAt && 
    (Date.now() - new Date(lastSyncAt).getTime()) > 7 * 24 * 60 * 60 * 1000;

  // Check URL params for tab navigation
  useEffect(() => {
    track('opened_screen', { screen: 'pantry', tab: viewMode });
    
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'shopping') {
      setViewMode('shopping');
    }
  }, [location.search]);

  useEffect(() => {
    if (uploadedImages.length > 0 && detectedItems.length === 0 && !isDetecting) {
      setIsDetecting(true);
      
      // Step 1: Validate images for food content and no people
      analyzeImagesForFood(uploadedImages)
        .then(validation => {
          if (!validation.success) {
            // Validation failed - show error and clear images
            toast.error(validation.error || 'Image validation failed');
            setUploadedImages([]);
            setDetectedItems([]);
            setIsDetecting(false);
            return;
          }
          
          // Check for borderline cases (uncertain detection)
          if (validation.borderline && validation.coveragePercent) {
            setBorderlineCoverage(validation.coveragePercent);
            setShowBorderlineDialog(true);
            setIsDetecting(false);
            return;
          }
          
          // Step 2: Images passed validation, proceed with ingredient detection
          return detectIngredientsFromImages(uploadedImages)
            .then(detected => {
              setDetectedItems(detected);
              if (detected.length > 0) {
                toast.success(`Found ${detected.length} ingredients in your photos`);
              } else {
                toast.info('No ingredients detected. Try different photos or add items manually.');
              }
            });
        })
        .catch(error => {
          console.error('Detection failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          if (errorMessage.includes('Invalid API key') || errorMessage.includes('API_KEY_INVALID')) {
            toast.error('Invalid API key. Please check your API keys in settings.');
          } else if (errorMessage.includes('timeout')) {
            toast.error('Request timed out. Please try with fewer or smaller images.');
          } else {
            toast.error("Couldn't analyze this photo right now — please try again later 🌿");
          }
          
          // Clear state to allow retry
          setUploadedImages([]);
          setDetectedItems([]);
        })
        .finally(() => {
          setIsDetecting(false);
        });
    }
  }, [uploadedImages, detectedItems.length, isDetecting]);

  const handleProceedWithBorderline = () => {
    setShowBorderlineDialog(false);
    setIsDetecting(true);
    
    detectIngredientsFromImages(uploadedImages)
      .then(detected => {
        setDetectedItems(detected);
        if (detected.length > 0) {
          toast.success(`Found ${detected.length} ingredients in your photos`);
        } else {
          toast.info('No ingredients detected. Try different photos or add items manually.');
        }
      })
      .catch(error => {
        console.error('Detection failed:', error);
        toast.error("Couldn't analyze this photo right now — please try again later 🌿");
        setUploadedImages([]);
        setDetectedItems([]);
      })
      .finally(() => {
        setIsDetecting(false);
      });
  };

  const handleRetryBorderline = () => {
    setShowBorderlineDialog(false);
    setUploadedImages([]);
    setDetectedItems([]);
    setBorderlineCoverage(0);
  };

  const handleImagesChange = (images: string[]) => {
    setUploadedImages(images);
    if (images.length === 0) {
      setDetectedItems([]);
      setEditedItems(new Map());
    }
  };

  const handleStartDetection = () => {
    track('clicked_cta', { action: 'detect_photos' });
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
    track('pantry_scan', { itemsCount: itemsToSave.length });
    toast.success(`Added ${itemsToSave.length} items to pantry`);
    
    // Reset detection state
    setViewMode('list');
    setUploadedImages([]);
    setDetectedItems([]);
    setEditedItems(new Map());
  };

  const handleManualAdd = (name: string, qty: number, unit: PantryUnit) => {
    const item: PantryItem = {
      id: `pantry-${Date.now()}-${Math.random()}`,
      name: name.toLowerCase(),
      qty,
      unit,
      source: 'manual',
      lastSeenAt: new Date().toISOString(),
      used: false,
    };
    addPantryItem(item);
    toast.success(`Added ${name} 🍎`);
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
    const item = shoppingState.queue.find(i => i.id === id);
    markShoppingItemBought(id);
    toast.success(item ? `✓ ${item.name} marked as bought — pantry restocked!` : 'Marked as bought', {
      duration: 4000,
    });
  };

  const handleRemoveShoppingItem = (id: string) => {
    removeShoppingItem(id);
    toast.success('Removed from shopping list');
  };

  if (viewMode === 'detect') {
    return (
      <div 
        className="min-h-screen bg-background flex flex-col pb-28"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 112px)',
        }}
      >
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Detect Ingredients</h1>
              <Button
                variant="ghost"
                onClick={() => {
                  setViewMode('list');
                  setAutoAction(null);
                }}
                className="h-11 min-h-[44px]"
              >
                Cancel
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Upload 2–3 photos of your fridge or pantry. I'll read the labels and detect ingredients.
              </AlertDescription>
            </Alert>

            <ImageUploader
              onImagesChange={handleImagesChange}
              maxImages={5}
              autoOpenCamera={autoAction === 'camera'}
              autoOpenGallery={autoAction === 'gallery'}
            />

            {isDetecting && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-sm text-muted-foreground">Analyzing your photos...</p>
              </div>
            )}

            {detectedItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Found {detectedItems.length} ingredients
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
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
          <div 
            className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm z-40"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)',
            }}
          >
            <div className="max-w-2xl mx-auto p-4">
              <Button
                onClick={handleSaveDetected}
                className="w-full h-12 sm:h-14 min-h-[44px] text-sm sm:text-base font-semibold rounded-full"
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
    <div 
      className="min-h-screen bg-background pb-28"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 112px)',
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewMode === 'manual' ? setViewMode('list') : navigate('/suggestion')}
            className="gap-2 h-11 min-h-[44px]"
            aria-label="Back to suggestions"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Button>
        </div>

        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Your Pantry</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {lastSyncAt
              ? `Last updated ${Math.floor((Date.now() - new Date(lastSyncAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
              : 'Start by adding ingredients'}
          </p>
        </header>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="list" className="text-sm sm:text-base">
              Pantry ({activeItems.length})
            </TabsTrigger>
            <TabsTrigger value="shopping" className="text-sm sm:text-base">
              Shopping ({shoppingState.queue.filter(i => !i.bought).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {showStaleWarning && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              It's been a while — refresh your pantry with new photos?
            </AlertDescription>
          </Alert>
        )}

        {viewMode === 'shopping' ? (
          <ShoppingListView
            shoppingItems={shoppingState.queue}
            onMarkBought={handleMarkBought}
            onRemove={handleRemoveShoppingItem}
          />
        ) : pantryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="bg-muted rounded-full p-8">
              <Camera className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2 px-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Your pantry is empty</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                Upload 2–3 fridge photos — I'll read the labels.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Active Items */}
            {activeItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">
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
                <h2 className="text-lg sm:text-xl font-semibold">
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
      </div>

      {/* Floating Add Button */}
      {viewMode === 'list' && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-40"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
          }}
        >
          <div className="max-w-2xl mx-auto px-4">
            <Button
              onClick={() => setShowAddOptions(true)}
              size="lg"
              className="w-full h-14 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="h-6 w-6 mr-2" />
              Add Ingredients
            </Button>
          </div>
        </div>
      )}

      {/* Manual Add View */}
      {viewMode === 'manual' && (
        <div 
          className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm z-40"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)',
          }}
        >
          <div className="max-w-2xl mx-auto p-4">
            <ManualAddInput onAdd={(name, qty, unit) => {
              handleManualAdd(name, qty, unit);
              setViewMode('list');
            }} />
          </div>
        </div>
      )}

      {/* Add Options Sheet */}
      <AddOptionsSheet
        open={showAddOptions}
        onOpenChange={setShowAddOptions}
        onCameraClick={() => {
          track('clicked_cta', { action: 'detect_camera' });
          setAutoAction('camera');
          setViewMode('detect');
          setUploadedImages([]);
          setDetectedItems([]);
          setEditedItems(new Map());
        }}
        onPhotosClick={() => {
          track('clicked_cta', { action: 'detect_gallery' });
          setAutoAction('gallery');
          setViewMode('detect');
          setUploadedImages([]);
          setDetectedItems([]);
          setEditedItems(new Map());
        }}
        onManualClick={() => {
          track('clicked_cta', { action: 'manual_add' });
          setViewMode('manual');
        }}
      />

      {/* Borderline Detection Dialog */}
      <AlertDialog open={showBorderlineDialog} onOpenChange={setShowBorderlineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Uncertain Food Detection
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                We detected some food in your photo, but the coverage is low ({borderlineCoverage}%).
              </p>
              <p className="text-sm">
                For better results, try taking a closer shot of your ingredients. Or you can proceed with the current photo.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRetryBorderline}>
              Try Different Photo
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleProceedWithBorderline}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
