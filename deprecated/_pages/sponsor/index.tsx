import React from "react";
import styles from "./Sponsor.module.scss";
import Image from "next/image";
import Head from "next/head";

import mcKismetLabTitleLog from "../../assets/images/logo/mckismetlab-title.png";
import sponsorImg from "../../assets/images/figure/sponsor.png";
import TopBar from "../components/TopBar/TopBar";
import CardText from "../components/cardText/CardText";
import Footer from "../components/footer/Footer";

export default function Sponsor() {

    return (
        <div className={styles.sponsorDiv}>

            <Head>
                <title>贊助我們 | Nameless Realms</title>
            </Head>

            <TopBar />

            {/* block 01 */}
            <div className={styles.block01}>

                <div className={styles.centerDiv}>

                    <div className={styles.container}>

                        <div className={styles.leftDiv}>

                            {/* <img src={mcKismetLabTitleLog} alt="mcKismetLab Logo" /> */}
                            <div className={styles.imgDiv}>
                                <Image
                                    src={mcKismetLabTitleLog}
                                    alt="mcKismetLab Logo"
                                />
                            </div>
                            <h1 className={styles.label}>贊助我們</h1>
                            <p className={styles.description}>長期維護伺服器需要耗費時間和金錢，而您的贊助對我們來說非常重要，我們衷心感謝您的支持！</p>

                        </div>

                        <div className={styles.rightDiv}>

                            {/* <img src={sponsorImg} alt="Sponsor" /> */}
                            <div className={styles.imgDiv}>
                                <Image
                                    src={sponsorImg}
                                    alt="Sponsor"
                                    layout="responsive"
                                    objectFit="cover"

                                />
                            </div>

                        </div>

                    </div>

                </div>

                <div className={styles.bottomDiv}>
                    <h1 className={styles.label}>你的贊助，是我們長期架設伺服器的動力 !</h1>
                </div>

            </div>

            {/* block 02 */}
            <div className={styles.block02}>

                <div className={styles.container}>

                    <h1 className={styles.label}>贊助能獲得什麼福利？</h1>
                    <p className={styles.description}>嚴格來說你並不會有福利，贊助可以讓你參與伺服器的長期運營，讓我們提供更好的服務和體驗。雖然我們希望玩家支持我們出於對伺服器的愛，而不是僅為了特定福利，但我們還是會為贊助者提供一些小禮物和特殊功能，以示感謝，看一下我們給你什麼小福利與功能。</p>
                    {/* <p className={styles.description}>看一下我們給你什麼小福利與功能。</p> */}

                    <div className={styles.welfaresDiv}>

                        <CardText
                            className={styles.cardText}
                            label="Discord 贊助者身分組"
                            description="Discord 伺服器上的贊助者提供了一個特別的身分組。"
                        />
                        <CardText
                            className={`${styles.cardTextCenter} ${styles.cardText}`}
                            label="永久白名單"
                            description="無需擔心，您不會因遊玩時間不足而失去白名單。"
                        />
                        <CardText
                            className={styles.cardText}
                            label="代表你的支持"
                            description="Minecraft 聊天室中顯示你是一位贊助者。"
                        />

                    </div>

                </div>

            </div>

            {/* block 03 */}
            <div className={styles.block03}>

                <div className={styles.container}>

                    <div className={styles.leftDiv}>

                        <h1 className={styles.label}>主要贊助管道</h1>

                    </div>

                    <div className={styles.rightDiv}>

                        <h1 className={styles.label}>海外贊助管道</h1>

                    </div>

                </div>

            </div>

            <Footer />

        </div>
    )
}