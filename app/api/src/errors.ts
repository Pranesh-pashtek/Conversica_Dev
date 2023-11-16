import { NextFunction, Request, Response } from "express";

export function clientErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.xhr) {
        res.status(500).send({ error: "Internal Server Error" });
        return;
    }

    next(err);
}

export function errorHandler(
    err: any,
    _req: Request,
    res: Response,
    next: NextFunction
) {
    // Express recommends that we check if the response headers
    // have already been sent and if so delegate to the default
    // error handler.
    // https://expressjs.com/en/guide/error-handling.html
    if (res.headersSent) {
        return next(err);
    }

    console.error("Handling error", err);
    if (err.code === "EBADCSRFTOKEN") {
        res.status(401);
    } else {
        res.status(500);
    }
    res.render("error.html", { error: err.message });
}
