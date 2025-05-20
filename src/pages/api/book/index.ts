import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "Invalid book ID" });
    }

    try {
        const response = await fetch(
            `https://index.tsyuri.com/book/${id}.html`
        );

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Failed to fetch book details: ${response.statusText}`,
            });
        }

        const contentType = response.headers.get("content-type");
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }

        const responseData = await response.text();
        return res.status(200).send(responseData);
    } catch (error) {
        console.error("Error fetching book details:", error);
        return res.status(500).json({ error: "Failed to fetch book details" });
    }
}
