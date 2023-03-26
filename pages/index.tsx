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
            익명 게시판 및 익명 상담
          </div>
          <div
            className="button"
            onClick={() => {
              router.push("/adminProve");
            }}
          >
            관리자 인증하기
          </div>
          <desc>[허전한데 쓸게 없어서 학교 이미지 넣었습니다.]</desc>
        </div>
      </div>
    </div>
  );
}
