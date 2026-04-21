import React from "react";

interface PmbmReviewRowProps {
  label: string;
  value: React.ReactNode;
}

const PmbmReviewRow: React.FC<PmbmReviewRowProps> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-secondary/10 last:border-0">
    <span className="text-xs text-secondary sm:w-48 flex-shrink-0">
      {label}
    </span>
    <span className="text-sm text-foreground font-medium">
      {value || <span className="text-secondary italic">—</span>}
    </span>
  </div>
);

export default PmbmReviewRow;
