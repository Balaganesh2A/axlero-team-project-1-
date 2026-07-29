from fastapi import FastAPI, Body
import requests

app = FastAPI()

# Cube configuration
CUBE_API_URL = "http://localhost:4000/cubejs-api/v1/load"
CUBE_API_TOKEN = "8e255900dbf61cf1234fd2b25247e90b9c8bdfb0fc091eb2c06efd7c3e490b6e9ebffb0563bb6bc0ce7bff7abc351319fc3c325655ce4c46ab413cf8acae855e"


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

    if response.status_code != 200:
        return {
            "status": response.status_code,
            "error": response.text
        }

    return response.json()


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

    return response.json()