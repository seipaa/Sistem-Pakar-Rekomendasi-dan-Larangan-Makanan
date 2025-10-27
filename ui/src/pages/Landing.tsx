import { useNavigate } from 'react-router-dom';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Sistem Pakar Rekomendasi & Larangan Makanan
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Dapatkan rekomendasi dan larangan makanan yang sesuai berdasarkan kondisi kesehatan Anda.
            Sistem akan memandu Anda langkah demi langkah.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Mulai Diagnosis</h2>
          </div>
          <p className="text-slate-600 mb-6">
            Anda akan dipandu melalui 5 kelompok gejala. Setiap kelompok berisikan gejala yang perlu diisi untuk prediksi.
          </p>
          <ul className="space-y-2 mb-8 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-500 font-bold mt-0.5">✓</span>
              <span>Pilih tingkat kepastian dengan slider untuk setiap gejala</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 font-bold mt-0.5">✓</span>
              <span>Isi gejala yang ada pada kelompok untuk melakukan prediksi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 font-bold mt-0.5">✓</span>
              <span>Hasil akan muncul setelah semua kelompok selesai</span>
            </li>
          </ul>
          <button
            onClick={() => navigate('/diagnose')}
            className="w-full px-6 py-4 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-all shadow-md hover:shadow-lg text-lg"
          >
            Mulai Sekarang
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>Catatan:</strong> Hasil diagnosis bukan pengganti konsultasi medis profesional. 
          Selalu konsultasikan dengan dokter untuk mendapatkan diagnosis yang akurat.
        </p>

        <p className="text-sm text-slate-600 leading-relaxed mt-3">
          <strong>Basis Pengetahuan:</strong> Sistem ini dikembangkan berdasarkan penelitian:
          Harlina, S., Marsa, M., &amp; Opu, A. D. D. (2024). 
          <em>Implementasi Algoritma Certainty Factor dan Forward Chaining untuk Rekomendasi dan Larangan Makanan.</em> 
          MALCOM:Indonesian Journal of Machine Learning and Computer Science, 4(1), 340–349. 
          Institut Riset dan Publikasi Indonesia (IRPI). 
          <a
            href="https://doi.org/10.57152/malcom.v4i1.1215"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline"
          >
            https://doi.org/10.57152/malcom.v4i1.1215
          </a>
        </p>
        </div>
      </div>
    </div>
  );
}
