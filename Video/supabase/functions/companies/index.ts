// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts";
import { verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";
import { STATUS } from "../type/type.ts";




Deno.serve(async (req) => {
  try {
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Authorization header missing", {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      return new Response(`Error fetching user: ${userError.message}`, {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const id = req.url.split("/").pop();
    const query = new URL(req.url).searchParams;
    const name = query.get("name");
    const position = query.get("position");
    const location = query.get("location");

    switch (method) {
      case "GET": {
        if (name || position || location) {
          const { data, error } = await supabase
            .from("companies")
            .select(
              `*, job_positions(position)` // Include job position from the related table
            )
            .or(
              `name.ilike.%${name}%,location.ilike.%${location}%`
            )
            .or(
              `job_positions.position.ilike.%${position}%`
            )
            .limit(20);

          if (error) {
            return new Response(`Error fetching companies: ${error.message}`, {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (id) {
          const { data, error } = await supabase
            .from("companies")
            .select("*")
            .eq("id", id)
            .single();
          if (error) {
            return new Response(`Error fetching company: ${error.message}`, {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .limit(20);
        if (error) {
          return new Response(`Error fetching companies: ${error.message}`, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "POST": {
        const company = await req.formData();
        const mgmtToken = fetch(`https://${Deno.env.get("AUTH0_DOMAIN")}/oauth/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: Deno.env.get("AUTH0_CLIENT_ID"),
            client_secret: Deno.env.get("AUTH0_CLIENT_SECRET"),
            audience: `https://${Deno.env.get("AUTH0_DOMAIN")}/api/v2/`,
            grant_type: "client_credentials",
          }),
        });

        const mgmtTokenJson = await (await mgmtToken).json();
        const token = mgmtTokenJson.access_token;
        fetch(`https://${Deno.env.get("AUTH0_DOMAIN")}/api/v2/organizations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: company.get("name"),
            display_name: company.get("name"),
            branding: [{
              logo: company.get("logo"),
              colors: {
                primary: company.get("primary_color"),
                secondary: company.get("secondary_color"),
              },
            }],
            "metadata": {
              "key": "location",
              "value": company.get("location")
            }
          }),
        })
        const { data, error } = await supabase
          .from("companies")
          .insert(company)
          .single();
        if (error) {
          return new Response(`Error inserting company: ${error.message}`, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "PUT": {
        const company = req.formData();
        const { data, error } = await supabase
          .from("companies")
          .update(company)
          .eq("id", id)
          .single();
        if (error) {
          return new Response(`Error updating company: ${error.message}`, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "DELETE": {
        const { data, error } = await supabase
          .from("companies")
          .delete()
          .eq("id", id);
        if (error) {
          return new Response(`Error deleting company: ${error.message}`, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      default:
        return new Response("Method not allowed", {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return new Response(error.message, {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response("An unknown error occurred", {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }


})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/companies' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
