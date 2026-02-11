import React from "react";
import styles from "./DropMenuNavigator.module.scss";

import Trail from "../animations/trail/Trail";

type IProps = {
    label: string;
    items: Array<{ label: string; value: string }>;
    className?: string;
    hover?: boolean;
    onClick?: (value: string) => void;
}

export default function DropMenuNavigator(props: IProps) {

    const [open, setOpen] = React.useState(false);
    const [itemClick, setItemClick] = React.useState(false);
    const [displayNone, setDisplayNone] = React.useState(true);

    return (
        <div className={`${styles.dropMenuHoverDiv} ${props.className}`}>
            <div
                className={styles.dropMenuButton}
                onMouseEnter={() => {
                    if(window.innerWidth >= 1280 && props.hover !== undefined ? props.hover : true) setOpen(true);
                }}
                onMouseLeave={() => {
                    setOpen(false);
                }}
                onClick={() => {
                    if(open) {
                        setItemClick(true);
                        setOpen(false);
                    } else {
                        setOpen(true);
                    }
                }}
                style={open ? { backgroundColor: "#E0760F" } : {}}
            >
                <h1 className={styles.dropMenuButtonText}>{props.label}</h1>
                <svg className={styles.arrowSvg} width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.41 0L6 3.7085L10.59 0L12 1.1417L6 6L0 1.1417L1.41 0Z" fill="#F2F2F2" />
                </svg>
            </div>
            <div
                className={styles.menu}
                onMouseEnter={() => {
                    if (!itemClick) setOpen(true);
                }}
                onMouseLeave={() => {
                    setOpen(false);
                }}
                style={open ? { backgroundColor: "#E0760F" } : displayNone ? { display: "none" } : {}}
            >
                <Trail
                    open={open}
                    onStart={() => setDisplayNone(false)}
                    onEnd={() => {
                        setItemClick(false);
                        setDisplayNone(true);
                    }}
                >
                    {
                        props.items.map((item) => (
                            <div
                                key={item.value}
                                onClick={() => {
                                    setItemClick(true);
                                    setOpen(false);
                                    if(props.onClick !== undefined) props.onClick(item.value);
                                }}
                                style={itemClick ? { cursor: "default" } : {}}
                            >
                                <h1>{item.label}</h1>
                            </div>
                        ))
                    }
                </Trail>
            </div>
        </div>
    )
}