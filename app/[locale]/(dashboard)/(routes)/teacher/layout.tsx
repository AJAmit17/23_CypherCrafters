import { isTeacher } from "@/lib/teacher";
import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const TeacherLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { userId } = auth();

  if (!isTeacher(userId)) {
    return redirect("/");
  }

  return <>{children}</>
}
 
export default TeacherLayout;