import type { PrismaClient } from "@prisma/client";
import type { RefCategory } from "../constants/ref-categories.js";
import type { ExtendedPrismaClient } from "../prisma.js";
import { SUBSCRIPTION_STATUS } from "../constants/subscription.js";
import { AuthorizationError } from "./session.service.js";

type Db = ExtendedPrismaClient | PrismaClient;

export interface PublicRef {
  id: string;
  category: RefCategory;
  text: string;
  url: string;
  order: number;
  createdAt: Date;
}

const PUBLIC_REF_SELECT = {
  id: true,
  category: true,
  text: true,
  url: true,
  order: true,
  createdAt: true,
} as const;

type RefWhere = {
  category?: RefCategory;
  text?: { contains: string; mode: "insensitive" };
};

type ProRefModel = {
  count: (args: { where: RefWhere }) => Promise<number>;
  findMany: (args: {
    where?: RefWhere;
    select?: typeof PUBLIC_REF_SELECT;
    orderBy?: Array<{ order: "asc" | "desc" } | { createdAt: "asc" | "desc" }>;
    skip?: number;
    take?: number;
  }) => Promise<PublicRef[]>;
  create: (args: {
    data: { category: RefCategory; text: string; url: string; order: number };
  }) => Promise<PublicRef>;
  update: (args: {
    where: { id: string };
    data: { category: RefCategory; text: string; url: string; order: number };
  }) => Promise<PublicRef>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

function refDb(db: Db): {
  proRef: ProRefModel;
  $transaction: (
    queries: [Promise<number>, Promise<PublicRef[]>]
  ) => Promise<[number, PublicRef[]]>;
} {
  return db as unknown as {
    proRef: ProRefModel;
    $transaction: (
      queries: [Promise<number>, Promise<PublicRef[]>]
    ) => Promise<[number, PublicRef[]]>;
  };
}

export type PaginatedRefs = {
  items: PublicRef[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export type RefInput = {
  category: RefCategory;
  text: string;
  url: string;
  order?: number | undefined;
};

async function assertActiveSubscription(db: Db, userId: string): Promise<void> {
  const subscription = await db.subscription.findFirst({
    where: {
      userId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { gte: new Date() },
    },
  });

  if (!subscription) {
    throw new AuthorizationError(
      "Active subscription required to access references"
    );
  }
}

export const refService = {
  async getRefs(
    db: Db,
    userId: string,
    options: {
      search?: string | undefined;
      category?: RefCategory | undefined;
      page?: number | undefined;
      pageSize?: number | undefined;
    } = {}
  ): Promise<PaginatedRefs> {
    await assertActiveSubscription(db, userId);

    const search = options.search?.trim();
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Math.floor(options.pageSize ?? DEFAULT_PAGE_SIZE))
    );

    const where: RefWhere = {};

    if (options.category) {
      where.category = options.category;
    }

    if (search) {
      where.text = { contains: search, mode: "insensitive" };
    }

    const client = refDb(db);
    const [total, items] = await client.$transaction([
      client.proRef.count({ where }),
      client.proRef.findMany({
        where,
        select: PUBLIC_REF_SELECT,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async listAllForAdmin(db: Db) {
    return refDb(db).proRef.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  },

  async createRef(db: Db, input: RefInput) {
    return refDb(db).proRef.create({
      data: {
        category: input.category,
        text: input.text,
        url: input.url,
        order: input.order ?? 0,
      },
    });
  },

  async updateRef(db: Db, id: string, input: RefInput) {
    return refDb(db).proRef.update({
      where: { id },
      data: {
        category: input.category,
        text: input.text,
        url: input.url,
        order: input.order ?? 0,
      },
    });
  },

  async deleteRef(db: Db, id: string) {
    await refDb(db).proRef.delete({ where: { id } });
    return { id };
  },
};
