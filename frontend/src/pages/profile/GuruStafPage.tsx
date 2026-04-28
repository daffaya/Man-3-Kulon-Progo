/**
 * @fileoverview GuruStafPage component for displaying teacher and staff data in tabular format.
 * This component renders two tables showing the breakdown of teachers and staff by gender
 * and employment status (PNS, P3K, Non-PNS) for the current academic year.
 */

import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { useStaff } from "../../contexts/StaffContext";
import { StaffRecap, Tendik } from "../../types/staffTypes";

/**
 * Props interface for the RecapTable component.
 * @interface
 */
interface RecapTableProps {
  title: string;
  tahunAjaran: string;
  data: StaffRecap[];
  totalLabel: string;
}

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
  const totalMale = data.reduce((sum, row) => sum + Number(row.male), 0);
  const totalFemale = data.reduce((sum, row) => sum + Number(row.female), 0);
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
 * Component that renders a detailed table of all teachers and staff.
 * @param {object} props - The component props.
 * @param {Tendik[]} props.data - The array of teacher and staff data.
 */
const DetailTendikTable: React.FC<{ data: Tendik[] }> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
              scope="col"
            >
              No
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
              scope="col"
            >
              Nama
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
              scope="col"
            >
              NIP
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
              scope="col"
            >
              L/P
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
              scope="col"
            >
              Status
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
              scope="col"
            >
              Jabatan
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.nip}
              className={
                index % 2 === 0
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-900"
              }
            >
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                {index + 1}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                {item.nama}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                {item.nip}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                {item.gender}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                {item.status}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                {item.jabatan}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Main page component that displays teacher and staff data in two separate tables.
 * Uses the RecapTable component to render the data for both teachers and staff.
 */
const GuruStafPage: React.FC = () => {
  const { state, fetchTeacherRecap, fetchStaffRecap, fetchAllTendik } =
    useStaff();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        await Promise.all([
          fetchTeacherRecap(),
          fetchStaffRecap(),
          fetchAllTendik(),
        ]);
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError("Gagal memuat data guru dan staf. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchTeacherRecap, fetchStaffRecap, fetchAllTendik]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Memuat data...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mx-2 text-center">
        Guru dan Staf
      </h1>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl fade-in">
        <section className="mb-12" aria-labelledby="page-heading">
          <RecapTable
            title="Rekapitulasi Pengajar (Guru)"
            tahunAjaran="2025/2026"
            data={state.teacherRecap}
            totalLabel="TOTAL GURU"
          />
          <hr
            className="my-8 border-gray-300 dark:border-gray-600"
            aria-hidden="true"
          />
          <RecapTable
            title="Rekapitulasi Staf"
            tahunAjaran="2025/2026"
            data={state.staffRecap}
            totalLabel="TOTAL STAF"
          />
          <hr
            className="my-8 border-gray-300 dark:border-gray-600"
            aria-hidden="true"
          />

          {/* New Section Tendik*/}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Daftar Guru dan Tenaga Kependidikan
            </h2>
            <DetailTendikTable data={state.allTendik} />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GuruStafPage;
