# Sample cURL Flow

```bash
# Register (avatar optional)
curl -X POST http://localhost:5026/api/auth/register \
  -F firstName=Demo \
  -F lastName=User \
  -F email=demo@example.com \
  -F phone=1112223333 \
  -F password=Password123

# Verify (token logged in server console)
curl "http://localhost:5026/api/auth/verify?token=<token>"

# Login
curl -X POST http://localhost:5026/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"demo@example.com","password":"Password123"}'

# Authorized requests (replace <TOKEN> with JWT)
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5026/api/reservations

curl -X POST http://localhost:5026/api/reservations \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"floorplanId":"fp-main-hall","tableId":"T1","date":"2025-12-24","timeSlot":"19:00","guests":2}'
```

