// out ; PostFetchRes[]
// querys
//  afterID : string?
// res example
//  0 : [1,2,3]
//  3 : [4,5,6]
//  6 : [7,8,9]
// url exmaple
// /api/post/get
// /api/post/get?afterID=asdfghjkasdfghjk

import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/utils/prisma";
import { convert } from "html-to-text";
import cookieAdmin from "@/utils/isthiscookieadmin";
import { getClientIp } from "request-ip";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(200).send(
    (
      await prismadb.post.findMany({
        where: {
          type: 300,
        },
      })
    ).map((v) => {
      v.content = convert(v.content, {
        wordwrap: null,
      });
      if (v.content.length > 80) v.content = v.content.slice(0, 78) + "...";
      if (v.title.length > 40) v.title = v.title.slice(0, 38) + "...";
      return v;
    })
  );
}
