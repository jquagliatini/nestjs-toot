import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import type { NodeRequest } from "@nestjs/platform-node";
import { trace } from "@opentelemetry/api";
import type { Observable } from "rxjs";

export class HttpInstrumentationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    if (context.getType() === "http") {
      const req = context.switchToHttp().getRequest<NodeRequest>();
      if (req.route) {
        trace.getActiveSpan()?.updateName(`${req.method} ${req.route.path}`);
      }
    }

    return next.handle();
  }
}
