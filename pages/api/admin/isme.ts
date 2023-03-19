import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let cok = req.cookies["token"];
  let cn = await prismadb.keyVal.count({
    where: {
      key: "admin",
      val: cok,
    },
  });
  if (cn == 0)
    res
      .setHeader(
        "Set-Cookie",
        serialize("token", "", {
          maxAge: -1,
          path: "/",
        })
      )
      .send({
        s: false,
      });
  else
    res.send({
      s: true,
    });
}
