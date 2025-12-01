import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      organization: string;
      role: string,
    };
  }
}
