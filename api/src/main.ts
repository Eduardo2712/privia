import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { useContainer } from "class-validator";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./infrastructure/filters/http-exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "node:path";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { Queue } from "bullmq";

const cookieParser = require("cookie-parser");

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ["error", "warn", "log"],
        snapshot: true
    });

    if (process.env.NODE_ENV === "development") {
        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath("/queues");

        const queueNames = ["process-file"];

        const queues = queueNames.map((name) => {
            return new BullMQAdapter(
                new Queue(name, {
                    connection: {
                        host: process.env.REDIS_HOST,
                        port: Number(process.env.REDIS_PORT)
                    }
                })
            );
        });

        createBullBoard({
            queues,
            serverAdapter
        });

        app.use("/queues", serverAdapter.getRouter());
    }

    app.use(cookieParser());

    const rawOrigins =
        process.env.FRONTEND_URL?.split(",")
            .map((o) => o.trim())
            .filter(Boolean) ?? [];
    const defaultDevOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
    const allowedOrigins = rawOrigins.length > 0 ? rawOrigins : defaultDevOrigins;

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Authorization"]
    });

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.setGlobalPrefix("/api");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useStaticAssets(join(__dirname, "..", "src/public"));
    app.useGlobalFilters(new HttpExceptionFilter());

    const config = new DocumentBuilder().setTitle("API").setVersion("1.0").addCookieAuth("privia-token").build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("api/docs", app, document);

    await app.listen(process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 8080, "0.0.0.0");
}

bootstrap().catch((err) => console.error(err));

