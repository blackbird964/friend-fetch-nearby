
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { type, email, data } = await req.json();
    
    // Handle different types of emails
    if (type === 'signup') {
      const { token_hash, redirect_to } = data;
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://sqrlsxmwvmgmbmcyaxcq.supabase.co";
      const confirmLink = `${supabaseUrl}/auth/v1/verify?token_hash=${token_hash}&type=signup&redirect_to=${redirect_to}`;
      
      const emailResponse = await resend.emails.send({
        from: "meetkairo <onboarding@resend.dev>",
        to: [email],
        subject: "Confirm Your Signup - meetkairo",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E40AF;">Welcome to meetkairo!</h2>
            <p>Thank you for signing up. Please confirm your email address to get started.</p>
            <a href="${confirmLink}" style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Confirm Your Email
            </a>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>The meetkairo Team</p>
          </div>
        `,
      });
      
      console.log("Signup email sent via Resend:", emailResponse);
      return new Response(JSON.stringify(emailResponse), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (type === 'reset') {
      const { token_hash, redirect_to } = data;
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://sqrlsxmwvmgmbmcyaxcq.supabase.co";
      const resetLink = `${supabaseUrl}/auth/v1/verify?token_hash=${token_hash}&type=recovery&redirect_to=${redirect_to}`;
      
      const emailResponse = await resend.emails.send({
        from: "meetkairo <onboarding@resend.dev>",
        to: [email],
        subject: "Reset Your Password - meetkairo",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E40AF;">Reset Your Password</h2>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Reset Password
            </a>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The meetkairo Team</p>
          </div>
        `,
      });
      
      console.log("Reset password email sent via Resend:", emailResponse);
      return new Response(JSON.stringify(emailResponse), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (type === 'test') {
      const { subject, message } = data;
      
      const emailResponse = await resend.emails.send({
        from: "meetkairo <onboarding@resend.dev>",
        to: [email],
        subject: subject || "Test Email from meetkairo",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E40AF;">Test Email</h2>
            <p>${message || 'This is a test email to verify your email configuration is working correctly.'}</p>
            <p>If you received this email, your SMTP configuration with Resend is working properly!</p>
            <p>Best regards,<br>The meetkairo Team</p>
          </div>
        `,
      });
      
      console.log("Test email sent via Resend:", emailResponse);
      return new Response(JSON.stringify(emailResponse), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Default response if no matching email type
    return new Response(
      JSON.stringify({ error: "Unsupported email type" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
