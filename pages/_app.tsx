import "@/styles/globals.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import Transition from "@/components/Transition";
import { useEffect } from "react";
import axios from "axios";
import { parse } from "cookie";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  let router = useRouter();
  const amIadmin = () => {
    if (typeof document !== "undefined" && parse(document.cookie).token)
      axios
        .get("/api/admin/isme")
        .then((v) => {
          let { data } = v;
          if (data.status == false)
            toast.info("관리자 로그인이 해지되었습니다.");
          else (window as any).nextJsLoaded = true;
        })
        .finally(() => {
          (window as any).adminChecked = true;
        });
    else (window as any).adminChecked = true;
  };
  useEffect(() => {
    (window as any).adminChecked = false;
    (window as any).nextJsLoaded = false;
    // get am i admin
    router.events.on("routeChangeComplete", amIadmin);
    amIadmin();
  }, [router.events]);
  return (
    <Transition>
      <Component {...pageProps} />
      <ToastContainer newestOnTop position="bottom-right" />
    </Transition>
  );
}
