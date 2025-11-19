/**
 * @fileoverview SiswaPage component for displaying student data in a tabular format.
 * This component renders a recapitulation table of students organized by class levels,
 * showing the distribution of male and female students for each class.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

/**
 * Interface defining the structure of staff/student data.
 * @interface StaffData
 * @property {string} status - The class or category name
 * @property {number} male - Number of male students
 * @property {number} female - Number of female students
 */
interface StaffData {
  status: string;
  male: number;
  female: number;
}

/**
 * Props interface for the RecapTable component.
 * @interface RecapTableProps
 * @property {string} title - The title of the table
 * @property {string} tahunAjaran - The academic year
 * @property {StaffData[]} data - Array of student data to display
 * @property {string} totalLabel - Label for the total row
 */
interface RecapTableProps {
  title: string;
  tahunAjaran: string;
  data: StaffData[];
  totalLabel: string;
}

/**
 * Array containing student data organized by class levels.
 */
const STUDENT_RECAP: StaffData[] = [
  { status: "Kelas X", male: 132, female: 263 },
  { status: "Kelas XI", male: 134, female: 189 },
  { status: "Kelas XII", male: 122, female: 221 },
];

/**
 * Component that renders a table displaying student data by class.
 * Calculates totals dynamically and displays them in a summary row.
 * @param {RecapTableProps} props - Component props
 * @returns {JSX.Element} The rendered table component
 */
const RecapTable: React.FC<RecapTableProps> = ({
  title,
  tahunAjaran,
  data,
  totalLabel,
}) => {
  const totalMale = data.reduce((sum, row) => sum + row.male, 0);
  const totalFemale = data.reduce((sum, row) => sum + row.female, 0);
  const total = totalMale + totalFemale;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2
          id="page-heading"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tahun Pelajaran {tahunAjaran}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
                scope="col"
              >
                Kelas
              </th>
              <th
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                scope="col"
                aria-label="Male count"
              >
                L
              </th>
              <th
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                scope="col"
                aria-label="Female count"
              >
                P
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={`${title.toLowerCase().replace(/\s+/g, "-")}-${index}`}
                className={
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-900"
                }
              >
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                  {row.status}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                  {row.male}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                  {row.female}
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-blue-50 dark:bg-blue-900/30">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                {totalLabel}
              </td>
              <td
                className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center"
                colSpan={2}
              >
                {total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Main component for the Siswa (Student) page.
 * Displays a page with student data recapitulation organized by class levels.
 * @returns {JSX.Element} The rendered SiswaPage component
 */
const SiswaPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12" aria-labelledby="page-heading">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Peserta Didik
          </h1>
          <RecapTable
            title="Rekapitulasi Peserta Didik"
            tahunAjaran="2025/2026"
            data={STUDENT_RECAP}
            totalLabel="TOTAL PESERTA DIDIK"
          />
        </section>
      </div>
    </Layout>
  );
};

export default SiswaPage;
