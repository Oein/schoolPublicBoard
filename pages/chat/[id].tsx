import { GetServerSideProps } from "next";
import NoSSR from "react-no-ssr";
import style from "@/styles/chat.module.css";
import { useCallback, useEffect, useState } from "react";
import kensorship from "kensorship";
import { toast } from "react-toastify";
import socketIO from "socket.io-client";
import { useRouter } from "next/router";
import NProgress from "nprogress";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { PuffLoader } from "react-spinners";
import FullsizeLoading from "@/components/FullSizeLoading";
import { waitUntilAdmined } from "@/utils/amIadmin";

interface Message {
  isFromme: boolean;
  message: string;
  id: string;
  isShown?: boolean;
}

const socket = socketIO(process.env.NEXT_PUBLIC_BACKEND as string, {
  autoConnect: false,
  withCredentials: true,
});
export default function Chat() {
  let [messages, setMessages] = useState<Message[]>([]);
  let [content, setContent] = useState("");
  let [connected, setConnected] = useState(false);
  let [hasMore, setHasMore] = useState(true);
  let [myChats, setMyChats] = useState<string[]>([]);
  let [loading, setLoading] = useState(false);
  let [amIadmin, setAmIadmin] = useState(false);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!hasMore) return;
    if (!router.isReady) return;

    setMessages((g) => {
      (async () => {
        NProgress.start();
        let puttedURL = "";
        if (g.length > 0) puttedURL = "afterID=" + g[g.length - 1].id;
        let url = `/api/chat/get/${router.query.id}?${puttedURL}`;
        let res = await axios.get(url);
        let datas = res.data as {
          content: string;
          id: string;
          isFromMe: boolean;
          isShown?: boolean;
        }[];
        setMessages((g) => [
          ...g,
          ...datas.map((i): Message => {
            return {
              isFromme: i.isFromMe,
              message: i.content,
              id: i.id,
              isShown: i.isShown,
            };
          }),
        ]);
        if (datas.length < 30) setHasMore(false);
        NProgress.done();
      })();

      return g;
    });
  }, [hasMore, router.isReady]);

  // socketio listener
  useEffect(() => {
    socket.once("connect", () => {
      socket.emit("join::room", router.query.id);
    });

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnected", () => {
      setConnected(false);
    });

    socket.on("yourchat", (e) => {
      setMyChats((i) => [...i, e]);
    });

    socket.on("chat", (data) => {
      setMessages((g) => [
        {
          isFromme: false,
          message: data.d,
          id: data.i,
        },
        ...g,
      ]);
    });

    socket.on("delChat", (data) => {
      setMessages((x) => x.filter((i) => i.id != data));
    });

    if (!socket.connected) socket.connect();
  }, []);

  // fetch chat data
  useEffect(() => {
    fetchData();
    if (!socket.connected) socket.connect();
  }, [fetchData]);

  // connect on disconnect
  useEffect(() => {
    if (!socket.connected) socket.connect();
  });

  // am i admin
  useEffect(() => {
    (async () => {
      setAmIadmin(await waitUntilAdmined());
    })();
  }, []);

  const send = () => {
    if (connected == false) return;
    if (content.length == 0) return;
    let badWords = kensorship(content);
    if (badWords.length > 0)
      return toast.error(
        `비속어 "${badWords[0].badword}"이(가) 포함되있습니다.`
      );

    socket.emit("chat", content);
    setContent("");
  };

  return (
    <div>
      <FullsizeLoading loading={loading} />
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
          {!connected ? (
            <div>
              <p
                style={{
                  margin: "0px",
                  padding: "0px",
                }}
              >
                서버에 연결중...
              </p>
              <p
                style={{
                  fontSize: "0.7em",
                  margin: "0px",
                  padding: "0px",
                  cursor: "pointer",
                  paddingLeft: "15px",
                }}
                onClick={() => {
                  router.reload();
                }}
              >
                자동으로 연결이 되지 않는 경우, 눌러주세요.
              </p>
            </div>
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
          {connected ? (
            <InfiniteScroll
              dataLength={messages.length}
              hasMore={hasMore}
              next={fetchData}
              style={{
                overflowX: "hidden",
              }}
              loader={
                <div
                  style={{
                    padding: "2rem",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "fit-content",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <PuffLoader
                        size={68}
                        color="#60aff0"
                        style={{
                          display: "inherit",
                          position: "relative",
                          width: "68px",
                          height: "68px",
                          left: "50%",
                          transform: "translate(-50%, -25%)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: "1rem",
                        position: "relative",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "fit-content",
                        cursor: "pointer",
                      }}
                      onClick={fetchData}
                    >
                      자둥으로 불러와지지 않을경우 눌러주세요
                    </div>
                  </div>
                </div>
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {messages.map((message, i) => {
                  let isDeleted =
                    amIadmin &&
                    typeof message.isShown === "boolean" &&
                    message.isShown == false;

                  if (
                    message.isFromme ||
                    myChats.includes(message.id) ||
                    amIadmin
                  ) {
                    return (
                      <p
                        key={i}
                        className={`from-me ${
                          messages.length > i + 1 && messages[i].isFromme
                            ? "no-tail"
                            : ""
                        }`}
                        id={message.id}
                      >
                        {isDeleted ? (
                          <span
                            style={{
                              color: "lightcoral",
                              background: "white",
                              borderRadius: "5px",
                              padding: "2px",
                              marginRight: "3px",
                            }}
                          >
                            [삭제됨]
                          </span>
                        ) : null}

                        {message.message}
                        <p
                          onClick={() => {
                            let conf =
                              confirm("삭제합니까? 되돌릴 수 없습니다.");

                            if (!conf) return;
                            NProgress.start();
                            setLoading(true);
                            axios
                              .get(
                                `/api/admin/manage/chat/delete?chatId=${message.id}`
                              )
                              .then((v) => {
                                let { data } = v;
                                if (data.e) toast.error(data.e);
                                else if (data.s) {
                                  toast.success("성공적으로 삭제했습니다.");
                                  socket.emit("delChat", message.id);
                                }
                              })
                              .catch((e) => {
                                console.error(e);
                                toast.error(e.toString());
                              })
                              .finally(() => {
                                NProgress.done();
                                setLoading(false);
                              });
                          }}
                          style={{
                            cursor: "pointer",
                            margin: "0px",
                            padding: "0px",
                          }}
                          className="tags"
                        >
                          <span
                            style={{
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span className="material-symbols-outlined iconvm">
                              delete
                            </span>
                            <span>{amIadmin ? "완전 " : ""}삭제</span>
                          </span>
                        </p>
                      </p>
                    );
                  }
                  return (
                    <p
                      key={i}
                      className={`from-them ${
                        messages.length > i + 1 && !messages[i].isFromme
                          ? "no-tail"
                          : ""
                      }`}
                      id={message.id}
                    >
                      {isDeleted ? (
                        <span
                          style={{
                            color: "lightcoral",
                            background: "white",
                            borderRadius: "5px",
                            padding: "2px",
                            marginRight: "3px",
                          }}
                        >
                          [삭제됨]
                        </span>
                      ) : null}
                      {message.message}
                    </p>
                  );
                })}
              </div>
            </InfiniteScroll>
          ) : null}
          {connected && messages.length == 0 ? (
            <p
              style={{
                color: "#888",
              }}
            >
              아직 아무 댓글도 없어요
            </p>
          ) : null}
        </div>
        <div
          style={{
            height: "100px",
            marginTop: "100px",
          }}
        ></div>
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
