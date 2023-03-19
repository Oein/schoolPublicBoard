import prismadb from "./prisma";

export default async function cookieAdmin(cookie: any) {
  if (typeof cookie !== "string") return false;
  let cn = await prismadb.keyVal.count({
    where: {
      key: "admin",
      val: cookie,
    },
  });

  return cn > 0;
}
