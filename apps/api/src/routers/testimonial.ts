import { router, protectedProcedure, publicProcedure } from "../trpc.js";
import { z } from "zod";
import { userService } from "../services/user.service.js";
import { TRPCError } from "@trpc/server";
import { validateAvatarUrl } from "../utils/avatar-validator.js";

export const testimonialRouter = router({
  getAll: publicProcedure.query(async ({ ctx }: any) => {
    const testimonials = await ctx.db.prisma.testimonial.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return testimonials;
  }),

  getMyTestimonial: protectedProcedure.query(async ({ ctx }: any) => {
    const userId = ctx.user.id;

    const { isPaidUser } = await userService.checkSubscriptionStatus(
      ctx.db.prisma,
      userId
    );

    if (!isPaidUser) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only premium users can submit testimonials",
      });
    }

    const testimonial = await ctx.db.prisma.testimonial.findUnique({
      where: { userId },
    });

    return {
      testimonial,
    };
  }),

  submit: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(40, "Name must be at most 40 characters"),
        content: z
          .string()
          .min(10, "Testimonial must be at least 10 characters")
          .max(1500, "Testimonial must be at most 1500 characters"),
        avatar: z.url(),
        socialLink: z
          .string()
          .optional()
          .refine(
            (val) => {
              if (!val || val === "") return true;
              try {
                const parsedUrl = new URL(val);
                const supportedPlatforms = [
                  "twitter.com",
                  "x.com",
                  "linkedin.com",
                  "instagram.com",
                  "youtube.com",
                  "youtu.be",
                ];
                return supportedPlatforms.some(
                  (platform) =>
                    parsedUrl.hostname === platform ||
                    parsedUrl.hostname.endsWith("." + platform)
                );
              } catch {
                return false;
              }
            },
            {
              message:
                "Must be a valid Twitter/X, LinkedIn, Instagram, or YouTube URL",
            }
          )
          .or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const userId = ctx.user.id;

      const { isPaidUser } = await userService.checkSubscriptionStatus(
        ctx.db.prisma,
        userId
      );

      if (!isPaidUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only premium users can submit testimonials",
        });
      }

      const existingTestimonial = await ctx.db.prisma.testimonial.findUnique({
        where: { userId },
      });

      if (existingTestimonial) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You have already submitted a testimonial. Testimonials cannot be edited once submitted.",
        });
      }

      // Validate avatar URL with strict security checks
      await validateAvatarUrl(input.avatar);

      const result = await ctx.db.prisma.testimonial.create({
        data: {
          userId,
          name: input.name,
          content: input.content,
          avatar: input.avatar,
          socialLink: input.socialLink || null,
        },
      });

      return result;
    }),

  shouldShowPopup: protectedProcedure.query(async ({ ctx }: any) => {
    const userId = ctx.user.id;

    const { isPaidUser } = await userService.checkSubscriptionStatus(
      ctx.db.prisma,
      userId
    );

    if (!isPaidUser) {
      return { show: false };
    }

    const existingTestimonial = await ctx.db.prisma.testimonial.findUnique({
      where: { userId },
    });

    if (existingTestimonial) {
      return { show: false };
    }

    // use earliest subscription so renewals do not reset the 3-week clock
    const earliestSubscription = await ctx.db.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { startDate: "asc" },
      select: { startDate: true },
    });

    if (!earliestSubscription) {
      return { show: false };
    }

    const THREE_WEEK_MS = 21 * 24 * 60 * 60 * 1000;
    const subscriptionAge =
      Date.now() - earliestSubscription.startDate.getTime();

    return { show: subscriptionAge > THREE_WEEK_MS };
  }),
});
