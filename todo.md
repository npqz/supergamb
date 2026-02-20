# SuperGamb Enhancement TODO

## Authentication & User Management
- [x] Implement working registration system with database
- [x] Implement working login system with OAuth
- [x] Add user balance persistence in database
- [x] Add user game history tracking

## Games Enhancement
- [x] Add Blackjack game with realistic card mechanics
- [x] Add Poker game (Texas Hold'em) - Skipped
- [x] Add Roulette with better animations
- [x] Improve Slots game with better graphics and animations
- [x] Improve Dice game visuals
- [x] Add Baccarat game - Skipped
- [x] Add game statistics and win/loss tracking

## Visual Improvements
- [x] Enhance overall design with better gradients and effects
- [x] Add realistic casino chip graphics
- [x] Add card animations for card games
- [x] Improve game result animations
- [x] Add sound effects for games (optional) - Skipped
- [x] Better mobile responsiveness

## Content Changes
- [x] Remove VIP Club section from homepage
- [x] Remove VIP Club from navigation
- [x] Remove VIP Club from footer
- [x] Update FAQ to remove VIP-related questions

## Database Schema
- [x] Create user_balances table
- [x] Create game_history table
- [x] Create user_sessions table - Not needed

## New Authentication System
- [x] Add username and password fields to users table
- [x] Make fields optional for backward compatibility with OAuth
- [x] Create auth.ts with password hashing functions
- [x] Create jwt.ts for JWT token management
- [x] Update context.ts to support both OAuth and username/password auth
- [x] Add register endpoint to auth router
- [x] Add login endpoint to auth router
- [x] Create LoginDialog component with registration form
- [x] Update Header to use LoginDialog instead of OAuth redirect
- [x] Add authentication check before allowing gameplay
- [x] Show login prompt when unauthenticated users try to play
- [x] Disable game controls for unauthenticated users
- [x] Test registration flow
- [x] Test login flow
- [x] Test game restrictions

## Live Support Chat
- [x] Create LiveSupportChat component with chat interface
- [x] Add bot auto-response functionality
- [x] Add floating support button to Home page
- [x] Add Live Support link to Footer

## Deposit & Withdrawal System
- [x] Create DepositDialog component with crypto selection (USDT, BTC, ETH, LTC)
- [x] Display crypto addresses for deposits
- [x] Create WithdrawalDialog component
- [x] Implement 1.5x withdrawal requirement calculator
- [x] Display crypto addresses for withdrawals
- [x] Add deposit/withdrawal buttons to Header
- [x] Test deposit flow
- [x] Test withdrawal flow with 1.5x requirement

## Promo Code System
- [x] Add promo code field to registration form
- [x] Implement promo code validation in backend
- [x] Add "Supa" promo code that gives 2500 starting balance
- [x] Change default starting balance from 1000 to 0
- [x] Update balance initialization logic
- [x] Test promo code functionality

## Final Polish
- [x] Test all features end-to-end
- [x] Verify all games work correctly
- [x] Verify deposit/withdrawal dialogs work
- [x] Verify live support chat works
- [x] Final checkpoint and deployment

## Remember Me Feature
- [x] Add Remember Me checkbox to LoginDialog component
- [x] Update login mutation to pass rememberMe flag to backend
- [x] Modify backend login endpoint to accept rememberMe parameter
- [x] Update JWT signing to support 30-day expiration when rememberMe is true
- [x] Update cookie options to set maxAge to 30 days when rememberMe is true
- [ ] Test Remember Me functionality

## Session Persistence Fix
- [ ] Investigate why cookies aren't persisting after page refresh
- [ ] Check cookie domain and sameSite settings
- [ ] Verify JWT token is being properly set in response
- [ ] Test cookie persistence in browser
- [ ] Fix session handling to maintain login state after refresh
