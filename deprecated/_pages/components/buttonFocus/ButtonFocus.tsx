import React from "react";
import styles from "./ButtonFocus.module.scss";

type IProps = {
    content: string | number;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export default function ButtonFocus(props: IProps) {

    let style = props.disabled !== undefined ? props.disabled ? { cursor: "not-allowed" } : { cursor: "pointer" } : { cursor: "pointer" };
    style = props.style !== undefined ? Object.assign(props.style, style) : style;

    return (
        <button
            className={`${styles.buttonFocus} ${props.className}`}
            style={style}
            onClick={() => {if (props.onClick !== undefined && (props.disabled !== undefined ? !props.disabled : true)) props.onClick()}}
        >{props.content}</button>
    );
}