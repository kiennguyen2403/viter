import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";
import { STATUS } from "../type/type.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Tables } from "../type/database.types.ts";
import { FileObject } from "@supabase/storage-js";

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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      return new Response("Unauthorized", {
        status: STATUS.UNAUTHORIZED,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      });
    }

    const { data: user, error: userError }: {
      data: Tables<"users"> | null;
      error: Error | null;
    } = await supabase
      .from("users")
      .select("*")
      .eq("token_identifier", payload.sub)
      .single();

    if (!user) {
      return new Response("User doesn't exist.", { status: STATUS.NOT_FOUND });
    }

    if (userError) {
      return new Response(userError.message, {
        status: STATUS.UNAUTHORIZED,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      });
    }

    switch (method) {
      case "GET": {
        const { data: resumes, error: resumeError }: {
          data: Tables<"resumes">[] | null;
          error: Error | null;
        } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user!.id);

        if (resumeError) {
          return new Response(resumeError.message, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            }
          });
        }

        await Promise.all(
          resumes!.map(
            async (
              resume,
            ) => {
              try {
                const { data, error } = await supabase.storage
                  .from("storages")
                  .createSignedUrl(resume.fileName as string, 60);

                if (error) {
                  console.error(
                    `Error creating signed URL for ${resume
                      .fileName as string}:`,
                    error.message,
                  );
                } else {
                  resume.url = data.signedUrl;
                }
              } catch (err) {
                console.error(
                  `Unexpected error for ${resume.fileName as string}:`,
                  err,
                );
              }
            },
          ),
        );

        return new Response(JSON.stringify(resumes), {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "POST": {
        try {
          const formData = await req.formData();
          const file = formData.get("file") as File;
          if (!file) {
            return new Response("File missing in request", {
              status: STATUS.BAD_REQUEST,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              }
            });
          }

          const fileName = file.name.split("\\").pop()!;
          const { data, error }: { data: FileObject; error: Error | null } =
            await supabase.storage
              .from("storages")
              .upload(fileName, file);

          if (error) {
            return new Response(JSON.stringify(error), {
              status: STATUS.BAD_REQUEST,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              }
            });
          }

          const { error: recordingError } = await supabase
            .from("resumes")
            .insert([{ user_id: user!.id, bucket: data.id, fileName }]);

          if (recordingError) {
            supabase.storage
              .from("storages")
              .remove([fileName]);

            return new Response(recordingError.message, {
              status: STATUS.INTERNAL_SERVER_ERROR,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              }
            });
          }

          return new Response(null, {
            status: STATUS.CREATED,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            }
          });
        } catch (uploadError) {
          console.error("Error in file upload:", uploadError);
          return new Response("Error in file upload", {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            }
          });
        }
      }

      default:
        return new Response("Method not allowed", {
          status: STATUS.METHOD_NOT_ALLOWED,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          }
        });
    }
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "An unknown error occurred",
      {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      },
    );
  }
});
