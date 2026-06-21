import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { REF_CATEGORIES } from "../constants/ref-categories.js";
import {
  router,
  protectedProcedure,
  adminProcedure,
  isAdminEmail,
  type ProtectedContext,
} from "../trpc.js";
import { refService } from "../services/ref.service.js";
import { AuthorizationError } from "../services/session.service.js";

const categorySchema = z.enum(REF_CATEGORIES);

const refUrlSchema = z
  .string()
  .trim()
  .pipe(z.url({ protocol: /^https?$/ }));

const refInputSchema = z.object({
  category: categorySchema,
  text: z.string().trim().min(1, "Text is required"),
  url: refUrlSchema,
  order: z.number().int().optional(),
});

function logRefMutation(
  operation: "adminCreate" | "adminUpdate" | "adminDelete",
  userId: string,
  refId: string | undefined,
  phase: "start" | "success"
): void {
  console.log(
    JSON.stringify({
      event: "ref_mutation",
      operation,
      userId,
      refId,
      phase,
      timestamp: new Date().toISOString(),
    })
  );
}

function toTRPCError(error: unknown): never {
  if (error instanceof AuthorizationError) {
    throw new TRPCError({ code: "FORBIDDEN", message: error.message });
  }
  throw error;
}

export const refsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          category: categorySchema.optional(),
          page: z.number().int().min(1).optional(),
          pageSize: z.number().int().min(1).max(50).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      try {
        return await refService.getRefs(ctx.db.prisma, userId, {
          search: input?.search,
          category: input?.category,
          page: input?.page,
          pageSize: input?.pageSize,
        });
      } catch (error) {
        toTRPCError(error);
      }
    }),

  isAdmin: protectedProcedure.query(({ ctx }) => {
    return isAdminEmail((ctx as ProtectedContext).user.email);
  }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    return refService.listAllForAdmin(ctx.db.prisma);
  }),

  adminCreate: adminProcedure
    .input(refInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      logRefMutation("adminCreate", userId, undefined, "start");
      const ref = await refService.createRef(ctx.db.prisma, input);
      logRefMutation("adminCreate", userId, ref.id, "success");
      return ref;
    }),

  adminUpdate: adminProcedure
    .input(z.object({ id: z.string().min(1), data: refInputSchema }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      logRefMutation("adminUpdate", userId, input.id, "start");
      const ref = await refService.updateRef(ctx.db.prisma, input.id, input.data);
      logRefMutation("adminUpdate", userId, ref.id, "success");
      return ref;
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      logRefMutation("adminDelete", userId, input.id, "start");
      const result = await refService.deleteRef(ctx.db.prisma, input.id);
      logRefMutation("adminDelete", userId, input.id, "success");
      return result;
    }),
});
