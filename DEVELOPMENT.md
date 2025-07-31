# Development Guide

This document provides comprehensive information for developers working on the Platform Trading OANDA MT5 Indonesia project.

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Architecture](#architecture)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Project Structure

```
platform-trading-oanda-mt5/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   ├── dashboard/               # Dashboard pages
│   ├── subscription/            # Subscription pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable React components
│   ├── ErrorBoundary.tsx       # Error boundary component
│   ├── ThemeProvider.tsx       # Theme management
│   ├── TradingChart.jsx        # Trading chart component
│   └── OrderPanel.jsx          # Order panel component
├── lib/                        # Utility libraries
│   ├── supabase/              # Supabase client and utilities
│   ├── oanda/                 # OANDA API integration
│   ├── trading/               # Trading logic and strategies
│   ├── notifications/         # Notification services
│   └── utils/                 # General utilities
│       ├── logger.ts          # Logging system
│       ├── error-handler.ts   # Error handling
│       └── security.ts        # Security utilities
├── types/                      # TypeScript type definitions
│   └── index.ts               # Main type definitions
├── hooks/                      # Custom React hooks
├── e2e/                       # End-to-end tests
├── __tests__/                 # Unit tests
├── public/                    # Static assets
├── supabase/                  # Database migrations and config
└── scripts/                   # Build and deployment scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- PostgreSQL database (Supabase)
- Redis server (for caching and queues)
- Git

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/platform-trading-oanda-mt5.git
   cd platform-trading-oanda-mt5
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables in `.env.local`.

4. **Set up the database:**
   ```bash
   npm run db:migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Testing
npm test                # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run e2e             # Run end-to-end tests
npm run e2e:ui          # Run E2E tests with UI

# Database
npm run db:migrate      # Run database migrations
npm run db:reset        # Reset database
```

## Development Workflow

### Git Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add new trading strategy"
   ```

3. **Push and create a pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Review Process

1. All changes must be reviewed by at least one other developer
2. Ensure all tests pass
3. Check for proper TypeScript types
4. Verify security best practices
5. Test the changes locally

## Architecture

### Technology Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Backend:** Next.js API Routes, Node.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **Real-time:** Socket.io, WebSockets
- **Trading:** CCXT, Technical Indicators, OANDA API
- **UI:** Tailwind CSS, Radix UI, Framer Motion
- **Testing:** Jest, Playwright, Testing Library

### Key Components

#### 1. Authentication & Authorization
- Clerk for user authentication
- Role-based access control
- JWT token management
- Session security

#### 2. Trading Engine
- OANDA API integration
- Real-time market data
- Order execution
- Risk management
- Trading strategies

#### 3. Database Layer
- Supabase for data persistence
- Real-time subscriptions
- Row-level security
- Automatic backups

#### 4. Error Handling
- Comprehensive error boundaries
- Structured logging with Winston
- Error reporting and monitoring
- Graceful degradation

#### 5. Security
- Input validation with Zod
- Rate limiting
- CORS configuration
- Security headers
- Data encryption

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type when possible
- Use generic types appropriately

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: 'user' | 'premium' | 'admin';
}

// Bad
const user: any = { ... };
```

### React Components

- Use functional components with hooks
- Implement proper error boundaries
- Follow the single responsibility principle
- Use TypeScript for prop types

```tsx
// Good
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ onClick, disabled = false, children }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
```

### API Routes

- Use proper HTTP status codes
- Implement comprehensive error handling
- Validate input data
- Follow RESTful conventions

```typescript
// Good
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedData = schema.parse(data);
    
    const result = await processData(validatedData);
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
```

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first approach
- Use semantic class names
- Implement dark mode support

```tsx
// Good
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    Trading Dashboard
  </h2>
</div>
```

## Testing

### Unit Testing

- Write tests for all utility functions
- Test React components with Testing Library
- Mock external dependencies
- Aim for 70%+ code coverage

```typescript
// Example unit test
import { calculatePositionSize } from '@/lib/trading/utils';

describe('calculatePositionSize', () => {
  it('should calculate correct position size', () => {
    const result = calculatePositionSize(10000, 2, 50, 10);
    expect(result).toBe(4);
  });
});
```

### Integration Testing

- Test API routes with proper setup
- Test database operations
- Test external API integrations

### End-to-End Testing

- Test critical user journeys
- Test across different browsers
- Test responsive design
- Test accessibility

```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test('user can create a trading bot', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-bot-button"]');
  await page.fill('[data-testid="bot-name"]', 'Test Bot');
  await page.click('[data-testid="submit-button"]');
  
  await expect(page.locator('[data-testid="bot-list"]')).toContainText('Test Bot');
});
```

### Testing Best Practices

- Write descriptive test names
- Use proper test data setup
- Clean up after tests
- Test edge cases and error conditions

## Deployment

### Environment Configuration

- **Development:** Local environment with hot reloading
- **Staging:** Production-like environment for testing
- **Production:** Live environment with optimizations

### Build Process

1. **Type checking:** Ensure no TypeScript errors
2. **Linting:** Fix all ESLint issues
3. **Testing:** All tests must pass
4. **Build:** Create optimized production build
5. **Deploy:** Deploy to target environment

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] Monitoring and logging configured
- [ ] Backup systems in place
- [ ] Performance monitoring active

## Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Database Issues

```bash
# Reset database
npm run db:reset

# Check connection
npx supabase status
```

#### Authentication Issues

- Verify Clerk configuration
- Check environment variables
- Clear browser cookies and localStorage

#### Trading API Issues

- Verify OANDA API credentials
- Check API rate limits
- Monitor network connectivity

### Performance Issues

- Use React DevTools Profiler
- Analyze bundle size with webpack-bundle-analyzer
- Monitor Core Web Vitals
- Check database query performance

### Debugging Tips

1. **Use proper logging:**
   ```typescript
   import logger from '@/lib/utils/logger';
   logger.info('Processing trade order', { orderId, userId });
   ```

2. **Enable debug mode:**
   ```bash
   DEBUG=* npm run dev
   ```

3. **Use browser dev tools:**
   - Network tab for API calls
   - Console for JavaScript errors
   - Performance tab for profiling

## Contributing

1. Follow the development workflow
2. Write comprehensive tests
3. Update documentation
4. Follow code standards
5. Create detailed pull requests

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OANDA API Documentation](https://developer.oanda.com)

## Support

For development support, please:

1. Check this documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Note:** This is a live trading application. Always test thoroughly in a safe environment before deploying to production.