import style from "@/styles/Home.module.css";
import Post from "@/components/Post";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { useRouter } from "next/router";
import { waitUntilAdmined } from "@/utils/amIadmin";

interface Posts {
  id: string;
  title: string;
  content: string;
}

export default function Home() {
  const router = useRouter();

  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState<Posts[]>([]);

  const fetchData = useCallback(async () => {
    if (!hasMore) return;
    let puttedURL = "";
    console.log("Fetch data");
    if (posts.length > 0) puttedURL = "?afterID=" + posts[posts.length - 1].id;
    const NewPosts = (await axios.get(`/api/posts/get` + puttedURL))
      .data! as Posts[];
    console.log(NewPosts.length);
    if (NewPosts.length < 30) setHasMore(false);
    setPosts((v) => [...v, ...NewPosts]);
  }, [hasMore, posts]);

  useEffect(() => {
    fetchData();
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
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchData}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          className={style.posts}
        >
          {posts.map((v, i) => {
            return <Post id={v.id} title={v.title} desc={v.content} key={i} />;
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
}
