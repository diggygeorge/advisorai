This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- Course recommendations using your JSON data files
- Optional AI-powered recommendations using OpenAI's GPT-4
- Optional integration with Supabase for vector search
- Interactive course browsing with filtering
- Academic schedule planning
- Real-time recommendations based on career path
- Works with or without external API keys

## Environment Setup

The application works with or without environment variables. For enhanced AI features, create a `.env.local` file in the root directory with the following variables:

```bash
# OpenAI API Key for enhanced AI recommendations (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration for vector search (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# O*NET API for real-time career data (optional)
ONET_API_KEY=your_onet_api_key_here
```

**Note**: Without these environment variables, the app will use basic course recommendations from the JSON data files.

### O*NET API Setup

For comprehensive career data, you can integrate the O*NET API:

1. **Get API Access**: Visit [O*NET Center](https://www.onetcenter.org/) and register for API access
2. **Add API Key**: Add `ONET_API_KEY` to your `.env.local` file
3. **Test Integration**: The system will automatically use O*NET data when available

See `ONET_SETUP.md` for detailed integration instructions.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
