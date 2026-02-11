import React from "react";
import styles from "./ModServer.module.scss";
import Image from "next/image";
import Head from "next/head";

import { useRouter } from "next/router";

import server01Img from "../../assets/images/background/server_01.png";
import serverQuasiImg from "../../assets/images/figure/server_quasi.png"
import voteImg from "../../assets/images/figure/vote.png";
import regularImg from "../../assets/images/figure/regular.png";
import ButtonFocus from "../components/buttonFocus/ButtonFocus";
import TextImg from "../components/textImg/TextImg";
import CardText from "../components/cardText/CardText";
import Footer from "../components/footer/Footer";
import TopBar from "../components/TopBar/TopBar";

export default function ModServer() {

    const router = useRouter();

    return (
        <div className={styles.modServerDiv}>

            <Head>
                <title>模組包伺服器 | Nameless Realms</title>
            </Head>

            <TopBar />

            {/* block 01 */}
            <div className={styles.block01}>

                <div className={styles.imgDiv}>
                    {/* <img src={server01Img} alt="server image" /> */}
                    <div className={styles.img}>
                        <Image
                            src={server01Img}
                            alt="server image"
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                </div>

                <div className={styles.labelDiv}>

                    <div className={styles.container}>

                        <h1 className={styles.label}>模組包伺服器</h1>
                        <p className={styles.description}>歡迎來到模組包伺服器！我們為您提供多人遊玩平台、模組討論區、伺服管理等多項服務，讓您輕鬆探索、遊玩，無需擔心自行建立伺服器或不熟悉模組的困擾。</p>

                        <div className={styles.buttonDiv}>
                            <ButtonFocus className={styles.buttonFocusDiscord} content="DISCORD" onClick={() => window.open("https://discord.com/invite/8BB3NY8")}></ButtonFocus>
                            <ButtonFocus className={styles.buttonFocusLauncher} content="下載啟動器" onClick={() => router.push("/launcher")}></ButtonFocus>
                        </div>

                    </div>

                </div>

            </div>

            {/* block 02 */}
            <div className={styles.block02}>

                <div className={styles.container}>

                    <div className={styles.blockLeftDiv}>
                        <h1 className={styles.blockLeftLabel}>加入模組服之前<br />必須知道的事!</h1>
                    </div>

                    <div className={styles.blockRightDiv}>

                        <div className={styles.blockRightLabelDiv}>
                            <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.05029 17.9725L14.012 13L9.05029 8.0275L10.5778 6.5L17.0778 13L10.5778 19.5L9.05029 17.9725Z" fill="#E5E5E5" />
                            </svg>
                            <h1 className={styles.blockRightLabel}>懂得使用Google搜尋功能查詢資料</h1>
                        </div>

                        <div className={styles.blockRightLabelDiv}>
                            <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.05029 17.9725L14.012 13L9.05029 8.0275L10.5778 6.5L17.0778 13L10.5778 19.5L9.05029 17.9725Z" fill="#E5E5E5" />
                            </svg>
                            <h1 className={styles.blockRightLabel}>知道電腦配備能足夠跑的動模組包</h1>
                        </div>

                        <div className={styles.blockRightLabelDiv}>
                            <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.05029 17.9725L14.012 13L9.05029 8.0275L10.5778 6.5L17.0778 13L10.5778 19.5L9.05029 17.9725Z" fill="#E5E5E5" />
                            </svg>
                            <h1 className={styles.blockRightLabel}>懂得安裝模組包基本知識</h1>
                        </div>

                    </div>

                </div>

            </div>

            {/* block 03 */}
            <TextImg
                label="全年無休，一年365天不間斷"
                description="我們的伺服器每天提供穩定遊戲體驗，絕不會無預警關閉。"
                imgSrc={serverQuasiImg}
                reverse={true}
                imgDivWidth="50%"
            />

            {/* block 04 */}
            <TextImg
                label="讓玩家透過投票選擇你喜愛的模組包！"
                description="給玩家以投票的方式選擇你喜愛的模組包。"
                imgSrc={voteImg}
                imgDivWidth="50%"
            />

            {/* block 05 */}
            <TextImg
                label="定期更換不同的模組包"
                description="我們會定期輪換不同的模組包，無需擔心模組包更換會突然中斷伺服器遊戲體驗。"
                imgSrc={regularImg}
                reverse={true}
                imgDivWidth="50%"
            />

            {/* block 06 */}
            <div className={styles.block06}>

                <div className={styles.container}>

                    <h1 className={styles.label}>再加入前，請遵守以下三大規則</h1>

                    <div className={styles.rulesDiv}>
                        <CardText
                            label="禁止使用BUG"
                            description="在模組的幫助下，你可以變得更強，所以請不要使用BUG。"
                        />
                        <CardText
                            className={styles.cardTextCenter}
                            label="禁止破壞伺服器"
                            description="破壞伺服器是不道德的，無論是國內還是國外伺服器，都不應該傷害別人的伺服器體驗！"
                        />
                        <CardText
                            label="不要欺負或騷擾其他玩家"
                            description="讓我們共同做個好公民，不要惡意對待其他玩家。讓大家都能享受遊戲的樂趣。"
                        />
                    </div>

                    <h1 className={styles.label02}>來吧，馬上加入我們吧</h1>
                    <p className={styles.description02}>詳細加入訊息公佈在Discord</p>
                    <ButtonFocus className={styles.discordButton} content="DISCORD" onClick={() => window.open("https://discord.com/invite/8BB3NY8")} />

                </div>

            </div>

            <Footer />

        </div>
    )
}