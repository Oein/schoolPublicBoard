import "@/styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import Transition from "@/components/Transition";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Transition>
      <Component {...pageProps} />
      <ToastContainer newestOnTop position="bottom-right" />
    </Transition>
  );
}
