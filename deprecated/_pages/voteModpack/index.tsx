import React from "react";
import styles from "./VoteModpack.module.scss";
import Head from "next/head";

import changeModpackHistory from "../../data/change_modpack_history.json";
import TopBar from "../components/TopBar/TopBar";
import Footer from "../components/footer/Footer";
import ButtonFocus from "../components/buttonFocus/ButtonFocus";

interface IModpackHistory {
    name: string;
    version: string;
    url: string;
}

const seasonNumber = 42;
const modpackName = "Enigmatica 9";
const modpackUrl = "https://www.curseforge.com/minecraft/modpacks/enigmatica9";
const modpackUrlImg = "https://media.forgecdn.net/avatars/557/558/637904430386629931.jpeg";

export default function VoteModpack() {

    return (
        <div className={styles.voteModpackDiv}>

            <Head>
                <title>伺服器模組包 | Nameless Realms</title>
            </Head>

            <TopBar />

            {/* block 01 */}
            <div className={styles.block01}>

                <div className={styles.centerDiv}>
                    <div className={styles.container}>

                        <h2 className={styles.seasonText}>{`第 ${seasonNumber} 季`}</h2>
                        {/* <h1 className={styles.label}>正在開放遊玩中，快來加入吧！</h1> */}
                        <h1 className={styles.label}>正在準備中...</h1>

                        <div className={styles.modpack} onClick={() => window.open(modpackUrl)}>
                            <img src={modpackUrlImg} alt="Modpack" />
                            <h1 className={styles.modpackLabel}>{modpackName}</h1>
                        </div>

                    </div>
                </div>

                <div className={styles.bottomDiv}>
                    <ButtonFocus className={styles.voteModpackButton} content="快去投票吧！" disabled={false} onClick={() => window.open("https://forms.gle/tECwea72Qs5SNZeV8")} />
                </div>

            </div>

            {/* block 02 */}
            <div className={styles.block02}>
                <div className={styles.container}>
                    <h1 className={styles.label}>喜歡的模組包要推薦給大家嗎？立即前往分享吧！</h1>
                    <ButtonFocus className={styles.recommendModpackButton} content="點擊前往分享吧！" onClick={() => window.open("https://forms.gle/tnMgrh8JXGocTWsB8")} />
                </div>
            </div>

            {/* block 03 */}
            <div className={styles.block03}>

                <div className={styles.container}>

                    <h1 className={styles.label}>伺服器模組包換包紀錄</h1>

                    <div className={styles.modpackList}>
                        {
                            changeModpackHistory.map((modpack: IModpackHistory) => (
                                <div className={styles.modpack} key={modpack.name}>
                                    <ButtonFocus className={styles.modpackButton} content={modpack.name} onClick={() => window.open(modpack.url)} />
                                </div>
                            ))
                        }
                    </div>

                </div>

            </div>

            <Footer />

        </div>
    )
}