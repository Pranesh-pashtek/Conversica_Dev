export function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: "Internal Server Error" });
        return;
    }
    next(err);
}
export function errorHandler(err, _req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    console.error("Handling error", err);
    if (err.code === "EBADCSRFTOKEN") {
        res.status(401);
    }
    else {
        res.status(500);
    }
    res.render("error.html", { error: err.message });
}
