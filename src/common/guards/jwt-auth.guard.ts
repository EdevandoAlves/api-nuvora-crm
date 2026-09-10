import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { Observable } from "rxjs";
import { FastifyRequest } from "fastify";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "src/common/decorators/public.decorator";

interface AuthPayload extends jwt.JwtPayload {
  id: string;
  role: string;
  organization: string;
}

type AuthRequest = FastifyRequest & {
  user?: AuthPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const auth = request.headers.authorization;

    if (!auth) {
      throw new UnauthorizedException("Authentication required");
    }

    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid authoriztion header");
    }

    const secret = this.configService.getOrThrow<string>("SECRET_KEY");

    try {
      const payload = jwt.verify(token, secret) as AuthPayload;

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
