import os

def ensure_uploads_directory():
    path = os.path.join("app", "uploads", "roles")
    os.makedirs(path, exist_ok=True)
    print(f"✅ Verificado: {path}")

if __name__ == "__main__":
    ensure_uploads_directory()
