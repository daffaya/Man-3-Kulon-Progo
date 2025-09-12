// AppCard.tsx
import React from "react";

interface AppCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
}) => {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border 
        bg-background transition-all duration-300 ease-in-out
        hover:shadow-lg hover:-translate-y-1 hover:border-accent
        dark:bg-semibackground dark:border-gray-700
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 text-accent mb-4 group-hover:bg-accent/20 transition-colors">
          {icon}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        <p className="text-muted text-sm leading-relaxed">{description}</p>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
};

export default AppCard;
