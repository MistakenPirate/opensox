import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  router,
  protectedProcedure,
  adminProcedure,
  isAdminEmail,
  type ProtectedContext,
} from "../trpc.js";
import {
  sessionService,
  AuthorizationError,
} from "../services/session.service.js";

const sessionInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  youtubeUrl: z.string().trim().url("A valid YouTube URL is required"),
  sessionDate: z.coerce.date(),
  topics: z
    .array(
      z.object({
        timestamp: z.string().trim(),
        topic: z.string().trim().min(1),
      })
    )
    .default([]),
});

function toTRPCError(error: unknown): never {
  if (error instanceof AuthorizationError) {
    throw new TRPCError({ code: "FORBIDDEN", message: error.message });
  }
  throw error;
}

export const sessionsRouter = router({
  getAll: protectedProcedure
  .input(z.object({
    query: z.string().trim().optional()
  }).optional())
  .query(async ({ ctx, input }) => {
    const userId = (ctx as ProtectedContext).user.id;

    try {
      return await sessionService.getSessions(ctx.db.prisma, userId, input?.query);
    } catch (error) {
      toTRPCError(error);
    }
  }),

  isAdmin: protectedProcedure.query(({ ctx }) => {
    return isAdminEmail((ctx as ProtectedContext).user.email);
  }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    return sessionService.listAllForAdmin(ctx.db.prisma);
  }),

  adminCreate: adminProcedure
    .input(sessionInputSchema)
    .mutation(async ({ ctx, input }) => {
      return sessionService.createSession(ctx.db.prisma, input);
    }),

  adminUpdate: adminProcedure
    .input(z.object({ id: z.string().min(1), data: sessionInputSchema }))
    .mutation(async ({ ctx, input }) => {
      return sessionService.updateSession(
        ctx.db.prisma,
        input.id,
        input.data
      );
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return sessionService.deleteSession(ctx.db.prisma, input.id);
    }),
});
