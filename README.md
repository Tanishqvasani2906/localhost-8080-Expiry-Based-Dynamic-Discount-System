#Frontned code can be seen in "frontend branch"
#Backend code can be seen in "tanishq-backend" branch
# localhost-8080

# Expiry-Based Dynamic Discount System

## Problem Statement

Pricing strategies for products and services often remain static, leading to inefficiencies in sales and revenue generation. Our goal is to implement a **dynamic discounting system** that adjusts prices based on time-sensitive factors, increasing sales efficiency and reducing wastage.

## Our Approach

We have designed a **multi-category dynamic pricing system** that applies different discounting strategies based on product type:

1. **Perishable Goods** (Implemented ✅): Discounts increase as expiry approaches to prevent waste.
2. **Event-Based Products** (Static Data 📊): Prices increase as event dates approach, with rare last-minute discounts.
3. **Subscription Services** (Static Data 📊): Discounts based on user behavior, engagement, and renewal history.

## What We Have Implemented So Far

✅ **[06/03/2025 | 12:00 AM]** Successfully implemented **dynamic pricing for perishable goods.**

- Admin panel allows adding perishable products (restricted access).
- Discounts are automatically calculated based on expiry date.
- Hosted Backend & Frontend for live testing.

✅ **[06/03/2025 | 10:25 AM]** Successfully implemented **dynamic pricing for event based products and subscription based products.**

> 📌 **Live Demonstration Available:** If anyone wants to see a real-time demo of perishable products dynamic pricing, feel free to contact us.

## Tech Stack

- **Frontend:** React.js (Vite) (Hosted on Vercel)
- **Backend:** Java Spring Boot with Hibernate ORM (Hosted on Render)
- **Database:** PostgreSQL (Hosted on NeonDB)
- **Containerization:** Docker

## Deployment Links

- **Frontend:** [Live Site](https://lh8080.vercel.app/)
- **Backend:** [API Endpoint](https://localhost-8080-expiry-based-dynamic.onrender.com/) (Restricted)

## Team

**localhost:8080**


