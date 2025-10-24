import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function RecipeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="p-4 flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm border-b">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Recipe Details</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center">
            <p className="text-muted-foreground">Recipe image placeholder</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Recipe Title</h2>
            <div className="flex gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>30 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>2 servings</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ingredients</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Instructions</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>

          <Button className="w-full h-14 rounded-full text-lg">
            Start Cooking
          </Button>
        </div>
      </div>
    </div>
  );
}
