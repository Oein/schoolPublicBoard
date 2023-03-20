import style from "@/styles/post.module.css";
import { useRouter } from "next/router";
import tagName from "@/constants/tagName";
import TagsView from "./tagsView";

interface PostProps {
  id: string;
  title: string;
  desc: string;
  type: number;
  time: number;
  view: number;
}

export default function Post(props: PostProps) {
  const router = useRouter();
  return (
    <div
      className={style.container}
      onClick={() => router.push("./post/post/" + props.id)}
    >
      <table
        style={{
          height: "100px",
          borderCollapse: "collapse",
        }}
      >
        <tr>
          <td valign="top">
            <h1 className={style.title}>{props.title}</h1>
            <desc className={style.desc}>{props.desc}</desc>
          </td>
        </tr>
        <tr>
          <td valign="bottom">
            <div className="tags">
              <TagsView
                postType={props.type}
                time={props.time}
                view={props.view}
              />
            </div>
          </td>
        </tr>
      </table>
    </div>
  );
}
