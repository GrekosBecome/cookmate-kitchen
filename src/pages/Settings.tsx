import { useNavigate } from 'react-router-dom';
import { useStore, defaultPreferences } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SelectableChip } from '@/components/SelectableChip';
import { ServingsStepper } from '@/components/ServingsStepper';
import { ArrowLeft, Trash2, Brain, TrendingUp, Bell, Utensils, Users, Target, Shield, ChevronRight, HelpCircle, CreditCard, Zap, RefreshCw, Settings as SettingsIcon, RotateCcw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getTopTags } from '@/lib/learning';
import { useState, useEffect } from 'react';
import { NotificationPermission } from '@/components/NotificationPermission';
import { notificationService } from '@/lib/notifications';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { track } from '@/lib/analytics';
import { ProfileHeader } from '@/components/settings/ProfileHeader';
import { PreferenceSummaryCard } from '@/components/settings/PreferenceSummaryCard';
import { GoalsSection } from '@/components/settings/GoalsSection';
import { useSubscription } from '@/hooks/useSubscription';
import { useInAppPurchases } from '@/hooks/useInAppPurchases';
import { Progress } from '@/components/ui/progress';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 4 }, (_, i) => {
  const hour = 7 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { preferences, updatePreferences, reset, learning, resetLearning, memory, updateMemory } = useStore();
  const [showResetLearningDialog, setShowResetLearningDialog] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Subscription hook
  const {
    subscription,
    usage,
    loading: subscriptionLoading,
    getUsagePercentage,
    getDaysUntilTrialEnd,
    formatDate,
  } = useSubscription();
  const { 
    isNative,
    isInitialized,
    products, 
    loading: purchaseLoading, 
    restoring, 
    purchaseProduct, 
    restorePurchases,
    presentCustomerCenter,
    getManagementURL 
  } = useInAppPurchases();
  
  useEffect(() => {
    track('opened_screen', { screen: 'settings' });
    
    // Check notification permission status
    const checkPermission = async () => {
      const granted = await notificationService.checkPermission();
      setPermissionDenied(!granted);
    };
    checkPermission();
  }, []);

  const currentPrefs = preferences || defaultPreferences;
  const topTags = getTopTags(learning, 8);
  const likedTags = topTags.filter(t => t.weight > 0);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleToggleGoal = (goalId: string) => {
    const currentGoals = currentPrefs.cookingGoals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(g => g !== goalId)
      : [...currentGoals, goalId];
    updatePreferences({ cookingGoals: newGoals });
  };

  const handleToggleAllergy = (allergy: string) => {
    const newAllergies = currentPrefs.allergies.includes(allergy)
      ? currentPrefs.allergies.filter(a => a !== allergy)
      : [...currentPrefs.allergies, allergy];
    updatePreferences({ allergies: newAllergies });
  };

  const handleDietChange = (diet: string) => {
    track('diet_changed', { diet });
    updatePreferences({ diet: diet as any });
  };

  const handleNotificationTimeChange = async (time: string) => {
    updatePreferences({ notificationTime: time });
    
    // Reschedule notifications with new time
    if (currentPrefs.notificationDays.length > 0) {
      await notificationService.scheduleNotifications({
        enabled: true,
        time,
        days: currentPrefs.notificationDays
      });
    }
  };

  const toggleDay = async (day: string) => {
    const newDays = currentPrefs.notificationDays.includes(day)
      ? currentPrefs.notificationDays.filter(d => d !== day)
      : [...currentPrefs.notificationDays, day];
    updatePreferences({ notificationDays: newDays });
    
    // Reschedule notifications with new days
    await notificationService.scheduleNotifications({
      enabled: newDays.length > 0,
      time: currentPrefs.notificationTime,
      days: newDays
    });
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.testNotification();
      sonnerToast.success('Test notification sent!', {
        description: notificationService.isNativePlatform() 
          ? 'Check your notification center' 
          : 'Notifications will appear when app is open'
      });
    } catch (error) {
      sonnerToast.error('Failed to send test notification', {
        description: String(error)
      });
    }
  };

  const handleServingsChange = (servings: number) => {
    updatePreferences({ servings });
  };

  const handlePrivacyToggle = (checked: boolean) => {
    updatePreferences({ privacyNoStoreImages: checked });
  };
  
  const handleMemoryToggle = (checked: boolean) => {
    updateMemory({ memoryLearningEnabled: checked });
    toast({
      title: checked ? "Memory enabled" : "Memory disabled",
      description: checked 
        ? "We'll remember your preferences and adapt over time." 
        : "We'll stop tracking your cooking patterns.",
    });
  };

  const handleManageSubscription = async () => {
    if (isNative) {
      // Native apps: Use RevenueCat Customer Center
      await presentCustomerCenter();
    } else {
      // Web: Open management URL
      const url = await getManagementURL();
      if (url) {
        window.open(url, '_blank');
      } else {
        sonnerToast.info('Subscription management is available in the mobile app');
      }
    }
  };

  const handleNativePurchase = async (productId: string) => {
    await purchaseProduct(productId);
  };

  const handleRestorePurchases = async () => {
    await restorePurchases();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDeleteAllData = () => {
    reset();
    toast({
      title: "All data cleared",
      description: "Your preferences and pantry have been reset.",
    });
    navigate('/');
  };

  const handleResetLearning = () => {
    resetLearning();
    setShowResetLearningDialog(false);
    toast({
      title: "Learning data reset",
      description: "Your personalization has been cleared.",
    });
  };

  const commonAllergies = ['Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Soy', 'Gluten', 'Fish'];

  return (
    <div 
      className="min-h-screen bg-background pb-20"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
      }}
    >
      <div className="container max-w-2xl mx-auto px-4 py-4 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/suggestion')}
          className="gap-2 h-11 min-h-[44px]"
          aria-label="Back to suggestions"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Button>

        <header>
          <h1 className="text-2xl sm:text-3xl font-bold">You</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Your kitchen, your rules
          </p>
        </header>

        <ProfileHeader />

        {/* Summary Cards */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          <PreferenceSummaryCard
            icon={Utensils}
            label="Diet"
            value={currentPrefs.diet}
            onClick={() => toggleSection('diet')}
          />
          <PreferenceSummaryCard
            icon={Bell}
            label="Notify"
            value={`${currentPrefs.notificationDays.length} days`}
            onClick={() => toggleSection('notifications')}
          />
          <PreferenceSummaryCard
            icon={Users}
            label="Servings"
            value={currentPrefs.servings.toString()}
            onClick={() => toggleSection('servings')}
          />
        </div>

        {/* Subscription & Usage Section */}
        {!subscriptionLoading && subscription && usage && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">Subscription</h2>
            </div>

            {/* Subscription Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  {subscription.subscription_status === 'trial' && getDaysUntilTrialEnd() !== null && (
                    `Trial ends in ${getDaysUntilTrialEnd()} days`
                  )}
                  {subscription.subscription_status === 'premium' && 'Premium active'}
                  {subscription.subscription_status === 'free' && 'Free tier'}
                  {subscription.subscription_status === 'expired' && 'Trial has expired - upgrade to continue'}
                  {subscription.subscription_status === 'cancelled' && 'Subscription cancelled'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Label>Status</Label>
                  <Badge variant={subscription.subscription_status === 'premium' || subscription.subscription_status === 'trial' ? 'default' : 'secondary'}>
                    {subscription.subscription_status === 'trial' && '🎁 Trial'}
                    {subscription.subscription_status === 'premium' && '⭐ Premium'}
                    {subscription.subscription_status === 'free' && 'Free'}
                    {subscription.subscription_status === 'expired' && '⏰ Expired'}
                    {subscription.subscription_status === 'cancelled' && '❌ Cancelled'}
                  </Badge>
                </div>
                
                {/* Trial Countdown (if in trial) */}
                {subscription.subscription_status === 'trial' && (
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-sm font-medium">
                      Your trial ends on {formatDate(subscription.trial_end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      After trial, you'll be charged €{subscription.price_amount}/month
                    </p>
                  </div>
                )}
                
                {/* Renewal Info (if premium) */}
                {subscription.subscription_status === 'premium' && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>Next billing date</Label>
                      <span className="text-sm">{formatDate(subscription.next_billing_date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Price</Label>
                      <span className="text-sm">€{subscription.price_amount}/month</span>
                    </div>
                  </>
                )}
                
                <Separator />
                
                {/* Manage Subscription Button - Only show if user has active paid subscription */}
                {subscription.subscription_status === 'premium' && (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleManageSubscription}
                    disabled={purchaseLoading || restoring || (isNative && !isInitialized)}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Manage Subscription
                    {isNative && !isInitialized && (
                      <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>
                    )}
                  </Button>
                )}
                
                {/* Upgrade Button - Show for trial and free users */}
                {(subscription.subscription_status === 'trial' || subscription.subscription_status === 'free' || subscription.subscription_status === 'expired') && (
                  <Button 
                    className="w-full gap-2"
                    onClick={() => navigate('/settings')}
                  >
                    <Zap className="h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                )}
                
                {/* REQUIRED: Restore Purchases Button (Native only) */}
                {isNative && (
                  <Button 
                    variant="ghost" 
                    className="w-full gap-2"
                    onClick={handleRestorePurchases}
                    disabled={purchaseLoading || restoring}
                  >
                    {restoring ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Restoring...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Restore Purchases
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Usage Limits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage This Month
                </CardTitle>
                <CardDescription>
                  Resets on {formatDate(usage.reset_date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Analysis Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Image Analysis</Label>
                    <span className="text-muted-foreground">
                      {usage.image_analysis_used}/{subscription.image_analysis_limit}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage('image')} className="h-2" />
                </div>
                
                {/* Recipes Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Recipes</Label>
                    <span className="text-muted-foreground">
                      {usage.ai_recipe_used}/{subscription.ai_recipe_limit}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage('recipe')} className="h-2" />
                </div>
                
                {/* Chat Messages Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Chat Messages</Label>
                    <span className="text-muted-foreground">
                      {usage.chat_messages_used}/{subscription.chat_message_limit}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage('chat')} className="h-2" />
                </div>
                
                {/* Upgrade Button (if free) */}
                {subscription.subscription_status === 'free' && (
                  <>
                    <Separator />
                    <Button className="w-full gap-2">
                      <Zap className="h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Terms & Privacy Links */}
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <button onClick={() => navigate('/terms')} className="hover:underline">
                Terms of Service
              </button>
              <span>•</span>
              <button onClick={() => navigate('/privacy')} className="hover:underline">
                Privacy Policy
              </button>
              <span>•</span>
              <button onClick={() => navigate('/support')} className="hover:underline">
                Support
              </button>
            </div>
          </div>
        )}

        {/* Preferences Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Utensils className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Preferences</h2>
          </div>

          <Card>
            <button
              onClick={() => toggleSection('diet')}
              className="w-full"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="text-left">
                  <CardTitle>Diet Preference</CardTitle>
                  <CardDescription>Choose your dietary style</CardDescription>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${expandedSection === 'diet' ? 'rotate-90' : ''}`} />
              </CardHeader>
            </button>
            {expandedSection === 'diet' && (
              <CardContent className="pt-0">
                <div className="flex gap-2 flex-wrap">
                  {['Regular', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Gluten-free'].map((diet) => (
                    <SelectableChip
                      key={diet}
                      label={diet}
                      selected={currentPrefs.diet === diet}
                      onToggle={() => handleDietChange(diet)}
                    />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <button
              onClick={() => toggleSection('allergies')}
              className="w-full"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="text-left">
                  <CardTitle>Allergies & Intolerances</CardTitle>
                  <CardDescription>Help us filter recipes for you</CardDescription>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${expandedSection === 'allergies' ? 'rotate-90' : ''}`} />
              </CardHeader>
            </button>
            {expandedSection === 'allergies' && (
              <CardContent className="pt-0">
                <div className="flex gap-2 flex-wrap">
                  {commonAllergies.map((allergy) => (
                    <SelectableChip
                      key={allergy}
                      label={allergy}
                      selected={currentPrefs.allergies.includes(allergy)}
                      onToggle={() => handleToggleAllergy(allergy)}
                    />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <button
              onClick={() => toggleSection('goals')}
              className="w-full"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="text-left">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Cooking Goals
                  </CardTitle>
                  <CardDescription>What matters most to you?</CardDescription>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${expandedSection === 'goals' ? 'rotate-90' : ''}`} />
              </CardHeader>
            </button>
            {expandedSection === 'goals' && (
              <CardContent className="pt-0">
                <GoalsSection
                  selectedGoals={currentPrefs.cookingGoals || []}
                  onToggleGoal={handleToggleGoal}
                />
              </CardContent>
            )}
          </Card>

          <Card>
            <button
              onClick={() => toggleSection('notifications')}
              className="w-full"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="text-left">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Daily recipe suggestions</CardDescription>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${expandedSection === 'notifications' ? 'rotate-90' : ''}`} />
              </CardHeader>
            </button>
            {expandedSection === 'notifications' && (
              <CardContent className="space-y-4 pt-0">
                {/* Compact Permission Warning */}
                {permissionDenied && (
                  <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-start gap-2">
                    <Bell className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        Notifications are blocked
                      </p>
                      <p className="text-orange-700 dark:text-orange-300 text-xs mt-1">
                        Enable them in Settings → Kitchen Mate → Notifications
                      </p>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <Label htmlFor="time-select">Time</Label>
                  <Select
                    value={currentPrefs.notificationTime}
                    onValueChange={handleNotificationTimeChange}
                  >
                    <SelectTrigger id="time-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Days</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {DAYS.map((day) => (
                      <SelectableChip
                        key={day}
                        label={day}
                        selected={currentPrefs.notificationDays.includes(day)}
                        onToggle={() => toggleDay(day)}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTestNotification}
                  className="w-full gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Send Test Notification
                </Button>
              </CardContent>
            )}
          </Card>

          <Card>
            <button
              onClick={() => toggleSection('servings')}
              className="w-full"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="text-left">
                  <CardTitle>Servings</CardTitle>
                  <CardDescription>Default number of servings</CardDescription>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${expandedSection === 'servings' ? 'rotate-90' : ''}`} />
              </CardHeader>
            </button>
            {expandedSection === 'servings' && (
              <CardContent className="pt-0">
                <ServingsStepper
                  value={currentPrefs.servings}
                  onChange={handleServingsChange}
                />
              </CardContent>
            )}
          </Card>
        </div>

        {/* Privacy & Data Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Privacy & Data</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>You're in control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Process photos locally</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep your kitchen private
                  </p>
                </div>
                <Switch
                  checked={currentPrefs.privacyNoStoreImages || false}
                  onCheckedChange={handlePrivacyToggle}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow memory learning</Label>
                  <p className="text-sm text-muted-foreground">
                    Let Chef remember your preferences
                  </p>
                </div>
                <Switch
                  checked={memory.memoryLearningEnabled}
                  onCheckedChange={handleMemoryToggle}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive">
                      <Trash2 className="h-4 w-4" />
                      Start fresh
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Start fresh?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This clears your pantry and settings — but not your good taste. You can always rebuild.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep everything</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllData} className="bg-destructive hover:bg-destructive/90">
                        Clear all data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Learning
              </CardTitle>
              <CardDescription>
                We learn your taste over time — you can reset this anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {likedTags.length > 0 && (
                <div className="space-y-2">
                  <Label>Liked Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {likedTags.map(({ tag, weight }) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {tag} (+{weight.toFixed(1)})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {likedTags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No learning data yet. Keep using the app to personalize your suggestions!
                </p>
              )}

              <Button
                variant="outline"
                onClick={() => setShowResetLearningDialog(true)}
                className="w-full hover:bg-muted"
              >
                Reset learning
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/support')}
              className="w-full gap-2 h-11 min-h-[44px]"
            >
              <HelpCircle className="h-5 w-5" />
              Support & Help
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await supabase.auth.signOut();
                  sonnerToast.success('Logged out successfully');
                  navigate('/auth', { replace: true });
                } catch (error: any) {
                  console.error('Logout error:', error);
                  sonnerToast.error('Failed to logout');
                }
              }}
              className="w-full gap-2 h-11 min-h-[44px] hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <ArrowLeft className="h-5 w-5" />
              Logout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center italic">
              Made with ❤️ and a dash of logic. Your data lives on your device—always.
            </p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showResetLearningDialog} onOpenChange={setShowResetLearningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your learning?</AlertDialogTitle>
            <AlertDialogDescription>
              We'll forget your preferences, but you can always rebuild them. Your pantry and settings stay safe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep learning</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetLearning} className="bg-muted hover:bg-muted/80 text-foreground">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
