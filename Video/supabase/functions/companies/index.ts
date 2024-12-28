// Import necessary modules and types
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";
import { STATUS } from "../type/type.ts";

// Define a type for companies
interface Company {
  id?: string;
  name: string;
  logo?: string;
  location?: string;
  primary_color?: string;
  secondary_color?: string;
}

// Initialize Deno server
Deno.serve(async (req) => {
  try {
    const { method, headers, url } = req;

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // Authorization
    const authHeader = headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header missing" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);

    const urlParts = new URL(url);
    const id = urlParts.pathname.split("/").pop();
    const query = urlParts.searchParams;
    const name = query.get("name");
    const position = query.get("position");
    const location = query.get("location");

    // Handle different HTTP methods
    switch (method) {
      case "GET": {
        if (name || position || location) {
          const { data, error } = await supabase
            .from("companies")
            .select(`*, job_positions(position)`)
            .or(
              `name.ilike.%${name}%,location.ilike.%${location}%`
            )
            .or(`job_positions.position.ilike.%${position}%`)
            .limit(20);

          if (error) {
            return new Response(
              JSON.stringify({ error: `Error fetching companies: ${error.message}` }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
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
            return new Response(
              JSON.stringify({ error: `Error fetching company: ${error.message}` }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase.from("companies").select("*").limit(20);
        if (error) {
          return new Response(
            JSON.stringify({ error: `Error fetching companies: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "POST": {
        try {
          const company: Company = await req.json();

          // Fetch the management token
          const tokenResponse = await fetch(
            `https://${Deno.env.get("AUTH0_DOMAIN")}/oauth/token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: Deno.env.get("AUTH0_CLIENT_ID") || "",
                client_secret: Deno.env.get("AUTH0_CLIENT_SECRET") || "",
                audience: `https://${Deno.env.get("AUTH0_DOMAIN")}/api/v2/`,
              }),
            }
          );

          if (!tokenResponse.ok) {
            throw new Error(
              `Failed to fetch management token: ${tokenResponse.statusText}`
            );
          }

          const { access_token: mgmtToken } = await tokenResponse.json();

          // Create the organization in Auth0
          const orgResponse = await fetch(
            `https://${Deno.env.get("AUTH0_DOMAIN")}/api/v2/organizations`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${mgmtToken}`,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
              },
              body: JSON.stringify({
                name: company.name,
                logo: company.logo,
                location: company.location,
                primary_color: company.primary_color,
                secondary_color: company.secondary_color,
              }),
            }
          );

          if (!orgResponse.ok) {
            throw new Error(
              `Failed to create organization: ${orgResponse.statusText}`
            );
          }

          const orgData = await orgResponse.json();

          // Respond with the newly created organization data
          return new Response(JSON.stringify(orgData), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error during POST /organization:", error.message);
          } else {
            console.error("Error during POST /organization:", error);
          }
          return new Response(
            JSON.stringify({ error: (error instanceof Error ? error.message : "Internal Server Error") }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }
      case "PUT": {
        const company: Partial<Company> = await req.json();
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Company ID is required for updates" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data, error } = await supabase
          .from("companies")
          .update(company)
          .eq("id", id)
          .single();
        if (error) {
          return new Response(
            JSON.stringify({ error: `Error updating company: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "DELETE": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Company ID is required for deletion" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data, error } = await supabase.from("companies").delete().eq("id", id);
        if (error) {
          return new Response(
            JSON.stringify({ error: `Error deleting company: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: errorMessage }),
      { status: STATUS.INTERNAL_SERVER_ERROR, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
