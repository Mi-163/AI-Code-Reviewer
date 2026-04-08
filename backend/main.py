from fastapi import FastAPI

# Initialize Apllication

app = FastAPI(title="AI Code Reviewer API")

# create endpoint((a URL we can visit to check if the server is alive)


@app.get("/")
def readroot():
    return {"status": "Backend engine is online"}
