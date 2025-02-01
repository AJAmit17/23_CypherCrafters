"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
  userId?: string | null;
}

export const CourseEnrollButton = ({
  price,
  courseId,
  userId,
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (!userId) {
        throw new Error("Not authenticated");
      }

      await axios.post(`/api/webhook`, { userId, courseId });

      toast.success("Successfully enrolled in the course!");
      // Optionally, you can refresh the page or update the state to reflect the enrollment
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      Enroll for {formatPrice(price)}
    </Button>
  )
}