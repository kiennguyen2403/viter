// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Supabase } from "../utils/supabase.ts"
import { Application, Router } from "oak";
import { oakCors } from "cors";

const router = new Router();
router.options("/interview-rounds", (ctx) => {
  ctx.response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, PUT, DELETE");
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.status = 200;
});

router
  .get("/interview-rounds/:id", async (ctx) => {
    const id = ctx.params.id;
    const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const { data, error } = await supabase
      .from("interview_rounds")
      .select(`*`)
      .eq("id", id);
    if (error) {
      ctx.response.body = { error: error.message };
      ctx.response.status = 500;
    } else {
      ctx.response.body = data;
      ctx.response.status = 200;
    }
  })
  .get("interview-rounds/:id/results", async (ctx) => {
    const id = ctx.params.id;
    const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const { data, error } = await supabase
      .from("interview_rounds")
      .select(`*`)
      .eq("id", id);
    if (error) {
      ctx.response.body = { error: error.message };
      ctx.response.status = 500;
    } else {
      ctx.response.body = data;
      ctx.response.status = 200;
    }
  })
  .get("/interview-rounds/:id/problems", async (ctx) => {
    const id = ctx.params.id;
    const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);

    const { data, error } = await supabase
      .from("uses")
      .select(`
      problems(*)
    `)
      .eq("interview_rounds_id", id);

    if (error) {
      ctx.response.body = { error: error.message };
      ctx.response.status = 500;
    } else {
      ctx.response.body = data;
      ctx.response.status = 200;
    }
  })
  .put("/interview-rounds/:id", async (ctx) => {
    const id = ctx.params.id;
    const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const body = await ctx.request.body.json();
    const { data, error } = await supabase
      .from("interview_rounds")
      .update({ ...body })
      .eq("id", id);
    if (error) {
      ctx.response.body = { error: error.message };
      ctx.response.status = 500;
    } else {
      ctx.response.body = data;
      ctx.response.status = 200;
    }
  })
  .delete("/interview-rounds/:id", async (ctx) => {
    const id = ctx.params.id;
    const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const { error } = await supabase
      .from("interview_rounds")
      .delete()
      .eq("id", id);
    if (error) {
      ctx.response.body = { error: error.message };
      ctx.response.status = 500;
    } else {
      ctx.response.body = "Interview round deleted";
      ctx.response.status = 200;
    }
  });

const app = new Application()
app.use(oakCors({
  origin: "*",
  methods: ["GET", "PUT", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],

}))

app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port: 8000 });


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/interview-rounds' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
