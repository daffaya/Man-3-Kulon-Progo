/**
 * @fileoverview GuruStafPage component for displaying teacher and staff data in tabular format.
 * This component renders two tables showing the breakdown of teachers and staff by gender
 * and employment status (PNS, P3K, Non-PNS) for the current academic year.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

/**
 * Interface defining the structure for staff data.
 * @interface
 */
interface StaffData {
  status: string;
  male: number;
  female: number;
}

/**
 * Props interface for the RecapTable component.
 * @interface
 */
interface RecapTableProps {
  title: string;
  tahunAjaran: string;
  data: StaffData[];
  totalLabel: string;
}

/**
 * Constant array containing teacher data breakdown by status and gender.
 */
const TEACHER_RECAP: StaffData[] = [
  { status: "Guru PNS", male: 25, female: 30 },
  { status: "Guru P3K", male: 4, female: 14 },
  { status: "Guru Non PNS", male: 3, female: 2 },
];

/**
 * Constant array containing staff data breakdown by status and gender.
 */
const STAFF_RECAP: StaffData[] = [
  { status: "Staf PNS", male: 2, female: 3 },
  { status: "Staf P3K", male: 3, female: 3 },
  { status: "Staf Non PNS", male: 11, female: 2 },
];

/**
 * Component that renders a table showing staff/teacher data by status and gender.
 * Calculates totals dynamically and displays them in a summary row.
 * @param {RecapTableProps} props - The component props.
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
                Status
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
 * Main page component that displays teacher and staff data in two separate tables.
 * Uses the RecapTable component to render the data for both teachers and staff.
 */
const GuruStafPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mx-2 text-center">
        Guru dan Staf
      </h1>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12" aria-labelledby="page-heading">
          <RecapTable
            title="Rekapitulasi Pengajar (Guru)"
            tahunAjaran="2025/2026"
            data={TEACHER_RECAP}
            totalLabel="TOTAL GURU"
          />

          <hr
            className="my-8 border-gray-300 dark:border-gray-600"
            aria-hidden="true"
          />

          <RecapTable
            title="Rekapitulasi Staf"
            tahunAjaran="2025/2026"
            data={STAFF_RECAP}
            totalLabel="TOTAL STAF"
          />
        </section>
      </div>
    </Layout>
  );
};

export default GuruStafPage;
