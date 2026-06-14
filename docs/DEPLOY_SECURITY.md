# Production xavfsizlik va `check --deploy`

`python manage.py check --deploy` production muhitida (`DJANGO_DEBUG=0`) quyidagi sozlamalarni tekshiradi.

## Loyihada yoqilgan (DEBUG=False)

| Sozlama | Maqsad |
|---------|--------|
| `SECURE_SSL_REDIRECT` | HTTP → HTTPS yo'naltirish |
| `SESSION_COOKIE_SECURE` | Session cookie faqat HTTPS |
| `CSRF_COOKIE_SECURE` | CSRF cookie faqat HTTPS |
| `SECURE_HSTS_SECONDS` | HSTS header (default: 1 yil) |
| `SECURE_HSTS_INCLUDE_SUBDOMAINS` | Subdomenlar HSTS ga kiradi |
| `SECURE_HSTS_PRELOAD` | HSTS preload ro'yxati uchun |
| `SECURE_CONTENT_TYPE_NOSNIFF` | MIME sniffing oldini oladi |
| `SECURE_REFERRER_POLICY` | Referrer sizib chiqishini cheklaydi |
| `X_FRAME_OPTIONS = DENY` | Clickjacking himoyasi |

## Reverse proxy (nginx, Cloudflare) ortida

HTTPS proxy tomonidan bajarilsa, `config/settings.py` dagi quyidagi qatorni yoqing:

```python
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
```

## `check --deploy` ogohlantirishlari (kutilgan)

Quyidagilar **normal** — alohida infrastruktura yoki keyingi tasklar bilan hal qilinadi:

| Ogohlantirish | Sabab | Yechim |
|---------------|-------|--------|
| `SECRET_KEY` insecure | Dev default key ishlatilmoqda | Production `.env` da kuchli `DJANGO_SECRET_KEY` |
| `DEBUG` True | Dev rejim | Production da `DJANGO_DEBUG=0` |
| `ALLOWED_HOSTS` bo'sh/noto'g'ri | Host whitelist | `DJANGO_ALLOWED_HOSTS=yourdomain.com` |
| Static fayllar | `STATIC_ROOT` yo'q | WhiteNoise/nginx + `collectstatic` |
| Database SSL | PostgreSQL SSL yo'q | Managed DB SSL opsiyasi |

## CORS

- `CORS_ALLOWED_ORIGINS` — default: `FRONTEND_URL` (`http://localhost:3000`)
- Bir nechta origin: `CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com`
- `CORS_ALLOW_CREDENTIALS=True` — cookie/JWT bilan cross-origin so'rovlar

## API throttling

| Kalit | Default | Env |
|-------|---------|-----|
| Anonim | 100/soat | `THROTTLE_RATE_ANON` |
| Autentifikatsiya | 1000/soat | `THROTTLE_RATE_USER` |

Default permission: `IsAuthenticatedOrReadOnly` — GET ochiq, yozish uchun login kerak. Public endpointlar (`AllowAny`) view darajasida aniq belgilangan.
