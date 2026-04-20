import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props} />;
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props} />;
}

function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500 mt-1", className)} {...props} />;
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-4 border-t border-gray-100 flex items-center", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
