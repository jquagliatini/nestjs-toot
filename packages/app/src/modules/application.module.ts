import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module.js";
import { TootsModule } from "./toots/toots.module.js";

@Module({ imports: [AuthModule, TootsModule] })
export class ApplicationModule {}
