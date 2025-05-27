
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const TestEmailForm: React.FC = () => {
  const [email, setEmail] = useState('aaron.stathi@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendTestEmail = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'test',
          email: email,
          data: {
            subject: 'Test Email from Kairo',
            message: 'This is a test email to verify your SMTP configuration is working correctly.'
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test email sent!",
        description: `A test email has been sent to ${email}`,
      });

      console.log('Test email sent successfully:', data);
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: "Failed to send test email",
        description: error.message || "An error occurred while sending the test email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Send Test Email</CardTitle>
        <CardDescription>
          Test your email configuration by sending a test email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            disabled={isLoading}
          />
        </div>
        <Button 
          onClick={sendTestEmail} 
          disabled={isLoading || !email}
          className="w-full"
        >
          {isLoading ? "Sending..." : "Send Test Email"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestEmailForm;
