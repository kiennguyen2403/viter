// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { Supabase } from "../utils/supabase.ts";
import { STATUS } from "../type/type.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "openai";


Deno.serve(async (req) => {
  try {
    const method = req.method
    if (method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Authorization header missing", {
        status: STATUS.UNAUTHORIZED,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);

    const client = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY") || "",
    });

    switch (method) {
      case "POST": {
        const problem = await req.json();
        const embedding = await client.embeddings.create({
          input: problem.question,
          model: "text-embedding-ada-002"
        });
        problem.embedding = embedding.data[0].embedding;

        const { data, error } = await supabase
          .from("problems")
          .insert(problem);

        if (error) {
          return new Response(`Error inserting problem: ${error.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "GET": {
        const params = new URL(req.url).searchParams;
        const query = params.get("query");
        const id = req.url.split("/").pop();
        if (query) {
          const { data, error } = await supabase
            .from("problems")
            .select("*")
            .or(
              `title.ilike.%${query}%,question.ilike.%${query}%`
            )
            .order("title");

          if (error) {
            return new Response(`Error fetching problems: ${error.message}`, {
              status: STATUS.INTERNAL_SERVER_ERROR,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify(data), { status: STATUS.OK });
        }
        if (id) {
          const { data, error } = await supabase
            .from("problems")
            .select("*")
            .eq("id", id);
          if (error) {
            return new Response(`Error fetching problem: ${error.message}`, {
              status: STATUS.INTERNAL_SERVER_ERROR,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify(data), {
            status: STATUS.OK,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      
        const { data, error } = await supabase
          .from("problems")
          .select("*");
        if (error) {
          return new Response(`Error fetching problems: ${error.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      default: {
        return new Response("Method not allowed", { status: STATUS.METHOD_NOT_ALLOWED });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response("An unexpected error occurred", {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/problems' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
