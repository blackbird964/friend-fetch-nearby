
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAppContext } from '@/context/AppContext';
import { Mail, GithubIcon } from 'lucide-react';

const LoginForm: React.FC<{ onToggleForm: () => void }> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated, setCurrentUser } = useAppContext();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // For demo, simulate a login
    setTimeout(() => {
      // Demo credentials for easy testing
      if (email === 'demo@example.com' && password === 'password') {
        setIsAuthenticated(true);
        setCurrentUser({
          id: 'current',
          name: 'Alex',
          email: 'demo@example.com',
          profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
          age: 29,
          gender: 'Non-Binary',
          interests: ['Gaming', 'Movies', 'Art'],
          bio: 'Looking for friends to explore the city with!',
          location: { lat: 40.730610, lng: -73.935242 },
        });
        toast({
          title: "Success!",
          description: "You have been logged in",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid credentials. Try demo@example.com / password",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Google Login",
      description: "This feature would connect to Google Auth in a real app",
    });
    
    // Demo login with Google
    setTimeout(() => {
      setIsAuthenticated(true);
      setCurrentUser({
        id: 'current',
        name: 'Alex',
        email: 'demo@example.com',
        profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        age: 29,
        gender: 'Non-Binary',
        interests: ['Gaming', 'Movies', 'Art'],
        bio: 'Looking for friends to explore the city with!',
        location: { lat: 40.730610, lng: -73.935242 },
      });
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto border shadow-lg animate-fade-in">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to continue your friend-finding journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          type="button" 
          className="w-full" 
          onClick={handleGoogleLogin}
        >
          <GithubIcon className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-center text-sm text-gray-500 mt-2">
          Don&apos;t have an account?{" "}
          <button 
            onClick={onToggleForm} 
            className="text-primary hover:underline"
          >
            Sign up
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-4">
          Demo login: demo@example.com / password
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
