import { HashLoader } from "react-spinners";

export default function FullsizeLoading({ loading }: { loading: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "0px",
        bottom: "0px",
        background: "#000000dd",
        zIndex: "1000",
        pointerEvents: loading ? "all" : "none",
        opacity: loading ? "1" : "0",
        transition: "all .2s ease",
        transform: loading ? "translateY(0%)" : "translateY(100%)",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <HashLoader color="#60aff0" size={80} />
      </div>
    </div>
  );
}
