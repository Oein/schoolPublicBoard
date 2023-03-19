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

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let page = req.query.afterID;
  if (page)
    return res.status(200).send(
      (
        await prismadb.post.findMany({
          take: 30,
          skip: 1,
          orderBy: {
            time: "desc",
          },
          cursor: {
            id: page as string,
          },
          where: {
            isShown: true,
          },
          select: {
            content: true,
            id: true,
            title: true,
            isShown: false,
            time: false,
            view: true,
            ip: false,
          },
        })
      ).map((v) => {
        v.content = convert(v.content, {
          wordwrap: null,
        }).slice(0, 80);
        v.title = v.title.slice(0, 40);
        return v;
      })
    );

  return res.status(200).send(
    (
      await prismadb.post.findMany({
        take: 30,
        orderBy: {
          time: "desc",
        },
        where: {
          isShown: true,
        },
        select: {
          content: true,
          id: true,
          title: true,
          isShown: false,
          time: false,
          view: true,
          ip: false,
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
