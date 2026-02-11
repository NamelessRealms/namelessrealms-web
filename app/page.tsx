import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import FeatureSection from "@/components/FeatureSection";
import ServerSection from "@/components/ServerSection";

export default function Home() {
  return (
    <div className="bg-brand-dark min-h-screen">
      <Navbar />

      {/* 1. 影片主視覺區塊 */}
      <HomeHero />

      {/* 2. 特色介紹區塊 */}
      <FeatureSection />

      {/* 3. 伺服器狀態與 IP */}
      <ServerSection />

    </div>
  );
}
