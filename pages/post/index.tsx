import style from "@/styles/Home.module.css";
import Post from "@/components/Post";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import NProgress from "nprogress";
import { PuffLoader } from "react-spinners";
import { useRouter } from "next/router";
import { waitUntilAdmined } from "@/utils/amIadmin";

interface Posts {
  id: string;
  title: string;
  content: string;
  type: number;
  time: number;
  view: number;
  isShown: boolean;
}

export default function Home() {
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState<Posts[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [alerts, setAlerts] = useState<Posts[]>([]);
  const router = useRouter();
  let postType = router.query.type;

  const fetchData = useCallback(async () => {
    if (!hasMore) return;
    if (!router.isReady) return;
    NProgress.start();
    let puttedURL = "";
    if (posts.length > 0) puttedURL += "&afterID=" + posts[posts.length - 1].id;
    if (postType && parseInt((postType as string) || "0") > 0)
      puttedURL += `&postType=${postType}`;
    const NewPosts = (await axios.get(`/api/posts/get?` + puttedURL))
      .data! as Posts[];
    if (NewPosts.length < 30) setHasMore(false);
    setPosts((v) => [...v, ...NewPosts]);
    NProgress.done();
  }, [hasMore, router.isReady, posts, postType]);

  const fetch공지 = useCallback(async () => {
    if (!router.isReady) return;
    if (parseInt((postType as string) || "0") == 300) return;
    const NewPosts = (await axios.get(`/api/alert/get`)).data! as Posts[];
    setAlerts(NewPosts);
  }, []);

  useEffect(() => {
    fetchData();
    fetch공지();
    (async () => {
      setIsAdmin(await waitUntilAdmined());
    })();
  }, [fetchData]);

  return (
    <div>
      <Header to="/" title="게시판" />
      <div className={style.newPost}>
        <Link href="/post/newPost">
          <span className={["material-symbols-outlined", "iconvm"].join(" ")}>
            add
          </span>
          <span>글 올리기</span>
        </Link>
      </div>

      <div className="container">
        <select
          className="input"
          value={postType}
          onChange={(e) => {
            router.push(`/post?type=${e.target.value}`);
          }}
        >
          <option value="0">전부 보기</option>
          <option value="100">일반글 / 모두에게 보이기</option>
          {isAdmin ? (
            <option value="101">일반글 / 관리자에게만 보이기</option>
          ) : null}
          <option value="200">건의글 / 모두에게 보이기</option>
          <option value="201">상담글 / 관리자에게만 보이기</option>
          <option value="300">공지</option>
        </select>
        <InfiniteScroll
          dataLength={posts.length + alerts.length}
          next={fetchData}
          hasMore={hasMore}
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
                  <PuffLoader size={68} color="#60aff0" />
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    position: "relative",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "fit-content",
                  }}
                >
                  Loading
                </div>
              </div>
            </div>
          }
          className={style.posts}
        >
          {alerts.map((v, i) => {
            return (
              <Post
                id={v.id}
                title={"[!][공지] " + v.title}
                desc={v.content}
                key={i}
                type={v.type}
                time={v.time}
                view={v.view}
                deleted={false}
              />
            );
          })}
          {posts.map((v, i) => {
            return (
              <Post
                id={v.id}
                title={v.title}
                desc={v.content}
                key={i}
                type={v.type}
                time={v.time}
                view={v.view}
                deleted={!v.isShown}
              />
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
}
