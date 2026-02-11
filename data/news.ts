export interface NewsItem {
  id: string;
  category: "更新" | "活動" | "公告";
  date: string;
  title: string;
  summary: string;
  image: string;
}

export const newsData: NewsItem[] = [
  {
    id: "1",
    category: "更新",
    date: "2026.01.30",
    title: "全新模組包 2.0 版本正式上線！",
    summary: "本次更新加入了超過 50 個新模組，並大幅優化了啟動器載入速度。",
    image: "/news/update-2.jpg",
  },
  {
    id: "2",
    category: "活動",
    date: "2026.01.25",
    title: "春季建築大賽：無名之城的崛起",
    summary: "準備好你的創意思維，在三週的時間內打造屬於你的夢幻領域。",
    image: "/news/build-event.jpg",
  },
  {
    id: "3",
    category: "公告",
    date: "2026.01.20",
    title: "伺服器硬體升級完成，帶來更穩定的延遲表現",
    summary: "我們遷移到了更高頻的 CPU 伺服器，確保百人同時在線依然流暢。",
    image: "/news/server-upgrade.jpg",
  },
];
