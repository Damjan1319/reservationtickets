# Ulaznice

Rezervacije i QR karte za klubove, kafiće i restorane. Svaki lokal dobija svoj link (`ime.ulaznice.rs`), gosti rezervišu mesto ili kartu, a osoblje na ulazu skenira QR.

## Pokretanje

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

Seed pravi samo superadmin nalog: `damjan@ulaznice.rs`.

## Plaćanje

Online je simulacija: status odmah postaje plaćeno. Na ulazu ostaje neplaćeno dok osoblje ne označi.

## Jezik

SR / EN prekidač u headeru (kolačić `locale`).
