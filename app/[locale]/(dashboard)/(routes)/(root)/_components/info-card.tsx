import { LucideIcon } from "lucide-react";

import { IconBadge } from "@/components/icon-badge"

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  icon: LucideIcon;
  className?: string; // Add this line
}

export const InfoCard = ({
  variant,
  icon: Icon,
  numberOfItems,
  label,
  className = '', // Add this line
}: InfoCardProps) => {
  return (
    <div className={`border rounded-md flex items-center gap-x-2 p-3 ${className}`}> {/* Apply className here */}
      <IconBadge
        variant={variant}
        icon={Icon}
      />
      <div>
        <p className="font-medium">
          {label}
        </p>
        <p className="text-gray-500 text-sm">
          {numberOfItems} {numberOfItems === 1 ? "Course" : "Courses"}
        </p>
      </div>
    </div>
  )
}