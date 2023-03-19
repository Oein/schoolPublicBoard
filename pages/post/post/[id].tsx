import Header from "@/components/Header";
import style from "@/styles/postView.module.css";
import kensorship from "kensorship";
import { useState } from "react";
import NoSSR from "react-no-ssr";
import { toast } from "react-toastify";

import axios from "axios";

// ssr
import prismadb from "@/utils/prisma";
import { GetServerSideProps } from "next";
import HTMLRenderer from "@/components/HTML_Renderer";

interface Message {
  isFromme: boolean;
  message: string;
}

interface Props {
  title: string;
  desc: string;
  time: number;
  view: number;
}

function toBefore(date: Date) {
  let now = new Date().getTime();
  let before = date.getTime();
  let diff = (now - before) / 1000;
  if (diff <= 5) return "방금전";
  if (diff < 60) return `${diff}초전`;
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

export default function PostView({ title, desc, time, view }: Props) {
  let [messages, setMessages] = useState<Message[]>([]);
  let [content, setContent] = useState("");
  const send = () => {
    let badWords = kensorship(content);
    if (badWords.length > 0)
      return toast.error(
        `비속어 "${badWords[0].badword}"이(가) 포함되있습니다.`
      );
    axios({
      url: "",
      method: "POST",
    });
  };
  return (
    <div className={style.container}>
      <div className={style.ccontainer}>
        <Header to="/post" title={"글 보기 | " + title} />
        <div
          style={{
            paddingLeft: "8px",
          }}
          className={style.content}
        >
          <div className="container">
            <NoSSR>
              {/* 제목 */}
              <h1
                style={{
                  margin: "0px",
                  padding: "8px",
                  borderBottom: "1px solid #fff",
                  marginBottom: "16px",
                  marginTop: "3rem",
                  fontWeight: "bolder",
                }}
              >
                {title}
              </h1>

              {/* 상세 */}
              <div className={style.detailV}>
                <span>
                  <span className="material-symbols-outlined">timer</span>
                  <span>{toBefore(new Date(time))}</span>
                </span>
                <span>
                  <span className="material-symbols-outlined">visibility</span>
                  <span>{view}</span>
                </span>
              </div>

              <div
                style={{
                  borderBottom: "1px solid #ccc",
                  width: "100%",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                }}
              ></div>

              {/* 본문 */}
              <HTMLRenderer html={desc} />

              {/* 댓글 */}
              <div
                className="container"
                style={{
                  height: "100vh",
                  maxHeight: "100vh",
                }}
              >
                <div
                  className="imessage"
                  style={{
                    height: "auto",
                  }}
                >
                  <p
                    style={{
                      color: "black",
                      margin: "0px",
                      padding: "0px",
                    }}
                  >
                    댓글
                  </p>
                  {messages.map((message, i) => {
                    if (message.isFromme) {
                      if (messages.length > i + 1 && messages[i].isFromme)
                        return (
                          <p key={i} className="from-me no-tail">
                            {message.message}
                          </p>
                        );
                      return (
                        <p key={i} className="from-me">
                          {message.message}
                        </p>
                      );
                    }
                    if (messages.length > i + 1 && !messages[i].isFromme)
                      return (
                        <p key={i} className="from-them no-tail">
                          {message.message}
                        </p>
                      );
                    return (
                      <p className="from-them" key={i}>
                        {message.message}
                      </p>
                    );
                  })}
                  {messages.length == 0 ? (
                    <p
                      style={{
                        color: "#888",
                      }}
                    >
                      댓글 올리기는 아직 지원되지 않습니다.
                    </p>
                  ) : null}
                  <div className={style.submitContainer}>
                    <div className={style.ccontainer}>
                      <div className={style.inputContainer}>
                        <input
                          placeholder="내용"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.keyCode == 13) send();
                          }}
                          maxLength={80}
                        ></input>
                      </div>
                      <div className={style.sendContainer} onClick={send}>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            color: "White",
                          }}
                        >
                          arrow_upward
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </NoSSR>
          </div>
        </div>
      </div>
      <NoSSR>
        <style>{`.imessage{background-color:#fff;border:1px solid #e5e5ea;border-radius:.25rem;display:flex;flex-direction:column;font-family:SanFrancisco;font-size:1.25rem;margin:1rem auto;max-width:600px;padding:.5rem 1.5rem}.imessage p{border-radius:1.15rem;line-height:1.25;max-width:75%;padding:.5rem .875rem;position:relative;word-wrap:break-word}.imessage p::after,.imessage p::before{bottom:-.1rem;content:"";height:1rem;position:absolute}p.from-me{align-self:flex-end;background-color:#248bf5;color:#fff}p.from-me::before{border-bottom-left-radius:.8rem .7rem;border-right:1rem solid #248bf5;right:-.35rem;transform:translate(0,-.1rem)}p.from-me::after{background-color:#fff;border-bottom-left-radius:.5rem;right:-40px;transform:translate(-30px,-2px);width:10px}p[class^=from-]{margin:.5rem 0;width:fit-content}p.from-me~p.from-me,p.from-me~p.from-me:not(:last-child){margin:.25rem 0 0}p.from-me~p.from-me:last-child{margin-bottom:.5rem}p.from-them{align-items:flex-start;background-color:#e5e5ea;color:#000}p.from-them:before{border-bottom-right-radius:.8rem .7rem;border-left:1rem solid #e5e5ea;left:-.35rem;transform:translate(0,-.1rem)}p.from-them::after{background-color:#fff;border-bottom-right-radius:.5rem;left:20px;transform:translate(-30px,-2px);width:10px}p[class^=from-].emoji{background:0 0;font-size:2.5rem}p[class^=from-].emoji::before{content:none}.no-tail::before{display:none}`}</style>
      </NoSSR>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let parms = context.params;
  if (typeof parms?.id !== "string")
    return {
      notFound: true,
    };
  let datas = await prismadb.post.findFirst({
    where: {
      id: parms.id,
    },
    select: {
      ip: false,
      isShown: false,
      id: false,
      content: true,
      time: true,
      title: true,
      view: true,
    },
  });
  if (!datas) {
    return {
      notFound: true,
    };
  }
  await prismadb.post.update({
    where: {
      id: parms.id,
    },
    data: {
      view: {
        increment: 1,
      },
    },
  });
  return {
    props: {
      title: datas.title,
      desc: datas.content,
      time: datas.time.getTime(),
      view: datas.view,
    },
  };
};
