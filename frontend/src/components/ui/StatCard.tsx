/**
 * @fileoverview StatCard component for displaying statistics in a card format.
 * This component renders a simple card with a title, value, and customizable background color.
 * It's designed to be used in dashboards or analytics sections to display key metrics.
 */

import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  color: string;
}

/**
 * Component that displays a statistic in a card format with customizable color.
 * The card shows a title and a large numerical value, making it ideal for dashboards
 * and analytics displays where key metrics need to be highlighted.
 * @param {string} title - The title or label for the statistic.
 * @param {number} value - The numerical value to display.
 * @param {string} color - CSS class or color value to apply to the card background.
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div
      className={`bg-background dark:bg-semibackground rounded-lg shadow-md p-6 ${color}`}
    >
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

export default StatCard;
