/* eslint-disable @next/next/no-img-element */
import Header from "@/components/Header";
import { useRouter } from "next/router";

export default function Index() {
  let router = useRouter();
  return (
    <div>
      <Header to="" title="1학년 2반 누리홈" />
      <img
        src="/s_visual.png"
        alt="학교 이미지"
        style={{
          width: "100%",
        }}
      />
      <div
        style={{
          textAlign: "center",
        }}
      >
        <div className="container">
          <div
            className="button"
            onClick={() => {
              router.push("/post");
            }}
          >
            학급 게시판 가기
          </div>
          <div className="button">익명 상담하기 (는 만들고 있습니다)</div>
          <desc>[허전한데 쓸게 없어서 학교 이미지 넣었습니다.]</desc>
        </div>
      </div>
    </div>
  );
}
