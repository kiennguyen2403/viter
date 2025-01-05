// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { STATUS } from "../type/type.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Supabase } from "../utils/supabase.ts";
import { multiParser } from 'multiparser'
import pdf from "pdf-parse"
import OpenAI from "openai/mod.ts";



Deno.serve(async (req) => {
  try {
    const method = req.method;

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

    if (method === "POST") {
      const form = await multiParser(req);
      if (!form) {
        return new Response(JSON.stringify({ message: "No files found" }), {
          status: STATUS.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { files } = form.files;
      const parsedContent = [];
      if (Array.isArray(files)) {
        for (const file of files) {
          console.log("File: " + file)
          const extension = file.filename.split(".").pop();
          switch (extension) {
            case "pdf": {
              const pdfContent = await pdf(file.content);
              console.log("content:" + pdfContent.text);
              parsedContent.push(pdfContent.text);
              break;
            }
            case "txt": {
              const text = new TextDecoder().decode(file.content);
              parsedContent.push(text);
              break;
            }
            default:
              console.log("Unsupported file type");
          }
        }
      }



      const filesSummary = parsedContent.join("\n\n");

      const prompt = `
        Below are the resumes of the candidates and the job description of that position. 
        Please provide a summary of each resume and rate the candidates on a scale of 1 to 5 based on the quality of the resumes.
        Make sure to provide resonponse in json format, having key: "resume_summary" and "rating".
        ${filesSummary}
      `;

      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) {
        throw new Error("Missing OpenAI API key");
      }

      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "ou are an assistant reviewing resumes and giving feedbacks, and rating." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.5,
        n: 1,
        stop: ["###"],
      });

      return new Response(JSON.stringify(response.choices[0].message.content), {
        status: STATUS.OK,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", {
      status: STATUS.METHOD_NOT_ALLOWED,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unknown error occurred" }),
      {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/resumes-marking' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
