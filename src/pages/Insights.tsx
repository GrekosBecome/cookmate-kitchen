import { getInsights, clearAnalytics } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Insights = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(getInsights());

  useEffect(() => {
    setInsights(getInsights());
  }, []);

  const handleClear = () => {
    if (confirm('Clear all analytics data?')) {
      clearAnalytics();
      setInsights(getInsights());
    }
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'Never';
    const date = new Date(isoDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="min-h-screen bg-background pb-24"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
      }}
    >
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Analytics</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="min-h-[44px] min-w-[44px]"
            aria-label="Clear analytics"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{insights.totalSessions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Recipes Cooked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{insights.recipesCompleted}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Pantry Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{insights.pantryScans}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Chat Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{insights.chatMessages}</p>
            </CardContent>
          </Card>
        </div>

        {/* Last Cooking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last Cooking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatDate(insights.lastCookingDate)}</p>
          </CardContent>
        </Card>

        {/* Favorite Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Favorite Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(insights.favoriteActions)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([action, count]) => (
                <div key={action} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{action.replace(/_/g, ' ')}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            {Object.keys(insights.favoriteActions).length === 0 && (
              <p className="text-sm text-muted-foreground">No actions yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.recentEvents.map((event, i) => (
              <div key={i} className="flex justify-between items-start text-xs border-b border-border/50 pb-2 last:border-0">
                <div className="space-y-1 flex-1">
                  <p className="font-medium">{event.event}</p>
                  {event.data && (
                    <p className="text-muted-foreground">
                      {JSON.stringify(event.data, null, 2)}
                    </p>
                  )}
                </div>
                <span className="text-muted-foreground whitespace-nowrap ml-2">
                  {new Date(event.ts).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {insights.recentEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
