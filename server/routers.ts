import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as auth from "./auth";
import { createSession } from "./store-json";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure
      .input(
        z.object({
          username: z.string().min(3).max(50),
          password: z.string().min(6),
          name: z.string().optional(),
          email: z.string().email().optional().or(z.literal('')),
          promoCode: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const user = await auth.createUser(
            input.username,
            input.password,
            input.name,
            input.email
          );

          // Apply promo code bonus if provided (ensure balance row exists first)
          if (input.promoCode && input.promoCode.toUpperCase() === 'SUPA') {
            await db.getUserBalance(user.id);
            await db.updateUserBalance(user.id, '2500.00');
          }

          const token = createSession(user.id);
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

          return {
            success: true,
            user: {
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
            },
          };
        } catch (error: any) {
          throw new Error(error.message || "Registration failed");
        }
      }),
    login: publicProcedure
      .input(
        z.object({
          username: z.string(),
          password: z.string(),
          rememberMe: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await auth.authenticateUser(input.username, input.password);

        if (!user) {
          throw new Error("Invalid username or password");
        }

        const expiresInMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined;
        const token = createSession(user.id, { expiresInMs });
        const baseCookieOptions = getSessionCookieOptions(ctx.req);
        
        // Set cookie maxAge to 30 days if rememberMe is true
        const cookieOptions = input.rememberMe 
          ? { ...baseCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days in milliseconds
          : baseCookieOptions;
        
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
          },
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  balance: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBalance(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({ newBalance: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateUserBalance(ctx.user.id, input.newBalance);
      }),
    reset: protectedProcedure.mutation(async ({ ctx }) => {
      return await db.resetUserBalance(ctx.user.id);
    }),
    getWithdrawalAddresses: protectedProcedure.query(async ({ ctx }) => {
      return db.getWithdrawalAddresses(ctx.user.id);
    }),
    setWithdrawalAddress: protectedProcedure
      .input(z.object({ crypto: z.enum(["USDT", "BTC", "ETH", "LTC"]), address: z.string() }))
      .mutation(async ({ ctx, input }) => {
        db.setWithdrawalAddress(ctx.user.id, input.crypto, input.address);
        return db.getWithdrawalAddresses(ctx.user.id);
      }),
  }),

  game: router({
    play: protectedProcedure
      .input(
        z.object({
          gameType: z.string(),
          betAmount: z.string(),
          winAmount: z.string(),
          result: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.addGameHistory({
          userId: ctx.user.id,
          gameType: input.gameType,
          betAmount: input.betAmount,
          winAmount: input.winAmount,
          result: input.result || null,
        });
      }),
    history: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserGameHistory(ctx.user.id, input?.limit || 50);
      }),
  }),
});

export type AppRouter = typeof appRouter;
