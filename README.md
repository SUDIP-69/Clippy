# Clippy

A private clipboard you can run on your laptop or on the public internet. Create a room, open the same link on every device, then share text, images, and files.

The room code **is** the password. Anyone with the link can read and write that clipboard.

## Run locally

```powershell
cd C:\Users\USER\Clippy
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DEV="1"
python app.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Deploy publicly (Render)

1. Push this folder to a GitHub repo.
2. In [Render](https://render.com), create a **Web Service** from that repo.
3. Render will pick up `render.yaml`, or set:
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `uvicorn app:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips=*`
4. Environment variables:
   - `DEV=0`
   - `TRUST_PROXY=1`
   - `DATA_DIR=/var/data`
   - `ALLOWED_HOSTS=your-app.onrender.com`
5. Add a **persistent disk** mounted at `/var/data` so clips survive restarts.

After it deploys, create a clipboard and use that HTTPS link on your phone (any network, not only home Wi‑Fi).

Docker works too: `docker build -t clippy .` then run with `-e TRUST_PROXY=1 -v clippy-data:/data -p 8000:8000`.

## Security model

This is **not** a login app. Protection is:

- 10-character unguessable room codes (~1e15 possibilities)
- Rate limits on create / write / guess
- Board code required on every read, write, download, and delete
- Files stored under random names; downloads are attachments
- Only real PNG/JPEG/GIF/WebP bytes are shown as images (HTML/SVG cannot execute)
- `/docs` is disabled, security headers + CSP, no-store on clipboard pages

Do not post a room link in public chats. Delete clips when you are done.

## Limits

- 25 MB per file
- 100 clips per room
- 8 new rooms per hour per IP
