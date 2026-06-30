import type { PrismaClient } from "@prisma/client";
import type { ExtendedPrismaClient } from "../prisma.js";
import {
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
} from "../constants/subscription.js";

type Db = ExtendedPrismaClient | PrismaClient;

const PRO_PLAN_NAMES = ["Pro", "Pro+"];

export const adminService = {
  async getStats(db: Db) {
    const now = new Date();

    const [paidUsers, revenue] = await Promise.all([
      db.user.count({
        where: {
          subscriptions: {
            some: {
              status: SUBSCRIPTION_STATUS.ACTIVE,
              endDate: { gte: now },
              plan: { name: { in: PRO_PLAN_NAMES } },
            },
          },
        },
      }),
      db.payment.aggregate({
        where: { status: PAYMENT_STATUS.CAPTURED },
        _sum: { amount: true },
      }),
    ]);

    return {
      paidUsers,
      totalRevenuePaise: revenue._sum.amount ?? 0,
      currency: "INR",
    };
  },
};
