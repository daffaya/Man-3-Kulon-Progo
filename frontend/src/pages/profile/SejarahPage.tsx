/**
 * @fileoverview SejarahPage component for displaying the school's history.
 * This component renders a series of paragraphs detailing the historical development
 * of MAN 3 Kulon Progo from its establishment to its current status.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

/**
 * Array containing paragraphs of the school's history in chronological order.
 * Each paragraph details a significant period or event in the development of MAN 3 Kulon Progo.
 */
const SCHOOL_HISTORY = [
  "Sejarah berdirinya MAN 3 Kulon Progo tidak akan terlepas dari kondisi umat yang berada di wilayah Kulon Progo bagian utara, Kecamatan Nanggulan, Samigaluh dan Kalibawang merupakan home base bagi kaum non muslim, sehingga secara umum, pada daerah ini kaum non muslim relatif lebih banyak.",
  "Sebagai langkah antisipasi pada tahun 1984, Pengawas Pendidikan Islam di Kulon Progo Utara, Drs. Abdul Mukti bersama-sama dengan beberapa Tokoh dan Guru Agama Islam, seperti H. Muh. Karsidi (Penilik Guru Pendidikan Agama Islam Kalibawang), Drs. Muzilanto (SMP Muh. Kalibawang), S. Siswo Pranoto (Ka. SD. Dekso I), H.A. Priharsoyo (Guru SD Sokorini), H.Yasmin, B.A. (Ka. SD Muh. Bendo), Mujono (Kepala KUA Kecamatan Kalibawang), H. Mahmud (Staf KUA Kalibawang), H. Kasil Subekti, S.H. (Staf Kantor Kecamatan Kalibawang), berniat mendirikan Madrasah Aliyah. Pada saat itu Camat Kalibawang, Adam Nurjati menyetujui rencana pendirian Madrasah Aliyah di Kalibawang. Namun dengan catatan Madrasah Aliyah itu harus negeri.",
  "Rencana tersebut didukung oleh para Guru dan Kepala SD, SMP, SLTA se-Kecamatan Kalibawang, Ka. Bag. Agama empat desa se-Kecamatan Kalibawang. Berdirilah Madrasah Aliyah Swasta (MAS) Kalibawang pada tahun 1984 di tanah pekarangan Bapak Hadi Siswanto dengan ruang kantor, rumah Beliau. Setahun kemudian, tahun 1985 berubah menjadi Madrasah Aliyah Filial MAN Wates 1 di Kalibawang. Tahun 1989 Madrasah berpindah lokasi ke Kompleks Masjid Sulton Agung Kalibawang.",
  "Melalui SK Menteri Agama No 515 A tahun 1995 tertanggal 25 November 1995, MAN Kalibawang Filial MAN Wates I dinegerikan sehingga berubah status dan nama menjadi MAN I Kalibawang.",
  "Berdasarkan SK Kepala Kantor Wilayah Kemenag DIY No. 68 Tahun 2017, tertanggal 27 Januari 2017, sejak tanggal 1 Februari 2017, madrasah kita berubah nama semula MAN 1 Kalibawang menjadi MAN 3 Kulon Progo.",
  "Seiring dengan perkembangan kebutuhan dan tuntutan zaman, untuk memberi bekal peserta didik, saat ini MAN 3 Kulon Progo mendapat amanah untuk menjadi Madrasah Plus Keterampilan berwawasan lingkungan yang dilengkapi dengan Laboratorium Keterampilan, Bursa Kerja Khusus dari Dinas Tenaga Kerja, Sekolah Adiwiyata dari Kementerian Lingkungan Hidup serta Madrasah Tanggap Bencana dari instansi terkait.",
  "Adapun Pengembangan Bidang Keagamaan kini MAN 3 Kulon Progo telah berhasil mendirikan Boarding Madrasah dengan Program Unggulan Tahfidz dan Kajian Kitab.",
];

/**
 * Component that displays the history of MAN 3 Kulon Progo school.
 * Renders a series of paragraphs detailing the school's establishment and development.
 */
const SejarahPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12 text-justify">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Sejarah Sekolah
          </h1>
          {SCHOOL_HISTORY.map((paragraph, index) => (
            <p key={`history-${index}`} className="mb-4">
              {paragraph}
            </p>
          ))}
        </section>
      </div>
    </Layout>
  );
};

export default SejarahPage;
