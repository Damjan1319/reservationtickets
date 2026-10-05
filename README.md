# Ulaznice

Rezervacije i QR karte za klubove, kafiće i restorane. Svaki lokal dobija svoj link (`ime.ulaznice.rs`), gosti rezervišu mesto ili kartu, a osoblje na ulazu skenira QR.

## Pokretanje

```bash
docker compose up -d
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

Seed pravi samo superadmin nalog. Email i lozinka idu iz `ADMIN_EMAIL` i `ADMIN_PASSWORD` u lokalnom `.env` — ne commituj ih.

Lokalna baza je Postgres (`docker compose`). Produkcija na Vercel koristi Neon.

## Plaćanje

Online plaćanje je trenutno ugašeno. Rezervacija ostaje neplaćena dok osoblje na ulazu ne označi.

## Jezik

SR / EN prekidač u headeru (kolačić `locale`).
