"use client";
import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useAxiosInterceptor from "@/utils/http-interceptor";
import { useUser } from "@auth0/nextjs-auth0/client";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Job {
  title: string;
  description: string;
}

export default function JobPage() {
  const { id } = useParams();
  const { user, isLoading } = useUser();
  const [isFetching, setIsFetching] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const router = useRouter();
  const apiClient = useAxiosInterceptor();

  useEffect(() => {
    const fetchJob = async () => {
      if (!user) return;

      setIsFetching(true);
      try {
        const response = await apiClient.get(`/functions/v1/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        setJob(response.data);
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchJob();
  }, [id, user]);

  function onApply(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    router.push(`/jobs/${id}/apply`);
  }

  return (
    <div
      className={clsx(
        "flex flex-col min-h-screen w-full p-5",
        !isLoading ? "animate-fade-in" : "opacity-0"
      )}
    >
      <Header/>
      <main className="flex flex-grow overflow-y-hidden">
        <section className="flex-grow p-4 bg-white">
          <div className="flex flex-col items-start justify-center h-auto p-6 overflow-y-auto">
            {isFetching || isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner />
              </div>
            ) : job ? (
              <Card>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{job.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button className="btn btn-primary" onClick={onApply}>
                    Apply
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                No job available.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
