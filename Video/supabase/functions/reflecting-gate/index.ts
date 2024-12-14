// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { multiParser, FormFile } from 'https://deno.land/x/multiparser@0.114.0/mod.ts'
import pdf from "pdf-parse"


Deno.serve(async (req) => {
  const form = await multiParser(req)
  if (form) {
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
    return new Response(
      JSON.stringify(content),
      { headers: { "Content-Type": "application/json" } },
    )
  }

  console.log("No files found")
  const body = await req.json()

  return new Response(
    JSON.stringify(body),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reflecting-gate' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
