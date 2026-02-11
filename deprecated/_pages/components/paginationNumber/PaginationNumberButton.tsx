import React from "react";
import styles from "./PaginationNumberButton.module.scss";

// import arrowImg from "../../assets/icons/arrow.png";

interface IProps {
    value: number;
    max: number;
    displayButtonNumber?: number;
    onChange?: (value: number) => void
}

export default function PaginationNumberButton(props: IProps) {

    const getButtons = (index: number): Array<number> => {

        const buttonNumber = props.displayButtonNumber !== undefined ? props.displayButtonNumber : 5;
        const buttonMiddleNumber = Math.floor(buttonNumber / 2);
        let buttonItems = new Array<number>();

        if (props.max < buttonNumber + 1) {
            for (let i = 0; i < props.max; i++) {
                buttonItems.push(i + 1);
            }
            return buttonItems;
        }

        let a = new Array<number>();

        for (let l = 0; l < buttonMiddleNumber + 1; l++) {
            if (index - l > 1) {
                a.push(index - l);
            }
        }

        if (a.length > buttonMiddleNumber) {

            buttonItems = buttonItems.concat(a.reverse());

            let b = new Array<number>();

            for (let i = 0; i < buttonMiddleNumber + 1; i++) {
                if (index + i < props.max + 1) {
                    if (index + i !== index) b.push(index + i);
                }
            }

            if (b.length >= buttonMiddleNumber) {

                if (b.find(item => item === props.max) === undefined) {
                    buttonItems = buttonItems.concat(b);
                    return buttonItems;
                }
            }

            buttonItems = new Array<number>();
            for (let i = 0; i < buttonNumber + 1; i++) {
                buttonItems.push(props.max - i);
            }

            return buttonItems.reverse();

        } else {
            for (let i = 0; i < buttonNumber + 1; i++) {
                if (i + index > props.max) {
                    break;
                } else {
                    if (i + 1 > 1) {
                        buttonItems.push(i + 1);
                    }
                }
            }
        }

        return buttonItems;
    }

    return (
        <div className={styles.paginationNumberButtonDiv}>

            <button
                className={`${styles.buttonLeft} ${styles.buttonArrow}`}
                onClick={() => {
                    let value = props.value;
                    if (value > 1) value--;
                    if(props.onChange !== undefined) props.onChange(value);
                }}
            >
                {/* <img src={arrowImg} alt="arrow" /> */}
            </button>

            <button className={styles.buttonClick} style={props.value === 1 ? { backgroundColor: "#E0760F" } : {}} onClick={() => { if(props.onChange !== undefined) props.onChange(1); }}>1</button>
            <div className={styles.tr}></div>

            {
                getButtons(props.value).map((item) => (
                    <React.Fragment key={item}>
                        {
                            item !== props.max
                                ?
                                <button className={styles.buttonClick} style={props.value === item ? { backgroundColor: "#E0760F" } : {}} onClick={() => { if(props.onChange !== undefined) props.onChange(item); }}>{item}</button>
                                :
                                null
                        }
                    </React.Fragment>
                ))
            }

            <div className={styles.tr}></div>
            <button className={styles.buttonClick} style={props.value === props.max ? { backgroundColor: "#E0760F" } : {}} onClick={() => { if(props.onChange !== undefined) props.onChange(props.max); }}>{props.max}</button>

            <button
                className={`${styles.buttonRight} ${styles.buttonArrow}`}
                onClick={() => {
                    let value = props.value;
                    if (value < props.max) value++;
                    if(props.onChange !== undefined) props.onChange(value);
                }}
            >
                {/* <img src={arrowImg} alt="arrow" /> */}
            </button>

        </div>
    )
}