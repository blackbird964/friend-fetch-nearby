import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mail, GithubIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const SignUpForm: React.FC<{ onToggleForm: () => void, onContinue: () => void }> = ({ onToggleForm, onContinue }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated, setCurrentUser } = useAppContext();
  const { toast } = useToast();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // For demo, simulate signup process
    setTimeout(() => {
      setIsAuthenticated(true);
      setCurrentUser({
        id: 'current',
        name: name || 'New User',
        email: email,
        profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        age: 0, // Will be set in profile creation
        gender: '', // Will be set in profile creation
        interests: [], // Will be set in profile creation
        bio: '', // Will be set in profile creation
      });
      
      toast({
        title: "Account created!",
        description: "Let's set up your profile next",
      });
      
      setIsLoading(false);
      onContinue(); // Move to profile setup
    }, 1000);
  };

  const handleGoogleSignUp = () => {
    toast({
      title: "Google Sign Up",
      description: "This feature would connect to Google Auth in a real app",
    });
    
    // For demo
    setTimeout(() => {
      setIsAuthenticated(true);
      setCurrentUser({
        id: 'current',
        name: 'Google User',
        email: 'google@example.com',
        profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        age: 0,
        gender: '',
        interests: [],
        bio: '',
      });
      onContinue(); // Move to profile setup
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border animate-fade-in">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>
          Sign up to start finding friends nearby
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            {isLoading ? "Creating Account..." : "Create Account"}
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
          onClick={handleGoogleSignUp}
        >
          <GithubIcon className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm text-gray-500 w-full">
          Already have an account?{" "}
          <button 
            onClick={onToggleForm} 
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
