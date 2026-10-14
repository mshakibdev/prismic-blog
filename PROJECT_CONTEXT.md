# Project Context: Building a Production Blog with Next.js + Prismic CMS

I am building a professional blog website using:

- **Next.js (latest stable version)**
- **TypeScript**
- **App Router**
- **Tailwind CSS**
- **Prismic CMS**
- **Slice Machine / Prismic Custom Types**

The goal is to build a production-ready blog system where content is managed from Prismic CMS, not hardcoded.

## Project Goal

Build a scalable blog platform with:

- CMS-managed blog posts
- Dynamic blog pages
- SEO optimization
- Reusable content blocks (Slices)
- Fast performance
- Responsive design
- Production deployment

## Planned Features

### 1. Blog Management

Prismic will manage:

- Blog title
- Featured image
- Author
- Category
- Publish date
- Content sections
- SEO metadata

### 2. Dynamic Blog Pages

Example:

```text
website.com/blog/article-name
```

Features:

- Dynamic routing
- SEO metadata
- Related posts
- Responsive layout

### 3. Prismic Slices

Reusable content blocks:

- Hero section
- Rich text section
- Image section
- Quote section
- CTA section

The editor can build blog layouts without coding.

### 4. SEO

Planned:

- Dynamic metadata
- Open Graph tags
- Sitemap
- Robots.txt
- Article schema

### 5. Performance

Planned:

- Server components
- Image optimization
- ISR caching
- Fast loading

## Work Completed So Far

### Step 1: Next.js Setup

Completed:

- Created Next.js project
- TypeScript enabled
- Tailwind CSS enabled
- App Router enabled

Project folder:

```text
D:\Clients\Tinyflow\prismic-blog
```

### Step 2: Prismic Initialization

Completed:

Command used:

```sh
npx prismic init --repo prismic-tiny-blog
```

Result:

```text
Initialized Prismic for repository "prismic-tiny-blog".
```

Prismic dependencies installed successfully.

Prismic generated configuration files.

## Current Terminal Output

After initialization Prismic asked:

```text
Action required: add <PrismicPreview> to your root layout.
```

Required changes:

In:

```text
src/app/layout.tsx
```

Add:

```tsx
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
```

Then inside layout:

```tsx
<PrismicPreview repositoryName={repositoryName} />
```

This enables Prismic preview functionality.

## Important Note

Do not use the older Slice Machine initialization instructions.

The current setup is using:

```sh
npx prismic init
```

which is the newer Prismic CLI workflow.

## Current Status

Completed:

- ✅ Next.js project created
- ✅ Prismic repository initialized
- ✅ Prismic packages installed
- ✅ Prismic connection created

Pending:

- ⬜ Add `<PrismicPreview>` to layout
- ⬜ Verify project runs without errors
- ⬜ Create Prismic Custom Types
- ⬜ Build Blog Post content model
- ⬜ Create Slices
- ⬜ Fetch Prismic content in Next.js
- ⬜ Create dynamic blog routes
- ⬜ Add SEO
- ⬜ Deploy

## Next Steps

### Step 3: Finish Prismic Setup

1. Update `src/app/layout.tsx` with PrismicPreview.
2. Run:

```sh
npm run dev
```

Check:

```text
http://localhost:3000
```

### Step 4: Create Content Model

Create Blog Post Custom Type in Prismic.

Structure:

```text
Blog Post

├── Title
├── UID
├── Featured Image
├── Excerpt
├── Author
├── Category
├── Publish Date
├── SEO Title
├── SEO Description
└── Body (Slices)
```

### Step 5: Build Slices

Create reusable components:

```text
slices/

├── Hero
├── RichText
├── Image
├── Quote
└── CallToAction
```

### Step 6: Connect Frontend

Implement:

- Prismic client
- Fetch blog data
- Dynamic routes:

```text
app/blog/[uid]/page.tsx
```

### Step 7: Production Features

Add:

- Preview mode
- Webhooks
- SEO
- Sitemap
- Performance optimization
- Deployment

When continuing, first ask me to verify my current files:

```text
package.json
src/app/layout.tsx
prismicio.ts
slicemachine.config.json
```

Then continue from the current step.
