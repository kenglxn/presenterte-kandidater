/*
  Entry-point for Remix på serversiden.
  Dette er boilerplate fra Remix.
*/

import { PassThrough } from "stream";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import type { EntryContext } from "@remix-run/node";

const ABORT_DELAY = 5000;

const handleRequest = (
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
) => {
    return new Promise((resolve, reject) => {
        let didError = false;

        const { pipe, abort } = renderToPipeableStream(
            <RemixServer context={remixContext} url={request.url} />,
            {
                onShellReady: () => {
                    const body = new PassThrough();

                    responseHeaders.set("Content-Type", "text/html");

                    resolve(
                        new Response(body, {
                            headers: responseHeaders,
                            status: didError ? 500 : responseStatusCode,
                        })
                    );

                    pipe(body);
                },
                onShellError: (err: unknown) => {
                    reject(err);
                },
                onError: (error: unknown) => {
                    didError = true;

                    console.error(error);
                },
            }
        );

        setTimeout(abort, ABORT_DELAY);
    });
};

export default handleRequest;
