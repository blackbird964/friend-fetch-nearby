
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MeetupNotificationEmailRequest {
  email: string;
  senderName: string;
  duration: number;
  activity: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, senderName, duration, activity, loginUrl }: MeetupNotificationEmailRequest = await req.json();

    const unsubscribeUrl = `${loginUrl.replace('/auth', '')}/unsubscribe?email=${encodeURIComponent(email)}`;

    const emailResponse = await resend.emails.send({
      from: "meetkairo <onboarding@resend.dev>",
      to: [email],
      subject: `Your meetup request was accepted! - meetkairo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10B981; margin-bottom: 30px;">Great news! Your meetup request was accepted!</h1>
          
          <p style="font-size: 18px; margin-bottom: 20px;">
            <strong>${senderName}</strong> has accepted your request for a <strong>${duration} minute</strong> meetup at <strong>${activity}</strong>!
          </p>
          
          <p style="margin-bottom: 30px;">
            Log in to your meetkairo account to coordinate the details.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Log in to Coordinate
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you can't click the button above, copy and paste this link into your browser:<br>
            <a href="${loginUrl}" style="color: #10B981;">${loginUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Best regards,<br>
            The meetkairo Team
          </p>
          
          <p style="color: #999; font-size: 11px; margin-top: 20px;">
            Don't want to receive these emails? 
            <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe here</a>
          </p>
        </div>
      `,
    });

    console.log("Meetup notification email sent via Resend:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-meetup-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
