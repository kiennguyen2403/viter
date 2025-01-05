"use client";
import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useAxiosInterceptor from "@/utils/http-interceptor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  Label as GraphLabel,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Spinner from "@/components/Spinner";

type Review = {
  resume_summary: string;
  rating: number;
};

const chartConfig = {
  rating: {
    label: "Rating",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<Review | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const apiClient = useAxiosInterceptor();
  const { user } = useUser();

  const handleSubmit = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`files`, file);
    });

    try {
      if (!user) return;
      setIsSubmitting(true);
      const { data } = await apiClient.post(
        `/functions/v1/resumes-marking`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.accessToken || ""}`,
          },
        }
      );
      const review: Review = JSON.parse(data);
      setResponse(review);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => [...prev, file]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Tabs defaultValue="form">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="review" disabled={!response}>
            Result
          </TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <Card className="w-[500px]">
            <CardHeader>
              <CardTitle>Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="resume">Resume</Label>
                  <Input
                    id="resume"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="job_description">Job Description</Label>
                  <Input
                    id="job_description"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ?? <Spinner /> }
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="review">
          <Card className="w-[500px]">
            <CardHeader>
              <CardTitle>Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 w-full h-[300px]">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px] w-[250px]"
                >
                  <RadialBarChart
                    data={[
                      {
                        browser: "safari",
                        rating: response?.rating,
                        fill: "var(--color-safari)",
                      },
                    ]}
                    startAngle={0}
                    endAngle={(360 * (response?.rating ?? 0)) / 5}
                    innerRadius={80}
                    outerRadius={110}
                  >
                    <PolarGrid
                      gridType="circle"
                      radialLines={false}
                      stroke="none"
                      className="first:fill-muted last:fill-background"
                      polarRadius={[86, 74]}
                    />
                    <RadialBar dataKey="rating" background cornerRadius={10} />
                    <PolarRadiusAxis
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                    >
                      <GraphLabel
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-4xl font-bold"
                                >
                                  {`${response?.rating.toLocaleString()}/5`}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Rating
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </PolarRadiusAxis>
                  </RadialBarChart>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col gap-2">
                <Label>Resume Summary</Label>
                <div className="relative">
                  <p
                    className={`transition-all ${
                      isExpanded ? "line-clamp-none" : "line-clamp-4"
                    }`}
                  >
                    {response?.resume_summary}
                  </p>
                  {!isExpanded && (
                    <div
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent h-8 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="self-start"
                  onClick={() => setIsExpanded((prev) => !prev)}
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
