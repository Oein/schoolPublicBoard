import kensorship from "kensorship";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import Header from "@/components/Header";
import axios from "axios";
import FullsizeLoading from "@/components/FullSizeLoading";
import { useRouter } from "next/router";
import tagName from "@/constants/tagName";
import { waitUntilAdmined } from "@/utils/amIadmin";

export default function PostView() {
  let [title, setTitle] = useState("");
  let [loading, setLoading] = useState(false);
  let [postType, setType] = useState(100);
  let [isAdmin, setIsAdmin] = useState(false);
  const editorRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setIsAdmin(await waitUntilAdmined());
    })();
  }, []);

  return (
    <>
      <FullsizeLoading loading={loading} />
      <Header title="글 쓰기" to="/post" />
      <div>
        <div className="container">
          <div>
            <input
              placeholder="제목"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            ></input>
            <select
              className="input"
              value={postType}
              onChange={(e) => setType(parseInt(e.target.value) || 100)}
            >
              {Object.keys(tagName).map((i: any) => {
                if (tagName[i].includes("__")) return null;
                return (
                  <option value={i} key={i}>
                    {tagName[i]}
                  </option>
                );
              })}
              {isAdmin ? <option value={300}>공지</option> : null}
            </select>
            <Editor
              tinymceScriptSrc={"/tinymce/tinymce.min.js"}
              onInit={(evt, editor) => (editorRef.current = editor as any)}
              initialValue="<p></p>"
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  "advlist autolink lists link image charmap print preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime media table paste code help wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | " +
                  "bold italic backcolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
            />
            <div
              className="button"
              onClick={() => {
                if (title.includes("공지")) {
                  return toast.error(`제목은 '공지'를 포함할 수 없습니다.`);
                }
                let badWords = kensorship(title);
                if (badWords.length > 0)
                  return toast.error(
                    `비속어 "${badWords[0].badword}"이(가) 제목에 포함되있습니다.`
                  );
                badWords = kensorship((editorRef.current as any).getContent());
                if (badWords.length > 0)
                  return toast.error(
                    `비속어 "${badWords[0].badword}"이(가) 본문에 포함되있습니다.`
                  );
                setLoading(true);
                axios({
                  url: "/api/post/put",
                  method: "POST",
                  maxBodyLength: Infinity,
                  headers: {
                    "Content-Type": "application/json",
                  },
                  data: {
                    title: title,
                    content: (editorRef.current as any).getContent(),
                    type: postType,
                  },
                })
                  .then((res) => {
                    let { data } = res;
                    console.log(data);
                    router.push("/post/post/" + data.s);
                  })
                  .catch((e) => {
                    let data =
                      "ERROR!" +
                      (e?.response?.data?.e ||
                        e?.response?.data?.err ||
                        e?.response?.data?.error ||
                        e.toString() ||
                        e);
                    toast.error(data);
                    console.error(data);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              올리기
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
