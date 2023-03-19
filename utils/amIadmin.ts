import { setInterval } from "timers";

export default function amIadmin() {
  if (
    typeof window == "undefined" ||
    typeof (window as any).adminChecked == "undefined" ||
    (window as any).adminChecked == false
  )
    return null;

  return (window as any).nextJsLoaded as boolean;
}

export function waitUntilAdmined() {
  let dx = amIadmin();
  if (dx != null) return dx;
  return new Promise<boolean>((resolve, reject) => {
    let inter = setInterval(() => {
      let dt = amIadmin();
      if (dt == null) return;

      clearInterval(inter);
      resolve(dt);
    }, 100);
  });
}
