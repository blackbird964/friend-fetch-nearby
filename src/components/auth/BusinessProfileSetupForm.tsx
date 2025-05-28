
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { updateBusinessProfile } from '@/services/business/businessService';

type BusinessProfileFormValues = {
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  hours_of_operation?: string;
};

const BusinessProfileSetupForm: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { currentUser, setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const form = useForm<BusinessProfileFormValues>({
    defaultValues: {
      description: '',
      address: '',
      phone: '',
      website: '',
      hours_of_operation: '',
    },
  });

  const onSubmit = async (values: BusinessProfileFormValues) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      console.log("Updating business profile:", values);
      
      // Parse hours if provided
      let parsedHours = null;
      if (values.hours_of_operation) {
        try {
          parsedHours = JSON.parse(values.hours_of_operation);
        } catch {
          // If JSON parsing fails, store as simple text object
          parsedHours = { description: values.hours_of_operation };
        }
      }
      
      const updateData = {
        ...values,
        hours_of_operation: parsedHours,
      };
      
      await updateBusinessProfile(currentUser.id, updateData);
      
      toast({
        title: "Business profile updated!",
        description: "Your business is now visible on the map.",
      });
      
      // Navigate to home
      navigate('/home');
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update business profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <Card className="w-full max-w-md shadow-md border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Complete Your Business Profile</CardTitle>
        <CardDescription className="text-center">
          Add more details to help customers find you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell customers about your business, specialties, atmosphere..."
                      {...field} 
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123 Main St, City, State" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(555) 123-4567" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://yourbusiness.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hours_of_operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours of Operation</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mon-Fri: 8am-6pm, Sat-Sun: 9am-5pm"
                      {...field} 
                      disabled={isLoading}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Profile"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileSetupForm;
