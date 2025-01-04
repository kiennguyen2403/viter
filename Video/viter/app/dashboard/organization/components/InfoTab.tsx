"use client";
import Spinner from "@/components/Spinner";
import useAxiosInterceptor from "@/utils/http-interceptor";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";

export default function InfoTab() {
  const [organization, setOrganization] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { user, isLoading } = useUser();
  const apiClient = useAxiosInterceptor();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        if (!user) return;
        setIsFetching(true);
        const response = await apiClient.get(
          `/functions/v1/companies`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        setOrganization(response.data);
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOrganization();
  }, [apiClient, user]);

  return (
    <div className="w-full h-full flex-1 justify-center items-center">
      {isFetching || isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner />
        </div>
      ) : organization ? (
        <div className="bg-white shadow-lg rounded-lg p-4 w-full">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {organization?.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-300 mt-2">
            {organization?.description}
          </p>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          No organization available.
        </p>
      )}
    </div>
  );
}
