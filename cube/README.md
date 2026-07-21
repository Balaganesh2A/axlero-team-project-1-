# Cube Semantic Layer

## Overview

This project uses Cube as the semantic layer for the Superstore dataset stored in Snowflake.

## Technology

- Cube.dev 1.7.4
- Snowflake
- Node.js

## Running Cube

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Cube Playground is available at:

http://localhost:4000

## Data Source

Database: AXLERO_DEV

Schema: STAGING

Table: STG_SUPERSTORE_ORDERS_CLEANED

## Measures

- count
- total_sales
- total_profit
- total_quantity
- average_order_value
- total_cost
- profit_margin

## Dimensions

- order_id
- customer_name
- product_name
- category
- region
- country
- order_date

## Features

- Sales Analysis
- Profit Analysis
- Cost Calculation
- Profit Margin Calculation
- Country-wise Analysis
- Time-based Analysis (Year, Quarter, Month, Week, Day)

## Notes

- Cube is connected to Snowflake.
- Measures and dimensions have been tested in Cube Playground.
- Semantic layer changes have been committed and pushed to the repository.