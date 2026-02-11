import React from "react";
import styles from "./CardText.module.scss";

interface IProps {
    label: string;
    description: string;
    className?: string;
}

export default function CardText(props: IProps) {

    return (
        <div className={`${styles.cardTextDiv} ${props.className}`}>
            <h1 className={styles.label}>{props.label}</h1>
            <p className={styles.description}>{props.description}</p>
        </div>
    )
}