import style from "@/styles/post.module.css";
import { useRouter } from "next/router";

interface PostProps {
  id: string;
  title: string;
  desc: string;
}

export default function Post(props: PostProps) {
  const router = useRouter();
  return (
    <div
      className={style.container}
      onClick={() => router.push("./post/post/" + props.id)}
    >
      <h1 className={style.title}>{props.title}</h1>
      <desc className={style.desc}>{props.desc}</desc>
    </div>
  );
}
