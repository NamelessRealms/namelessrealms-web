import TopBar from "./components/TopBar/TopBar"
import styles from "./Home.module.scss"
import Head from "next/head";

import { useRouter } from "next/router";

import serverQuasiImg from "../assets/images/figure/server_quasi.png";
import launcherImg from "../assets/images/figure/launcher.png";
import server01Img from "../assets/images/background/server_01.png";
import ButtonFocus from "./components/buttonFocus/ButtonFocus";
import TextImg from "./components/textImg/TextImg";
import ImageZoomText from "./components/imageZoomText/ImageZoomText";
import Footer from "./components/footer/Footer";

export default function Home() {

  const router = useRouter();

  return (
    <div className={styles.homeDiv}>

      <Head>
        <title>無名伺服器 | Nameless Realms</title>
      </Head>

      <TopBar />

      {/* block 01 */}
      <div className={styles.pageTop}>

        <div className={styles.frontVideo}>
          <video
            preload="auto"
            autoPlay={true}
            loop={true}
            muted={true}
          >
            <source src="/video/front.mp4" type="video/mp4"></source>
          </video>
        </div>

        <div className={styles.pageTopLabelDiv}>
          <div className={styles.container}>
            <h1 className={styles.label}>無名伺服器</h1>
            <h1 className={styles.label}>模組生存</h1>
            <div className={styles.buttonDiv}>
              <ButtonFocus className={styles.buttonFocusDiscord} content="DISCORD" onClick={() => window.open("https://discord.com/invite/8BB3NY8")}></ButtonFocus>
              <ButtonFocus className={styles.buttonFocusLauncher} content="下載啟動器" onClick={() => router.push("/launcher")}></ButtonFocus>
            </div>
          </div>
        </div>

      </div>

      {/* block 02 */}
      <TextImg
        label="長期開服，服務不間斷"
        description="我們的伺服器長期開放，服務穩定持續。不論您需要多人遊玩伺服器、社群討論區，我們都為您提供不間斷的服務，絕不會無預警中斷服務！"
        imgSrc={serverQuasiImg}
        imgDivWidth="50%"
      />

      {/* block 03 */}
      <TextImg
        label="自己開發，啟動器"
        description="我們自己開發的無名啟動器！這個啟動器能夠快速啟動遊戲，無需您自己安裝模組包、Java、或自訂模組。只要輕鬆點擊，您就能立即享受遊戲的樂趣！"
        imgSrc={launcherImg}
        reverse={true}
        imgDivWidth="50%"
      />

      {/* block 04 */}
      <div className={styles.block04Server}>

        <h1 className={styles.label}>無名伺服器，目前正在準備中，歡迎您的加入！</h1>

        <div className={styles.discordAndIpButtonDiv}>
          <ButtonFocus className={styles.buttonFocusDiscord} content="DISCORD" onClick={() => window.open("https://discord.com/invite/8BB3NY8")}></ButtonFocus>
          <ButtonFocus className={styles.buttonFocusServerIp} content="namelessrealms.com" onClick={() => navigator.clipboard.writeText("play.mcKismetLab.net")}></ButtonFocus>
        </div>

        <div className={styles.serverListDiv}>
          <ImageZoomText
            label="模組包伺服器"
            imgSrc={server01Img}
            onClick={() => router.push("/modServer")}
          />
        </div>

      </div>

      <Footer />

    </div>
  )
}
