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
  constructor(private readonly configService: ConfigService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const auth = request.headers.authorization;

    if (!auth) {
      return false;
    }

    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) {
      return false;
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
