from fastapi import FastAPI, Body
from dotenv import load_dotenv
import os
import requests

# Load .env file
load_dotenv()

app = FastAPI()

# Read Cube configuration
CUBE_API_URL = os.getenv("CUBE_API_URL")
CUBE_API_TOKEN = os.getenv("CUBE_API_TOKEN")


def get_sql(query: dict):
    headers = {
        "Authorization": CUBE_API_TOKEN,
        "Content-Type": "application/json"
    }
    sql_response = requests.post(
        CUBE_API_URL.replace("/load", "/sql"),
        json={"query": query},
        headers=headers,
        timeout=10
    )
    if sql_response.status_code == 200:
        return sql_response.json().get("sql", {}).get("sql", "")
    return None


@app.get("/")
def home():
    return {
        "message": "FastAPI Backend is running!"
    }


@app.get("/sales-by-category")
def sales_by_category():

    query = {
        "measures": ["orders.total_sales"],
        "dimensions": ["orders.category"]
    }

    headers = {
        "Authorization": CUBE_API_TOKEN,
        "Content-Type": "application/json"
    }

    response = requests.post(
        CUBE_API_URL,
        json={"query": query},
        headers=headers,
        timeout=10
    )

    result = response.json()
    result["debug"] = {
        "query": query,
        "sql": get_sql(query)
    }
    return result


@app.post("/query")
def run_query(query: dict = Body(...)):

    headers = {
        "Authorization": CUBE_API_TOKEN,
        "Content-Type": "application/json"
    }

    response = requests.post(
        CUBE_API_URL,
        json={"query": query},
        headers=headers,
        timeout=10
    )

    if response.status_code != 200:
        return {
            "status": response.status_code,
            "error": response.text
        }

    result = response.json()
    result["debug"] = {
        "query": query,
        "sql": get_sql(query)
    }
    return result


@app.post("/ask")
def ask(question: dict = Body(...)):

    text = question["question"].lower()

    if "sales" in text and "category" in text:

        cube_query = {
            "measures": ["orders.total_sales"],
            "dimensions": ["orders.category"]
        }

    elif "profit" in text and "region" in text:

        cube_query = {
            "measures": ["orders.total_profit"],
            "dimensions": ["orders.region"]
        }

    elif "quantity" in text:

        cube_query = {
            "measures": ["orders.total_quantity"]
        }

    else:
        return {
            "error": "Query not supported yet."
        }


    headers = {
        "Authorization": CUBE_API_TOKEN,
        "Content-Type": "application/json"
    }

    response = requests.post(
        CUBE_API_URL,
        json={"query": cube_query},
        headers=headers,
        timeout=10
    )

    if response.status_code != 200:
        return {
            "status": response.status_code,
            "error": response.text
        }

    result = response.json()

    answer = ""

    if "data" in result and len(result["data"]) > 0:

        if "sales" in text and "category" in text:
            answer = "Total Sales by Category:\n"
            for row in result["data"]:
                answer += f'{row["orders.category"]}: {row["orders.total_sales"]}\n'

        elif "profit" in text and "region" in text:
            answer = "Total Profit by Region:\n"
            for row in result["data"]:
                answer += f'{row["orders.region"]}: {row["orders.total_profit"]}\n'

        elif "quantity" in text:
            answer = f'Total Quantity: {result["data"][0]["orders.total_quantity"]}'

    return {
        "question": question["question"],
        "answer": answer,
        "cube_response": result
    }

