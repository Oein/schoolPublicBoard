import kensorship from "kensorship";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import Header from "@/components/Header";
import axios from "axios";
import FullsizeLoading from "@/components/FullSizeLoading";
import { useRouter } from "next/router";

export default function PostView() {
  let [title, setTitle] = useState("");
  let [loading, setLoading] = useState(false);
  const editorRef = useRef(null);
  const router = useRouter();
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
