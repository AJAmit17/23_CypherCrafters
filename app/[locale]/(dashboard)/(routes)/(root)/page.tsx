import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import { CheckCircle, Clock } from "lucide-react";
import { Metadata } from 'next';

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";

import { InfoCard } from "./_components/info-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View your in-progress and completed courses on your dashboard.',
  openGraph: {
    title: 'Dashboard',
    description: 'View your in-progress and completed courses on your dashboard.',
  },
  twitter: {
    title: 'Dashboard',
    description: 'View your in-progress and completed courses on your dashboard.',
  },
  keywords: 'dashboard, courses, learning, education, online courses',
  robots: 'index, follow',
};

export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const {
    completedCourses,
    coursesInProgress
  } = await getDashboardCourses(userId);

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProgress.length}
          className="bg-white shadow-lg rounded-lg p-6"
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed"
          numberOfItems={completedCourses.length}
          variant="success"
          className="bg-white shadow-lg rounded-lg p-6"
        />
      </div>
      <CoursesList
        items={[...coursesInProgress, ...completedCourses]}
        className="bg-white shadow-lg rounded-lg p-6"
      />
    </div>
  )
}
