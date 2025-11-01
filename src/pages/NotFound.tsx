import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
      </div>
      <div className="text-center relative z-10">
        <h1 className="mb-4 text-6xl font-extralight gradient-text">404</h1>
        <p className="mb-6 text-xl text-muted-foreground font-light">Oops! Page not found</p>
        <a href="/" className="text-primary underline-offset-4 hover:underline font-light">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
