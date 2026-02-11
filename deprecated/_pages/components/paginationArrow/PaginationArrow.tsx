import React from "react";
import styles from "./PaginationArrow.module.scss";

// import arrowImg from "../../../../assets/icons/arrow.png";

interface IProps {
    value: number;
    max: number;
    onChange?: (value: number) => void;
}

export default function PaginationArrow(props: IProps) {

    return (
        <div className={styles.paginationArrowDiv}>

            <div className={styles.paginationNumberDiv}>

                <h1>{props.value}</h1>
                <h1>/</h1>
                <h1>{props.max}</h1>

            </div>

            <div className={styles.paginationButton}>

                <button 
                    className={styles.buttonLeft}
                    onClick={() => {
                        let value = props.value;
                        if(value > 1) value--;
                        if(props.onChange !== undefined) props.onChange(value);
                    }}
                >
                    {/* <img src={arrowImg} alt="arrow" /> */}
                </button>
                <button 
                    className={styles.buttonRight}
                    onClick={() => {
                        let value = props.value;
                        if(value < props.max) value++
                        if(props.onChange !== undefined) props.onChange(value);
                    }}
                >
                    {/* <img src={arrowImg} alt="arrow" /> */}
                </button>
                
            </div>

        </div>
    )
}