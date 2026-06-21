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

const refInputSchema = z.object({
  category: categorySchema,
  text: z.string().trim().min(1, "Text is required"),
  url: z.string().trim().url("A valid URL is required"),
  order: z.number().int().optional(),
});

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
      return refService.createRef(ctx.db.prisma, input);
    }),

  adminUpdate: adminProcedure
    .input(z.object({ id: z.string().min(1), data: refInputSchema }))
    .mutation(async ({ ctx, input }) => {
      return refService.updateRef(ctx.db.prisma, input.id, input.data);
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return refService.deleteRef(ctx.db.prisma, input.id);
    }),
});
