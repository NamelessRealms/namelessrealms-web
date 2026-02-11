import React from "react";
import styles from "./InputIcon.module.scss";

// import emailImg from "../../../../assets/icons/email.png";
// import passwordImg from "../../../../assets/icons/password.png";
// import search from "../../../../assets/icons/search.png";

type IProps = {
    type: "email" | "text" | "password";
    icon: "email" | "password" | "search";
    onChange?: (value: string) => void;
    className?: string;
    value?: string;
}
export default function InputIcon(props: IProps) {
    return (
        <div className={`${styles.inputIconDiv} ${props.className}`}>
            {/* <GetIcon iconType={props.icon} /> */}
            <input type={props.type} value={props.value !== undefined ? props.value : ""} onChange={(event) => { if(props.onChange !== undefined) props.onChange(event.target.value); }} />
        </div>
    );
}

// function GetIcon(props: { iconType: "email" | "password" | "search" }) {

//     switch (props.iconType) {
//         case "email":
//             return (
//                 <img className={styles.icon} src={emailImg} alt="email" />
//             );
//         case "password":
//             return (
//                 <img className={styles.icon} src={passwordImg} alt="password" />
//             );
//         case "search":
//             return (
//                 <img className={styles.icon} src={search} alt="search" />
//             )
//     }

// }