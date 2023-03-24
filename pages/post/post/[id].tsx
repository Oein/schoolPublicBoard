import Header from "@/components/Header";
import TagsView from "@/components/tagsView";
import HTMLRenderer from "@/components/HTML_Renderer";
import FullsizeLoading from "@/components/FullSizeLoading";

import Chat from "@/pages/chat/[id]";

import style from "@/styles/postView.module.css";

import prismadb from "@/utils/prisma";
import { waitUntilAdmined } from "@/utils/amIadmin";
import cookieAdmin from "@/utils/isthiscookieadmin";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import NoSSR from "react-no-ssr";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getClientIp } from "request-ip";

interface Props {
  title: string;
  desc: string;
  time: number;
  view: number;
  ip: string | undefined;
  isMe: boolean;
  type: number;
}

export default function PostView({
  title,
  desc,
  time,
  view,
  ip,
  isMe,
  type: postType,
}: Props) {
  let [loading, setLoading] = useState(false);
  let [amIadmin, setAmIadmin] = useState(false);
  useEffect(() => {
    (async () => {
      setAmIadmin(await waitUntilAdmined());
    })();
  }, []);
  const router = useRouter();

  return (
    <div className={style.container}>
      <FullsizeLoading loading={loading} />
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
              <div className="tags">
                <TagsView postType={postType} time={time} view={view} />
                {amIadmin || isMe ? (
                  <>
                    <span
                      style={{
                        height: "100%",
                        borderLeft: "1px solid black",
                        marginLeft: "6px",
                      }}
                    ></span>

                    <span
                      className={style.admin}
                      onClick={() => {
                        if (confirm("삭제합니까? 되돌릴 수 없습니다.")) {
                          setLoading(true);
                          axios
                            .get(
                              `/api/admin/manage/post/delete?postId=${router.query.id}`
                            )
                            .then((v) => {
                              let { data } = v;
                              if (data.e) toast.error(data.e);
                              else if (data.s) {
                                toast.success("성공적으로 삭제했습니다.");
                                router.push("/post");
                              }
                            })
                            .catch((e) => {
                              console.error(e);
                              toast.error(e.toString());
                            })
                            .finally(() => {
                              setLoading(false);
                            });
                        }
                      }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      <span>글 삭제</span>
                    </span>
                  </>
                ) : null}
                {amIadmin ? (
                  <>
                    <span
                      style={{
                        height: "100%",
                        borderLeft: "1px solid black",
                        marginLeft: "6px",
                      }}
                    ></span>

                    <span>
                      <span className="material-symbols-outlined">person</span>
                      <span>{ip || "Unknown"}</span>
                    </span>
                  </>
                ) : null}
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
              <Chat />
            </NoSSR>
          </div>
        </div>
      </div>
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
      ip: true,
      content: true,
      time: true,
      title: true,
      view: true,
      type: true,
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
      ip: (await cookieAdmin(context.req.cookies["token"]))
        ? datas.ip || "Unknown"
        : "Unknown",
      isMe: getClientIp(context.req) === datas.ip,
      type: datas.type,
    },
  };
};
