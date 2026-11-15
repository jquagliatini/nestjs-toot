import { Config } from "@jqgl.cc/config";
import { DispatchableModule } from "@jqgl.cc/dispatchable";
import { EventEmitterDispatchableTransport } from "@jqgl.cc/dispatchable/transports/event-emitter";
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { AuthController } from "./auth.controller.js";
import { OptionallyRehydrateUserPipe, RehydrateUserPipe } from "./auth.decorators.js";
import { AuthInterceptor } from "./auth.interceptor.js";
import { AuthService } from "./auth.service.js";
import { Signer } from "./domain/signer.js";
import { AuthUserRepository } from "./infrastructure/auth-user.repository.js";
import { authCommands, AuthCommandBus } from "./infrastructure/commands/auth.command-bus.js";
import { RehydrateTokenCommandHandler } from "./infrastructure/commands/rehydrate-token.command.js";
import { SigninCommandHandler } from "./infrastructure/commands/signin.command.js";
import { SignupCommandHandler } from "./infrastructure/commands/signup.command.js";
import { authQueries, AuthQueryBus } from "./infrastructure/queries/auth.query-bus.js";
import { IntrospectQueryHandler } from "./infrastructure/queries/introspect.query.js";
import { SessionSigner } from "./infrastructure/session-signer.service.js";

@Module({
  controllers: [AuthController],
  imports: [
    DispatchableModule.forFeature(`authCommands`, {
      dispatchables: authCommands,
      busInjectionToken: AuthCommandBus,
      transport: EventEmitterDispatchableTransport,
    }),
    DispatchableModule.forFeature(`authQueries`, {
      dispatchables: authQueries,
      busInjectionToken: AuthQueryBus,
      transport: EventEmitterDispatchableTransport,
    }),
  ],
  providers: [
    {
      provide: Signer,
      inject: [Config],
      useFactory: (config: Config) => new Signer(Buffer.from(config.app.secret)),
    },
    AuthService,
    AuthUserRepository,
    IntrospectQueryHandler,
    RehydrateTokenCommandHandler,
    RehydrateUserPipe,
    OptionallyRehydrateUserPipe,
    SessionSigner,
    SigninCommandHandler,
    SignupCommandHandler,
    { provide: APP_INTERCEPTOR, useClass: AuthInterceptor },
  ],
})
export class AuthModule {}
