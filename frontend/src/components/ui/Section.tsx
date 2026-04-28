import React from "react";

interface SectionProps {
  id?: string;
  title?: string;
  children: React.ReactNode;
  /** "default" untuk bg-background, "semi" untuk bg-semibackground */
  bg?: "default" | "semi";
  className?: string;
  titleIcon?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  id,
  title,
  children,
  bg = "default",
  className = "",
  titleIcon,
}) => {
  const bgColor = bg === "semi" ? "bg-semibackground" : "bg-background";

  return (
    <section id={id} className={`py-12 md:py-16 ${bgColor} ${className}`}>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {title && (
          <h2
            id={`heading-${id}`}
            className="text-3xl font-serif font-bold text-center mb-8 text-foreground flex items-center justify-center gap-2"
          >
            {titleIcon}
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
