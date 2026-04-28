import './env.js';
import express from 'express';
import cors from 'cors';
import checkoutRouter from './routes/checkout.js';
import pixRouter from './routes/pix.js';
import { handleStripeWebhook } from './routes/stripeWebhook.js';
import { getAdminFirestore } from './lib/firebaseAdmin.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));

/** Stripe exige corpo bruto para validar `Stripe-Signature` — tem de vir antes de `express.json`. */
app.post(
  '/api/checkout/stripe-webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    void handleStripeWebhook(req, res).catch(next);
  }
);

app.use(express.json({ limit: '1mb' }));

/** Em serverless (Vercel), o path interno pode diferir do URL público — restaura para o Express. */
app.use((req, _res, next) => {
  const h = req.headers;
  const orig =
    (h['x-vercel-original-path'] as string | undefined) ||
    (h['x-invoke-path'] as string | undefined) ||
    (h['x-forwarded-uri'] as string | undefined)?.split('?')[0];
  if (typeof orig === 'string' && orig.startsWith('/api')) {
    req.url = orig;
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    superfrete: Boolean(process.env.SUPER_FRETE_API),
    mercadopago: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
    firestoreInventory: Boolean(getAdminFirestore()),
    time: new Date().toISOString(),
  });
});

app.use('/api/checkout', checkoutRouter);
app.use('/api/pix', pixRouter);

export default app;
