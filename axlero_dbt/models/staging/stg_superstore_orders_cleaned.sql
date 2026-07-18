select
    row_id,
    order_id,
    cast(order_date as date) as order_date,
    cast(ship_date as date) as ship_date,
    ship_mode,
    customer_id,
    trim(customer_name) as customer_name,
    segment,
    country,
    city,
    state,
    postal_code,
    region,
    product_id,
    category,
    sub_category,
    trim(product_name) as product_name,
    cast(sales as decimal(10,2)) as sales,
    cast(quantity as int) as quantity,
    cast(discount as decimal(5,2)) as discount,
    cast(profit as decimal(10,2)) as profit
from {{ ref('stg_superstore_orders') }}
where order_id is not null