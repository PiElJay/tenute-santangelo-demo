# Tenute Santangelo — Demo

Home italiana e inglese, scene Three.js originali e admin interattivo.

## Percorsi
- `/it/`: homepage italiana
- `/en/`: homepage inglese
- `/admin/`: amministrazione dimostrativa senza login

## Sviluppo Next.js / Vercel
Node >=22.13.0 e pnpm (versione dichiarata in package.json).
```sh
pnpm install --frozen-lockfile
pnpm dev:next
pnpm build:next
pnpm start:next
```
Il file vercel.json seleziona Next.js. L’anteprima Sites pubblica l’export statico Next.js della demo. Il comando `pnpm build` mantiene disponibile il runtime Vinext compatibile App Router per una successiva integrazione server.

## Export statico
```sh
STATIC_EXPORT=1 pnpm build:next
```
Output in `out/`. Per un sottopercorso, impostare NEXT_PUBLIC_BASE_PATH in fase di build. GitHub Pages non è la destinazione prevista per l’ecommerce commerciale (vedi condizioni GitHub).

## Stato della demo
### Pubblicazione della demo statica su GitHub Pages
Workflow: `.github/workflows/pages-demo.yml`. Nel repository di destinazione impostare Settings → Pages → Source → GitHub Actions. Il push su `main` genera l’export Next.js con il sottopercorso restituito da configure-pages, quindi pubblica `out/`. Il banner identifica la demo di design. Nessuna API, credenziale o pagamento viene aggiunto. Le condizioni GitHub escludono l’uso di Pages per gestire ecommerce o siti destinati principalmente a facilitare transazioni commerciali: questa configurazione è per la dimostrazione del design, non per il negozio operativo.

Prezzi, disponibilità e ordini sono dati dimostrativi, non approvati per la vendita. L’admin modifica solo lo stato locale della sessione: ricaricando la pagina torna ai dati iniziali, e non modifica la vetrina. Non esistono login, database, pagamenti o chiamate UPS attive. Carrello e checkout sono esclusivamente dimostrativi. La demo ha noindex/nofollow.

Scene 3D procedurali: le geometrie di arancia, bicchiere e bottiglia illustrano lo storyboard; la bottiglia EVO è una visualizzazione concettuale e non una riproduzione certificata del packaging. Rispetto di prefers-reduced-motion e fallback fotografico in assenza di WebGL.

## Backend successivo
Supabase: prodotti, categorie, varianti, immagini e ruoli. Prezzi e giacenze ricalcolati sul server. Stripe/PayPal hosted checkout, webhook idempotenti. UPS Rating API con OAuth client_credentials, account nazionali/estero e tariffe negoziate. Credenziali esclusivamente nelle variabili ambiente, mai nel repository.

## Materiali
Foto e logo forniti dal cliente, conservati con i codici originali in `public/images`. Le relative autorizzazioni d’uso restano del titolare.
