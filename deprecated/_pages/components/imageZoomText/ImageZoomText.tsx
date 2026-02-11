import React from "react";
import styles from "./ImageZoomText.module.scss";
import Image, { StaticImageData } from "next/image";

type IProps = {
    label: string;
    imgSrc: StaticImageData | string;
    alt?: string;
    onClick?: () => void;
}

export default function ImageZoomText(props: IProps) {

    return (
        <div className={styles.imageZoomTextDiv} onClick={() => {
            if (props.onClick !== undefined) props.onClick();
        }}>

            {/* <img className={styles.imgZoom} src={props.imgSrc} alt={props.alt} /> */}

            <div className={styles.imgZoom}>
                <Image
                    src={props.imgSrc}
                    alt={props.alt}
                    layout="responsive"
                    objectFit="cover"
                />
            </div>

            <div className={styles.imageZoomTextLabelDiv}>
                <h1 className={styles.label}>{props.label}</h1>
            </div>

        </div>
    )
}