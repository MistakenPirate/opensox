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
  proProjectService,
  ReorderValidationError,
} from "../services/proProject.service.js";
import { AuthorizationError } from "../services/session.service.js";

const projectUrlSchema = z
  .string()
  .trim()
  .pipe(z.url({ protocol: /^https?$/ }));

const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  url: projectUrlSchema,
  qualities: z.string().trim().min(1, "Qualities are required"),
});

function logProjectMutation(
  operation: "adminCreate" | "adminUpdate" | "adminDelete" | "adminReorder",
  userId: string,
  projectId: string | undefined,
  phase: "start" | "success"
): void {
  console.log(
    JSON.stringify({
      event: "pro_project_mutation",
      operation,
      userId,
      projectId,
      phase,
      timestamp: new Date().toISOString(),
    })
  );
}

function toTRPCError(error: unknown): never {
  if (error instanceof AuthorizationError) {
    throw new TRPCError({ code: "FORBIDDEN", message: error.message });
  }
  if (error instanceof ReorderValidationError) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }
  throw error;
}

export const proProjectsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          page: z.number().int().min(1).optional(),
          pageSize: z.number().int().min(1).max(50).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      try {
        return await proProjectService.getProjects(ctx.db.prisma, userId, {
          search: input?.search,
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
    return proProjectService.listAllForAdmin(ctx.db.prisma);
  }),

  adminCreate: adminProcedure
    .input(projectInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      logProjectMutation("adminCreate", userId, undefined, "start");
      const project = await proProjectService.createProject(
        ctx.db.prisma,
        input
      );
      logProjectMutation("adminCreate", userId, project.id, "success");
      return project;
    }),

  adminUpdate: adminProcedure
    .input(z.object({ id: z.string().min(1), data: projectInputSchema }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      logProjectMutation("adminUpdate", userId, input.id, "start");
      const project = await proProjectService.updateProject(
        ctx.db.prisma,
        input.id,
        input.data
      );
      logProjectMutation("adminUpdate", userId, project.id, "success");
      return project;
    }),

  adminReorder: adminProcedure
    .input(z.object({ ids: z.array(z.string().min(1)).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      logProjectMutation("adminReorder", userId, undefined, "start");
      try {
        const result = await proProjectService.reorderProjects(
          ctx.db.prisma,
          input.ids
        );
        logProjectMutation("adminReorder", userId, undefined, "success");
        return result;
      } catch (error) {
        toTRPCError(error);
      }
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      logProjectMutation("adminDelete", userId, input.id, "start");
      const result = await proProjectService.deleteProject(
        ctx.db.prisma,
        input.id
      );
      logProjectMutation("adminDelete", userId, input.id, "success");
      return result;
    }),
});
