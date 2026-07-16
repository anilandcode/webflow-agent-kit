---
title: Tools Overview
description: Complete reference for all 62 tools across 15 API groups.
---

| Group | Tools | Key Actions |
|---|---|---|
| **Sites** | 4 | listSites, getSite, publishSite, getCustomDomains |
| **Pages** | 4 | listPages, getPageMetadata, updatePageMetadata, updateStaticContent |
| **CMS Items** | 7 | CRUD + publish + live listing with auto-batching |
| **Collections + Fields** | 5 | list/generate collections, CRUD for fields |
| **Assets** | 5 | list, create (S3 upload URL), get, delete, list folders |
| **Forms** | 5 | list, get, list submissions, get submission, update submission |
| **Ecommerce Products** | 4 | list, get, create (SKU properties), update |
| **Ecommerce Orders** | 5 | list, get, update, fulfill, unfulfill |
| **Ecommerce Inventory** | 3 | get, update (absolute/incremental), get settings |
| **Custom Code** | 3 | get, upsert (header/footer scripts), delete |
| **Redirects** | 3 | list, create, delete (Enterprise only) |
| **SEO** | 4 | robots.txt get/update, well-known files get/upload (Enterprise) |
| **Webhooks** | 4 | list, create, get, delete |
| **Components** | 5 | list, get content, update content, get properties, update properties |
| **Audit Logs** | 1 | list workspace audit logs |
| **Total** | **62** | |

Every tool is:
- **Zod-validated** — runtime type checking on all inputs
- **LLM-optimized** — descriptions designed for model routing decisions
- **Auto-batched** — CMS items automatically split into API-safe chunks
- **Rate-limited** — built-in token bucket with exponential backoff
