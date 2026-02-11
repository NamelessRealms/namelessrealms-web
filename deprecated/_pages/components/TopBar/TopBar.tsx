

import React from "react";
import styles from "./TopBar.module.scss";
import Image from "next/image";

import { useRouter } from "next/router";

import ButtonFocus from "../buttonFocus/ButtonFocus";
import mckismetlabLogoTitleImg from "../../assets/images/logo/mckismetlab-title.png";
import DropMenuNavigator from "../dropMenuNavigator/DropMenuNavigator";

const menus = [
    {
        label: "伺服器",
        navigator: "/modServer",
        serverDropMenus: [
            {
                label: "模組包伺服器",
                value: "mods-server"
            }
        ]
    },
    {
        label: "模組包",
        navigator: "/voteModpack",
        serverDropMenus: null
    },
    // {
    //     label: "新手教學",
    //     navigator: null,
    //     serverDropMenus: null
    // },
    {
        label: "下載啟動器",
        navigator: "/launcher",
        serverDropMenus: null
    },
    {
        label: "贊助我們",
        navigator: "/sponsor",
        serverDropMenus: null
    },
    {
        label: "團隊",
        navigator: "/team",
        serverDropMenus: null
    }
]

export default function TopBar() {

    const [mediaMenuOpen, setMediaMenuOpen] = React.useState(false);
    const router = useRouter();

    return (
        <div className={styles.topBarDiv}>
            <div className={styles.container}>
                <div className={styles.leftDiv}>
                    {/* <img src={mckismetlabLogoTitleImg} alt="logo-title" onClick={() => router.push("/")} /> */}
                    <div className={styles.imgDiv} onClick={() => router.push("/")}>
                        <Image
                            src={mckismetlabLogoTitleImg}
                            alt="logo title"
                            layout="responsive"
                            objectFit="cover"
                        />
                    </div>
                    <div></div>
                </div>
                {/* <div className={styles.centerDiv}>
                <InputIcon className={styles.inputIcon} type="text" icon="search" value={searchInput} onChange={setSearchInput} />
                </div> */}
                <div className={styles.rightDiv}>
                    {/* <div className={styles.buttonDiv}>
                    <ButtonFocus className={styles.buttonFocus} content="登入" />
                    </div> */}
                    <div className={styles.menuDiv}>
                        {
                            menus.map((menu) => (
                                <React.Fragment key={menu.label}>
                                    {
                                        menu.serverDropMenus !== null
                                            ?
                                            <DropMenuNavigator className={styles.dropMenuNavigator} label={menu.label} items={menu.serverDropMenus} onClick={() => router.push(menu.navigator)}></DropMenuNavigator>
                                            :
                                            <ButtonFocus className={styles.buttonFocus} content={menu.label} onClick={() => router.push(menu.navigator)} />
                                    }
                                </React.Fragment>
                            ))
                        }
                    </div>

                    <button className={styles.storageMenuButton} onClick={() => setMediaMenuOpen(true)}>
                        <svg width="26" height="21" viewBox="0 0 72 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 48H72V40H0V48ZM0 28H72V20H0V28ZM0 0V8H72V0H0Z" fill="#F2F2F2" />
                        </svg>
                    </button>

                    <div className={styles.storageMenuDiv} style={mediaMenuOpen ? {} : { display: "none" }}>

                        <div className={styles.storageMenuBackground}></div>

                        <div className={styles.storageMenuContainer}>

                            <div className={styles.storageMenuTopBar}>
                                {/* <img src={mckismetlabLogoTitleImg} alt="logo-title" /> */}
                                <div className={styles.imgDiv} onClick={() => router.push("/")}>
                                    <Image
                                        src={mckismetlabLogoTitleImg}
                                        alt="logo title"
                                        layout="responsive"
                                        objectFit="cover"
                                    />
                                </div>
                                <svg width="22" height="22" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => setMediaMenuOpen(false)}>
                                    <path d="M56 5.64L50.36 0L28 22.36L5.64 0L0 5.64L22.36 28L0 50.36L5.64 56L28 33.64L50.36 56L56 50.36L33.64 28L56 5.64Z" fill="#F2F2F2" />
                                </svg>
                            </div>

                            <div className={styles.storageMenuItems}>
                                {
                                    menus.map((menu) => (
                                        <React.Fragment key={menu.label}>
                                            {
                                                menu.serverDropMenus !== null
                                                    ?
                                                    <DropMenuNavigator className={styles.dropMenuNavigator} label={menu.label} items={menu.serverDropMenus} onClick={() => router.push(menu.navigator)}></DropMenuNavigator>
                                                    :
                                                    <ButtonFocus className={styles.buttonFocus} content={menu.label} onClick={() => router.push(menu.navigator)} />
                                            }
                                        </React.Fragment>
                                    ))
                                }
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}