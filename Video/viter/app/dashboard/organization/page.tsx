"use client";
import Header from "@/components/Header";
import clsx from "clsx";
import React, { useState } from "react";
import { TabsList, Tabs, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JobsTab from "./components/JobsTab";
import InfoTab from "./components/InfoTab";
import MembersTab from "./components/MembersTab";

export default function Page() {
  const [current, setCurrent] = useState("info");

  return (
    <div className={clsx("flex flex-col min-h-screen w-full")}>
      <Header isSidebarOpen />
      <main className="flex flex-grow overflow-y-hidden">
        <section className="flex-grow p-4 bg-white">
          <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
            Organization
          </h1>
          <div className="mt-10 w-full h-full flex-1 justify-center items-center">
            <div className="w-full flex flex-col items-center justify-center mt-10">
              <Tabs
                value={current}
                onValueChange={(value) => setCurrent(value)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="jobs">Jobs</TabsTrigger>
                </TabsList>
                <TabsContent value="info">
                  <div className="w-full h-full flex-1 justify-center items-center mt-10">
                    <InfoTab />
                  </div>
                </TabsContent>
                <TabsContent value="members">
                  <div className="w-full h-full flex-1 justify-center items-center mt-10 p-4">
                    <MembersTab />
                  </div>
                </TabsContent>
                <TabsContent value="jobs">
                  <div className="w-full h-full flex-1 justify-center items-center mt-10 p-4">
                    <JobsTab />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
