# CanAI Platform

A modern web application built with Webflow, Supabase, and React, integrated with various third-party services.

## Tech Stack

### Frontend
- **Webflow**: Main website and landing pages
- **React**: Dynamic components and interactive features
- **TailwindCSS**: Utility-first CSS framework

### Backend & Database
- **Supabase**: Backend as a Service (BaaS)
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Storage

### Authentication & User Management
- **MemberStack**: User authentication and membership management
- **Stripe**: Payment processing and subscription management

### Analytics & Monitoring
- **PostHog**: Product analytics and user behavior tracking
- **Sentry**: Error tracking and performance monitoring

### Integration & Automation
- **Make.com**: Workflow automation and integrations
- **Redis**: Caching and session management
- **Lovable**: Customer feedback and support

## Project Structure

```
canai-platform/
├── apps/                    # Application code
│   ├── web/                # Webflow integration
│   └── admin/              # Admin dashboard
├── packages/               # Shared packages
│   ├── ui/                # Shared UI components
│   ├── config/            # Shared configuration
│   └── utils/             # Shared utilities
├── databases/             # Database configurations
│   └── supabase/         # Supabase migrations and configs
├── integrations/         # Third-party integrations
│   ├── stripe/          # Stripe integration
│   ├── memberstack/     # MemberStack integration
│   ├── posthog/         # PostHog integration
│   ├── make/            # Make.com integration
│   └── lovable/         # Lovable integration
└── assets/              # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18.19.0 or later
- Yarn package manager
- Docker and Docker Compose
- Supabase CLI
- Webflow account
- MemberStack account
- Stripe account
- PostHog account
- Make.com account
- Lovable account

### Environment Setup
1. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start development services:
   ```bash
   docker-compose up -d
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

### Development Workflow

1. **Webflow Development**
   - Use Webflow Designer for main website
   - Export custom code to `apps/web/custom-code`
   - Use Webflow CMS for content management

2. **React Development**
   - Develop in `apps/admin`
   - Use shared components from `packages/ui`
   - Follow component documentation

3. **Supabase Development**
   - Use Supabase Studio for database management
   - Migrations in `databases/supabase/migrations`
   - Types generated in `packages/config/supabase`

4. **Integration Development**
   - Each integration has its own directory in `integrations/`
   - Follow integration-specific documentation
   - Use environment variables for credentials

## Deployment

### Webflow
- Deploy through Webflow Designer
- Custom code deployed through CI/CD

### Admin Dashboard
- Deployed to Vercel
- Automatic deployments on main branch

### Supabase
- Deployed through Supabase Dashboard
- Migrations run through CI/CD

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request
4. Ensure all tests pass
5. Get code review approval

## License

MIT License - see LICENSE file for details
