
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MeetupRequestNotificationRequest {
  email: string;
  senderName: string;
  duration: number;
  activity: string;
  loginUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { email, senderName, duration, activity, loginUrl }: MeetupRequestNotificationRequest = await req.json();
    
    const emailResponse = await resend.emails.send({
      from: "meetkairo <onboarding@resend.dev>",
      to: [email],
      subject: "New meetup request! - meetkairo",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E40AF;">You have a new meetup request!</h2>
          <p style="font-size: 16px; margin: 20px 0;">
            <strong>${senderName}</strong> wants to meet up with you for <strong>${duration} minutes at ${activity}</strong>!
          </p>
          <p style="margin: 20px 0;">
            Log in to your meetkairo account to accept or decline this request.
          </p>
          <a href="${loginUrl}" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">
            Log in to Respond
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you can't click the button above, copy and paste this link into your browser:<br>
            <a href="${loginUrl}" style="color: #2563EB;">${loginUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Best regards,<br>The meetkairo Team
          </p>
        </div>
      `,
    });
    
    console.log("Meetup request notification email sent via Resend:", emailResponse);
    return new Response(JSON.stringify(emailResponse), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-meetup-request-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
