import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import clsx from "clsx";
import { useParams } from "next/navigation";
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

  useEffect(() => {
    const fetchJob = async () => {
      if (!user) return;

      setIsFetching(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/functions/v1/jobs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        setJob(response.data);
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchJob();
  }, [user]);

  return (
    <div
      className={clsx(
        "flex flex-col min-h-screen w-full p-5",
        !isLoading ? "animate-fade-in" : "opacity-0"
      )}
    >
      <Header isSidebarOpen />
      <main className="flex flex-grow overflow-y-hidden">
        <section className="flex-grow p-4 bg-white">
          <div className="flex flex-col items-start justify-center h-auto p-6 overflow-y-auto">
            {isFetching || isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner />
              </div>
            ) : job ? (
              <div className="bg-white shadow-lg rounded-lg p-4 w-full">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {job.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-300 mt-2">
                  {job.description}
                </p>
              </div>
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
