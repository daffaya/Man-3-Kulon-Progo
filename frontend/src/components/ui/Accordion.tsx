import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  data: AccordionItem[];
}

const Accordion: React.FC<AccordionProps> = ({ data }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="card overflow-hidden">
          <button
            onClick={() => handleToggle(index)}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent/5 transition-colors"
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <div className="flex items-center gap-4">
              <HelpCircle className="text-accent flex-shrink-0" size={22} />
              <span className="font-semibold text-foreground">
                {item.question}
              </span>
            </div>
            <ChevronDown
              className={`text-accent transition-transform duration-300 flex-shrink-0 ${
                openIndex === index ? "rotate-180" : ""
              }`}
              size={20}
            />
          </button>
          <div
            id={`faq-answer-${index}`}
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? "max-h-[500px]" : "max-h-0"
            }`}
            role="region"
          >
            <p className="px-6 pb-5 pt-2 text-secondary">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
