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
  let page = req.query.afterID;
  let isadmin = await cookieAdmin(req.cookies["token"]);
  let ip = getClientIp(req) || "Unknown";
  let postTypeSelector = req.query.postType;
  let notAdminSelectorAdder: any = {
    where: {
      isShown: true,
      OR: [
        {
          ip: ip,
        },
        {
          type: {
            in: [100, 200],
          },
        },
      ],
    },
  };
  let adminSelector: any = {
    take: 30,
    orderBy: {
      time: "desc",
    },
    where: {
      type: {
        not: {
          equals: 300,
        },
      },
    },
    select: {
      content: true,
      id: true,
      title: true,
      view: true,
      type: true,
      time: true,
      isShown: true,
    },
  };
  if (typeof postTypeSelector === "string")
    if (isadmin) adminSelector["where"]["type"] = parseInt(postTypeSelector);
    // admin X, select 를 원한
    else if (
      parseInt(postTypeSelector) > 0 &&
      parseInt(postTypeSelector) % 100 == 0
    )
      notAdminSelectorAdder["where"]["OR"] = [
        {
          type: parseInt(postTypeSelector),
        },
      ];
    else
      notAdminSelectorAdder["where"]["OR"] = [
        {
          ip: ip,
          type: parseInt(postTypeSelector),
        },
      ];

  if (page)
    if (isadmin)
      return res.status(200).send(
        (
          await prismadb.post.findMany({
            ...adminSelector,
            cursor: {
              id: page as string,
            },
            skip: 1,
          })
        ).map((v) => {
          v.content = convert(v.content, {
            wordwrap: null,
          }).slice(0, 80);
          v.title = v.title.slice(0, 40);
          return v;
        })
      );
    else
      return res.status(200).send(
        (
          await prismadb.post.findMany({
            ...adminSelector,
            ...notAdminSelectorAdder,
            cursor: {
              id: page as string,
            },
            skip: 1,
          })
        ).map((v) => {
          v.content = convert(v.content, {
            wordwrap: null,
          }).slice(0, 80);
          v.title = v.title.slice(0, 40);
          return v;
        })
      );

  if (isadmin)
    return res.status(200).send(
      (await prismadb.post.findMany(adminSelector)).map((v) => {
        v.content = convert(v.content, {
          wordwrap: null,
        }).slice(0, 80);
        v.title = v.title.slice(0, 40);
        return v;
      })
    );

  console.log(
    JSON.stringify({
      ...adminSelector,
      ...notAdminSelectorAdder,
    })
  );
  return res.status(200).send(
    (
      await prismadb.post.findMany({
        ...adminSelector,
        ...notAdminSelectorAdder,
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
