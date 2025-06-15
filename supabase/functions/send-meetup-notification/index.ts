
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MeetupNotificationRequest {
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
    const { email, senderName, duration, activity, loginUrl }: MeetupNotificationRequest = await req.json();
    
    const emailResponse = await resend.emails.send({
      from: "meetkairo <onboarding@resend.dev>",
      to: [email],
      subject: "Your meetup request has been accepted! - meetkairo",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E40AF;">Great news! Your meetup request has been accepted!</h2>
          <p style="font-size: 16px; margin: 20px 0;">
            Your meetup request for <strong>${duration} minutes at ${activity}</strong> has been accepted by <strong>${senderName}</strong>!
          </p>
          <p style="margin: 20px 0;">
            You can now chat with them to arrange the details of your meetup.
          </p>
          <a href="${loginUrl}" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">
            Log in to Chat & Arrange Meetup
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
    
    console.log("Meetup notification email sent via Resend:", emailResponse);
    return new Response(JSON.stringify(emailResponse), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-meetup-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
