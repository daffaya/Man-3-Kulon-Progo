// src/components/integrity/IntegrityAreaCard.tsx
import React from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode; // Mengubah dari string ke React.ReactNode
  onClick: () => void;
}

const IntegrityAreaCard: React.FC<Props> = ({
  id,
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <div
      className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-accent/50"
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="bg-accent/10 p-3 rounded-lg mr-4 flex-shrink-0">
          {/* Render langsung ikon React dan berikan warna */}
          <div className="text-accent">{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
          <p className="text-secondary text-sm">{description}</p>
        </div>
        <ChevronRight className="text-accent mt-1 flex-shrink-0" />
      </div>
    </div>
  );
};

export default IntegrityAreaCard;
