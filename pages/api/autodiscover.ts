// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { rmSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";

type Data = object | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const boardUrl = req.query["url"];
    if (boardUrl === undefined || Array.isArray(boardUrl)) {
        res.status(400).json({ error: "Bad request. Expected 'url' query parameter." });
        return;
    }

    const boardHtml = await (await fetch(boardUrl)).text();
    const scrapeResult = new JSDOM(boardHtml).window.document.querySelector("link[type='application/json+oembed']");

    if (!scrapeResult) {
        res.status(404).json({ error: "No embed found for given board link." });
        return;
    }

    const oembedUrl = scrapeResult.hasAttribute("href") && scrapeResult.getAttribute("href");

    if (!oembedUrl) {
        res.status(503).json({ error: "Unable to parse oEmbed URL returned from Miro" });
        return;
    }

    const oembedData = await (await fetch(oembedUrl)).json();
    res.status(200).json(oembedData);
}
