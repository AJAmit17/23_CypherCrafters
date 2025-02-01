import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import { Metadata } from 'next';

import { db } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";

import { Categories } from "./_components/categories";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: { title: string; categoryId: string } }): Promise<Metadata> {
  return {
    title: searchParams.title ? `Search: ${searchParams.title}` : 'Course Search',
    description: 'Search and filter through our extensive collection of courses',
    openGraph: {
      title: searchParams.title ? `Search: ${searchParams.title}` : 'Course Search',
      description: 'Search and filter through our extensive collection of courses',
    },
    twitter: {
      title: searchParams.title ? `Search: ${searchParams.title}` : 'Course Search',
      description: 'Search and filter through our extensive collection of courses',
    },
    keywords: 'search, courses, learning, education, online courses',
    robots: 'index, follow',
  };
}

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  }
};

const SearchPage = async ({
  searchParams
}: SearchPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    }
  });

  const courses = await getCourses({
    userId,
    ...searchParams,
  });

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories
          items={categories}
        />
        <CoursesList items={courses} />
      </div>
    </>
   );
}
 
export default SearchPage;