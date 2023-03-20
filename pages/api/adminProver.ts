import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";
import { uid } from "uid";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let pw = req.query.pw;
  if (typeof pw !== "string")
    return res.send({
      e: "Invalid type of query",
    });

  if (pw != process.env.PW)
    return res.send({
      e: "잘못된 비밀번호 입니다.",
    });
  let u = uid(256);
  await prismadb.keyVal.update({
    where: {
      key: "admin",
    },
    data: {
      val: u,
    },
  });
  res.setHeader(
    "Set-Cookie",
    serialize("token", u, {
      path: "/",
    })
  );
  return res.send({
    s: u,
  });
}
