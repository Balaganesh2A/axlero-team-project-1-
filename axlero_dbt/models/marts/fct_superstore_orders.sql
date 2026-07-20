select
    order_id,
    order_date,
    customer_id,
    segment,
    country,
    city,
    state,
    postal_code,
    region,
    category,
    sub_category,
    sales,
    quantity,
    discount,
    profit,
    profit / nullif(sales, 0) as margin
from {{ ref('stg_superstore_orders_cleaned') }}