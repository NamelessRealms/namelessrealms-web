import styles from "./DropMenuClick.module.scss";

interface IProps {
    label: string;
    items: Array<{ label: string; value: string }>;
    className?: string;
    onClick?: (value: string) => void;
}

export default function DropMenuClick(props: IProps) {


    return (
        <div className="dropMenuClickDiv">

        </div>
    )
}