import style from "@/styles/header.module.css";
import Link from "next/link";

export default function Header(props: { to: string; title: string }) {
  return (
    <>
      <header className={style.header}>
        <Link href={props.to}>
          <span
            className="material-symbols-outlined"
            style={{
              height: "2rem",
              verticalAlign: "middle",
            }}
          >
            arrow_back_ios
          </span>
        </Link>
        <span
          style={{
            verticalAlign: "middle",
            display: "inline-block",
          }}
          className={style.headerTitle}
        >
          <div>{props.title}</div>
        </span>
      </header>
      <div
        style={{
          height: "3.5rem",
        }}
      ></div>
    </>
  );
}
