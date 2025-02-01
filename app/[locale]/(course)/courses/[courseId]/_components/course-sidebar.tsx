import { auth } from '@clerk/nextjs/server';
import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";
import { CourseSidebarItem } from "./course-sidebar-item";
import { Badge } from "@/components/ui/badge";
import { MedalIcon, Medal, Trophy, Crown } from 'lucide-react'; // Import Lucide icons

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[]
  };
  progressCount: number;
  awardBadge?: string;
};

export const CourseSidebar = async ({
  course,
  progressCount,
  awardBadge
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      }
    }
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">
          {course.title}
        </h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress
              variant="success"
              value={progressCount}
            />
          </div>
        )}

        {awardBadge && (
          <div className="mt-4 flex items-center">
            {awardBadge === 'Bronze' && <Medal className="w-6 h-6 text-bronze mr-2" />}
            {awardBadge === 'Silver' && <Crown className="w-6 h-6 text-silver mr-2" />}
            {awardBadge === 'Gold' && <Trophy className="w-6 h-6 text-gold mr-2" />}
            <Badge variant="default">
              {awardBadge}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  )
}
