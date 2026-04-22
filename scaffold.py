import os

base_dir = r"e:\Alumini Project\Alumni Nexus\backend"
app_dir = os.path.join(base_dir, "app")

folders = [
    app_dir,
    os.path.join(app_dir, "routes"),
    os.path.join(app_dir, "models"),
    os.path.join(app_dir, "schemas"),
    os.path.join(app_dir, "services"),
    os.path.join(app_dir, "db"),
    os.path.join(app_dir, "auth"),
    os.path.join(app_dir, "ai"),
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)
    init_file = os.path.join(folder, "__init__.py")
    if not os.path.exists(init_file):
        with open(init_file, "w") as f:
            pass

reqs = """fastapi
uvicorn
motor
sentence-transformers
faiss-cpu
python-jose[cryptography]
passlib[bcrypt]
python-multipart
pydantic
pydantic-settings
uuid
"""
with open(os.path.join(base_dir, "requirements.txt"), "w") as f:
    f.write(reqs)

dockerfile = """FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
with open(os.path.join(base_dir, "Dockerfile"), "w") as f:
    f.write(dockerfile)

print("Scaffolding completed successfully.")
