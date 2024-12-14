// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { multiParser } from 'multiparser'
import { Supabase } from "../utils/supabase.ts";
import pdf from "pdf-parse"
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
    const form = await multiParser(req)
    if (!form)
      return new Response(
        JSON.stringify({ message: 'No files found' }),
        {
          status: STATUS.BAD_REQUEST,
          headers: { "Content-Type": "application/json" }
        },
      )
    const { files } = form.files
    const content = []
    if (Array.isArray(files)) {
      for (const file of files) {
        const extention = file.filename.split('.').pop()
        switch (extention) {
          case 'pdf': {
            const content = await pdf(file.content)
            content.push(content.text)
            break
          }
          case 'txt': {
            const text = new TextDecoder().decode(file.content)
            content.push(text)
            break;
          }
          default:
            console.log('Unsupported file type')
        }
      }
    }

    const client = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY") || "",
    });


    const response = await client.embeddings.create({
      input: content.join(" "),
      model: "text-embedding-ada-002"
    });


    const embeddings = response.data[0].embedding;


    const { data, error } = await supabase.rpc("match_problems", { 
      query_embedding: embeddings,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error) {
      return new Response(`Error fetching problems: ${error.message}`, {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify(data), {
      status: STATUS.OK,
      headers: corsHeaders,
    });

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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/problems-vector' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
