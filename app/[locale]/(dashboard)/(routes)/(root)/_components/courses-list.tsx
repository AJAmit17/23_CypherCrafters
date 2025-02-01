import React from 'react';

interface CoursesListProps {
  items: any[];
  className?: string; // Add this line
}

export const CoursesList: React.FC<CoursesListProps> = ({
  items,
  className = '', // Add this line
}) => {
  return (
    <div className={`courses-list ${className}`}> {/* Apply className here */}
      {items.map(item => (
        <div key={item.id} className="course-item p-4 border-b last:border-b-0">
          {item.name}
        </div>
      ))}
    </div>
  );
};
