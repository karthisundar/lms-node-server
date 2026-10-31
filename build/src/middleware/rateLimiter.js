"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicEnquiryRateLimiter = exports.authRateLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
const http_status_codes_1 = require("http-status-codes");
function createRateLimiter(options) {
    const { windowMs, max, message } = options;
    const clients = new Map();
    const timer = setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of clients.entries()) {
            if (now > record.resetTime) {
                clients.delete(ip);
            }
        }
    }, Math.min(windowMs, 60000));
    timer.unref();
    return (req, res, next) => {
        const rawIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            "unknown-ip";
        const ip = String(rawIp);
        const now = Date.now();
        let record = clients.get(ip);
        if (!record || now > record.resetTime) {
            record = { count: 1, resetTime: now + windowMs };
            clients.set(ip, record);
            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", max - 1);
            res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));
            return next();
        }
        record.count += 1;
        const remaining = Math.max(0, max - record.count);
        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader("X-RateLimit-Remaining", remaining);
        res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));
        if (record.count > max) {
            const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader("Retry-After", retryAfterSec);
            res.status(http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS).json({
                statusCode: http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS,
                success: false,
                response: {
                    code: "TOO_MANY_REQUESTS",
                    message: message ||
                        `Too many requests. Please try again after ${retryAfterSec} seconds.`,
                },
            });
            return;
        }
        next();
    };
}
exports.authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 login attempts per 15 minutes
    message: "Too many login attempts. Please try again after 15 minutes.",
});
exports.publicEnquiryRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many enquiry submissions. Please try again later.",
});
//# sourceMappingURL=rateLimiter.js.map