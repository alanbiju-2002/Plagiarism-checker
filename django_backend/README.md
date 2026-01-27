Django REST backend (minimal scaffold)

Quick start (Windows PowerShell):

1. Create and activate virtualenv:

```powershell
python -m venv env
env\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and update DB credentials.

4. Run migrations and create superuser:

```powershell
python manage.py migrate
python manage.py createsuperuser
```

5. Run server:

```powershell
python manage.py runserver 8000
```

API endpoints:
- POST `/api/auth/register/`  — register user (body: `username`, `email`, `password`, optional `full_name`, `role`)
- POST `/api/auth/login/`     — obtain JWT token pair (body: `username` and `password`)

Notes:
- Uses MySQL by default; set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `.env`.
- This is a minimal scaffold to replace or run alongside your existing backend.
