import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ClientIp = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const forwarded = request.headers["x-forwarded-for"];
    let ip = typeof forwarded === "string" ? forwarded.split(",")[0] : request.socket.remoteAddress;

    if (ip?.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "");
    }

    return ip;
});

