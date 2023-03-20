import { GetServerSideProps } from "next";
import NoSSR from "react-no-ssr";
import style from "@/styles/chat.module.css";
import { useState } from "react";
import kensorship from "kensorship";
import { toast } from "react-toastify";
import socketIO from "socket.io-client";

interface Message {
  isFromme: boolean;
  message: string;
}

const socket = socketIO("http://localhost:4000");
export default function Chat() {
  let [messages, setMessages] = useState<Message[]>([]);
  let [content, setContent] = useState("");

  const send = () => {
    let badWords = kensorship(content);
    if (badWords.length > 0)
      return toast.error(
        `비속어 "${badWords[0].badword}"이(가) 포함되있습니다.`
      );
  };
  return (
    <div>
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
      <NoSSR>
        <style>{`.imessage{background-color:#fff;border:1px solid #e5e5ea;border-radius:.25rem;display:flex;flex-direction:column;font-family:SanFrancisco;font-size:1.25rem;margin:1rem auto;max-width:600px;padding:.5rem 1.5rem}.imessage p{border-radius:1.15rem;line-height:1.25;max-width:75%;padding:.5rem .875rem;position:relative;word-wrap:break-word}.imessage p::after,.imessage p::before{bottom:-.1rem;content:"";height:1rem;position:absolute}p.from-me{align-self:flex-end;background-color:#248bf5;color:#fff}p.from-me::before{border-bottom-left-radius:.8rem .7rem;border-right:1rem solid #248bf5;right:-.35rem;transform:translate(0,-.1rem)}p.from-me::after{background-color:#fff;border-bottom-left-radius:.5rem;right:-40px;transform:translate(-30px,-2px);width:10px}p[class^=from-]{margin:.5rem 0;width:fit-content}p.from-me~p.from-me,p.from-me~p.from-me:not(:last-child){margin:.25rem 0 0}p.from-me~p.from-me:last-child{margin-bottom:.5rem}p.from-them{align-items:flex-start;background-color:#e5e5ea;color:#000}p.from-them:before{border-bottom-right-radius:.8rem .7rem;border-left:1rem solid #e5e5ea;left:-.35rem;transform:translate(0,-.1rem)}p.from-them::after{background-color:#fff;border-bottom-right-radius:.5rem;left:20px;transform:translate(-30px,-2px);width:10px}p[class^=from-].emoji{background:0 0;font-size:2.5rem}p[class^=from-].emoji::before{content:none}.no-tail::before{display:none}`}</style>
      </NoSSR>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let id = context.params?.id;

  if (typeof id === "undefined")
    return {
      notFound: true,
    };

  return {
    props: {},
  };
};
