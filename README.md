\# Sistem Pakar Rekomendasi \& Larangan Makanan  

\### Implementasi Ulang Penelitian Harlina et al. (2024)



Proyek ini merupakan \*\*implementasi ulang sistem pakar berbasis rule\*\* menggunakan metode \*\*Forward Chaining\*\* dan \*\*Certainty Factor (CF)\*\*, diadaptasi dari penelitian:



> Harlina, S., Marsa, M., \& Opu, A. D. D. (2024).  

> \*Implementasi Algoritma Certainty Factor dan Forward Chaining untuk Rekomendasi dan Larangan Makanan.\*  

> \*\*MALCOM: Indonesian Journal of Machine Learning and Computer Science, 4(1), 340–349.\*\*  

> DOI: \[https://doi.org/10.57152/malcom.v4i1.1215](https://doi.org/10.57152/malcom.v4i1.1215)



\## 📋 Deskripsi Singkat

Sistem ini dirancang untuk membantu pengguna menentukan \*\*penyakit yang mungkin diderita\*\* berdasarkan gejala yang dipilih, kemudian memberikan \*\*rekomendasi dan larangan makanan\*\* sesuai hasil diagnosis.



Metode Certainty Factor digunakan untuk menghitung \*\*tingkat keyakinan (confidence level)\*\* terhadap diagnosis, sedangkan \*Forward Chaining\* digunakan untuk melakukan \*\*penalaran berurutan (gejala → penyakit → kategori diet → makanan)\*\*.



Fitur Utama

\- \*\*Inferensi otomatis:\*\* menggunakan \*forward chaining\* hingga fakta akhir.

\- \*\*Certainty Factor (CF):\*\* menghitung tingkat keyakinan hasil diagnosis dengan rumus:



Metodologi Inferensi

1. Input gejala (user\_cf) → nilai kepercayaan dari pengguna.

2\. Diagnosis penyakit → menggunakan forward chaining berdasarkan diagnosis\_rules.

3\. Perhitungan CF penyakit → CF\_user × CF\_expert.

4\. Penambahan fakta kategori diet (loop hingga tidak ada fakta baru).

5\. Rekomendasi dan larangan makanan → berdasarkan aturan food\_rules.

7\. Output hasil diagnosis disusun menurun berdasarkan nilai CF.



\## Cara Menjalankan



\### Clone Repository

```bash

git clone https://github.com/username/sistem-pakar-makanan.git

cd sistem-pakar-makanan
### Install Dependencies

npm install

\### Jalankan Aplikasi

npm run dev

Kemudian Buka di browser: http://localhost:5173

