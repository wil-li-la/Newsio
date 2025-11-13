// ==========================================
// Edge Function 入口點 - 模組化版本
// ==========================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { processRssFeeds } from "./rss-processor.ts";

Deno.serve(async (_req) => {
  try {
    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Execute RSS ingestion
    console.log("Starting RSS ingestion...");
    const result = await processRssFeeds(supabase);
    console.log("RSS ingestion completed:", result);

    // Return result
    return new Response(
      JSON.stringify({
        success: true,
        message: "RSS ingestion completed",
        ...result,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Edge Function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start`
  2. Run `supabase functions serve rss-ingestion`
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/rss-ingestion' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/
