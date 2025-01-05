"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAxiosInterceptor from "@/utils/http-interceptor";

function checkFileType(file: File) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (fileType === "docx" || fileType === "pdf") return true;
  }
  return false;
}

const applyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phone: z.string().min(1, "Phone is required"),
  file: z
    .any()
    .refine((file) => checkFileType(file), {
      message: "File must be a PDF or DOCX",
    })
    .refine((file) => file.size < 5 * 1024 * 1024, {
      message: "File must be less than 5MB",
    }),
});

export default function Page() {
  const { id } = useParams();
  const apiClient = useAxiosInterceptor();
  const { user } = useUser();

  const form = useForm({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      file: null as File | null,
    },
  });

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    file: File | null;
  }) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    if (values.file) {
      formData.append("file", values.file);
    }

    try {
      if (!user) return;
      await apiClient.post(`/jobs/${id}/apply`, formData);
      alert("Applied successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Failed to apply");
    } finally {
      form.reset();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Apply for this job</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <Input id="name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input id="email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormLabel htmlFor="phone">Phone</FormLabel>
                      <Input id="phone" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormLabel htmlFor="file">Resume</FormLabel>
                      <Input
                        id="file"
                        type="file"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            form.setValue("file", e.target.files[0]);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Apply</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
