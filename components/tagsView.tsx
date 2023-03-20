import tagName from "@/constants/tagName";

interface Props {
  postType: number;
  time: number;
  view: number;
}

function toBefore(date: Date) {
  let now = new Date().getTime();
  let before = date.getTime();
  let diff = (now - before) / 1000;
  if (diff <= 5) return "방금전";
  if (diff < 60) return `${Math.floor(diff)}초전`;
  diff = Math.floor(diff / 60);
  if (diff < 60) return `${diff}분전`;
  diff = Math.floor(diff / 60);
  if (diff < 24) return `${diff}시간전`;
  diff = Math.floor(diff / 24);
  if (diff < 31) return `${diff}일전`;
  diff = Math.floor(diff / 31);
  if (diff < 12) return `${diff}달전`;
  diff = Math.floor(diff / 12);
  return `${diff}년전`;
}

export default function TagsView(props: Props) {
  return (
    <>
      <span>
        <span className="material-symbols-outlined">timer</span>
        <span>{toBefore(new Date(props.time))}</span>
      </span>
      <span>
        <span className="material-symbols-outlined">visibility</span>
        <span>{props.view}</span>
      </span>
      <span>
        <span className="material-symbols-outlined">sell</span>
        <span>{tagName[props.postType].replace("__", "")}</span>
      </span>
    </>
  );
}
