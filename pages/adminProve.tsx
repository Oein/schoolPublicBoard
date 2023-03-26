import FullsizeLoading from "@/components/FullSizeLoading";
import Header from "@/components/Header";
import axios from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Admin() {
  let [val, setVal] = useState("");
  let [loading, setLoading] = useState(false);

  const router = useRouter();

  return (
    <>
      <FullsizeLoading loading={loading} />
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
            setLoading(true);
            nProgress.start();
            axios
              .get(`/api/adminProver?pw=${val}`)
              .then((v) => {
                let { data } = v;
                if (data.e) return toast.error(data.e);
                toast.success("인증 성공했습니다!");
                router.push("/");
              })
              .finally(() => {
                setLoading(false);
                nProgress.done();
              });
          }}
        >
          인증
        </div>
      </div>
    </>
  );
}
