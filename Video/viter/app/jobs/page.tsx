"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import clsx from "clsx";
import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import useAxiosInterceptor from "@/utils/http-interceptor";

interface Job {
  id: string;
  title: string;
  description: string;
}

export default function DetailedJobPage() {
  const { user, isLoading } = useUser();
  const [isFetching, setIsFetching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const apiClient = useAxiosInterceptor();

  // Fetch job data
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;

      setIsFetching(true);
      try {
        const response = await apiClient.get(`/functions/v1/jobs`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchJobs();
  }, [user]);

  // Render the job cards
  const renderJobs = () =>
    jobs.length > 0 ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {job.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-300 mt-2">
              {job.description}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600 dark:text-gray-400 mt-4">
        No jobs available.
      </p>
    );

  return (
    <div
      className={clsx(
        "flex flex-col min-h-screen w-full",
        !isLoading ? "animate-fade-in" : "opacity-0"
      )}
    >
      <Header />
      <main className="flex flex-grow overflow-y-hidden">
        <section className="flex-grow p-4 bg-white">
          <div className="flex flex-col items-start justify-center h-auto p-6 overflow-y-auto">
            <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
              Jobs
            </h1>
            <div className="mt-10 w-full h-full flex-1 justify-center items-center">
              {isFetching || isLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                renderJobs()
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
