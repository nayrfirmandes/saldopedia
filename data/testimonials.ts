export interface TestimonialData {
  img: string;
  name: string;
  username?: string;
  date: string;
  content: string;
  channel?: string;
  rating?: number;
  videoUrl?: string;
  videoThumb?: string;
  verified?: boolean;
}

export const saldopediaTestimonials: TestimonialData[] = [
  {
    img: "/images/testimonial-01.jpg",
    name: "Budi Santoso",
    username: "@budicrypto",
    date: "15 Okt 2024",
    content:
      "Gak nyangka beli crypto bisa segampang ini. Tinggal chat via WhatsApp, 10 menit USDT udah masuk wallet. Rate nya juga oke, gak kemahalan. Recommended!",
    channel: "Telegram",
    rating: 5,
    verified: true,
  },
  {
    img: "/images/testimonial-02.jpg",
    name: "Siti Rahayu",
    username: "@sititrader",
    date: "28 Sep 2024",
    content:
      "Saldopedia bikin top up PayPal jadi praktis banget. Awalnya ragu karena minimal cuma 25rb, ternyata beneran bisa. Sekarang langganan top up di sini terus!",
    channel: "Twitter",
    rating: 5,
    verified: true,
  },
  {
    img: "/images/testimonial-03.jpg",
    name: "Ahmad Rifai",
    username: "@rifaibtc",
    date: "10 Sep 2024",
    content:
      "Sudah coba beberapa platform jual beli crypto, tapi Saldopedia paling user-friendly. CS nya fast response via WhatsApp. Transaksi aman dan terpercaya.",
    channel: "Instagram",
    rating: 5,
    verified: true,
  },
  {
    img: "/images/testimonial-04.jpg",
    name: "Dewi Lestari",
    username: "@dewiskrill",
    date: "22 Agt 2024",
    content:
      "Buat yang sering pake Skrill, Saldopedia solusi banget. Isi saldo cepet, prosesnya gampang via WhatsApp. Harga kompetitif dan pelayanan memuaskan!",
    channel: "Facebook",
    rating: 4,
  },
  {
    img: "/images/testimonial-01.jpg",
    name: "Rizky Pratama",
    username: "@rizkycrypto",
    date: "8 Agt 2024",
    content:
      "Pertama kali beli USDT di Saldopedia langsung ketagihan. Prosesnya super cepat, tinggal kirim screenshot bukti transfer, langsung diproses. Mantap!",
    channel: "WhatsApp",
    rating: 5,
  },
  {
    img: "/images/testimonial-02.jpg",
    name: "Linda Wijaya",
    username: "@lindapaypal",
    date: "25 Jul 2024",
    content:
      "Sebagai freelancer yang butuh PayPal, Saldopedia sangat membantu. Top up cepat, harga fair, dan bisa dimulai dari 25 ribu aja. Sangat rekomendasi!",
    channel: "Telegram",
    rating: 5,
  },
  {
    img: "/images/testimonial-03.jpg",
    name: "Andi Kurniawan",
    username: "@andiskrill",
    date: "12 Jul 2024",
    content:
      "Layanan Skrill di Saldopedia top! Transaksi lancar, admin responsif 24/7. Pernah butuh urgent tengah malam, langsung dilayani. Service excellent!",
    channel: "Twitter",
    rating: 5,
  },
  {
    img: "/images/testimonial-04.jpg",
    name: "Mega Putri",
    username: "@megacoin",
    date: "30 Jun 2024",
    content:
      "Sudah 6 bulan jadi pelanggan setia Saldopedia. Dari beli BTC, ETH, sampai top up PayPal semua lancar jaya. Rate selalu kompetitif, transaksi aman!",
    channel: "Instagram",
    rating: 5,
  },
];
