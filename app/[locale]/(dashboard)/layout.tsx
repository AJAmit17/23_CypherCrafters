import { unstable_setRequestLocale } from "next-intl/server";
import { CourseGeneratorProvider } from "@/context/course-generator-context";
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";


export const dynamic = "force-dynamic";

const DashboardLayout = ({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  unstable_setRequestLocale(locale);
  return (
    <CourseGeneratorProvider>
      <div className="h-full">
        <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
          <Navbar />
        </div>
        <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
          <Sidebar />
        </div>
        <main className="md:pl-56 pt-[80px] h-full">{children}</main>
      </div>
    </CourseGeneratorProvider>
  );
};

export default DashboardLayout;
