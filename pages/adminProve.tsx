import Header from "@/components/Header";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Admin() {
  let [val, setVal] = useState("");

  const router = useRouter();

  return (
    <>
      <Header to="/" title="관리자 인증하기" />
      <div className="container">
        <input
          placeholder="비밀번호"
          className="input"
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        ></input>
        <div
          className="button"
          onClick={() => {
            axios.get(`/api/adminProver?pw=${val}`).then((v) => {
              let { data } = v;
              if (data.e) return toast.error(data.e);
              toast.success("인증 성공했습니다!");
              router.push("/");
            });
          }}
        >
          인증
        </div>
      </div>
    </>
  );
}
