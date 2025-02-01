import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import { MedalIcon, Medal, Trophy } from 'lucide-react'; // Import Lucide icons
import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";

export const dynamic = "force-dynamic";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  const progressCount = await getProgress(userId, course.id);

  const awardBadges = (progressCount: number) => {
    let newBadges = "";

    if (progressCount < 26) {
        newBadges = 'Bronze';
    } else if (progressCount < 51) {
        newBadges = 'Silver';
    } else if (progressCount <= 100) {
        newBadges = 'Gold';
    }

    return newBadges;
  };

  const awardBadge = awardBadges(progressCount);

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} progressCount={progressCount} />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} awardBadge={awardBadge} />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">
        {children}
      </main>
    </div>
  );
};

export default CourseLayout;