// Shared indicative market prices (USD rate: $1 = ₹102)
// This is the single source of truth used by all components: CryptoAnalyzer, StrategyActivation, HoldingsTable, PortfolioSummary, TradeManager, TradeDesk

// USDT ↔ INR exchange rate (1 USDT = ₹102)
export const USDT_INR_RATE = 102;

export const CRYPTO_PRICES = {
  BTC:   { name: 'Bitcoin',      price_inr: 6387852, price_usd: 62626  },
  ETH:   { name: 'Ethereum',     price_inr: 170034,  price_usd: 1667   },
  BNB:   { name: 'BNB',          price_inr: 58344,   price_usd: 572    },
  SOL:   { name: 'Solana',       price_inr: 7140,    price_usd: 70     },
  XRP:   { name: 'XRP',          price_inr: 112,     price_usd: 1.10   },
  ADA:   { name: 'Cardano',      price_inr: 25.50,   price_usd: 0.25   },
  DOGE:  { name: 'Dogecoin',     price_inr: 8.06,    price_usd: 0.079  },
  MATIC: { name: 'Polygon',      price_inr: 22.13,   price_usd: 0.217  },
  DOT:   { name: 'Polkadot',     price_inr: 130.56,  price_usd: 1.28   },
  AVAX:  { name: 'Avalanche',    price_inr: 655.86,  price_usd: 6.43   },
  LINK:  { name: 'Chainlink',    price_inr: 774.18,  price_usd: 7.59   },
  USDT:  { name: 'Tether',       price_inr: 102,     price_usd: 1.00   },
};

// Indian stock prices (NSE, August 24 2026 — indicative)
export const STOCK_PRICES = {
  'RELIANCE':   { name: 'Reliance Industries', price_inr: 1285 },
  'TCS':        { name: 'Tata Consultancy',    price_inr: 3490 },
  'HDFCBANK':   { name: 'HDFC Bank',           price_inr: 1820 },
  'INFY':       { name: 'Infosys',             price_inr: 1560 },
  'ICICIBANK':  { name: 'ICICI Bank',          price_inr: 1390 },
  'WIPRO':      { name: 'Wipro',               price_inr: 265  },
  'BAJFINANCE': { name: 'Bajaj Finance',       price_inr: 6850 },
  'TATAMOTORS': { name: 'Tata Motors',         price_inr: 680  },
  'SBIN':       { name: 'State Bank of India', price_inr: 810  },
  'LT':         { name: 'Larsen & Toubro',     price_inr: 3560 },
};

/**
 * Get the current INR price for any asset (crypto or stock).
 * Falls back to avg_buy_price if unknown.
 */
export function getCurrentPrice(assetSymbol, type = 'crypto', fallback = 0) {
  if (type === 'crypto') {
    return CRYPTO_PRICES[assetSymbol?.toUpperCase()]?.price_inr ?? fallback;
  }
  return STOCK_PRICES[assetSymbol?.toUpperCase()]?.price_inr ?? fallback;
}

/**
 * Get the live price for a holding object (has asset/symbol + avg_buy_price).
 * Used by HoldingsTable, TradeManager, PortfolioSummary — single source of truth.
 */
export function getLivePrice(holding, type = 'crypto') {
  const priceMap = type === 'crypto' ? CRYPTO_PRICES : STOCK_PRICES;
  const key = (holding.asset || holding.symbol)?.toUpperCase();
  return priceMap[key]?.price_inr ?? holding.current_price ?? holding.avg_buy_price ?? 0;
}

/**
 * Merge new holdings into existing array, averaging buy price on duplicates.
 * Used by TradeManager and StrategyActivation — single source of truth.
 */
export function mergeHoldings(existing = [], incoming = []) {
  const merged = [...existing];
  for (const item of incoming) {
    const key = (item.asset || item.symbol)?.toUpperCase();
    const idx = merged.findIndex(h => (h.asset || h.symbol)?.toUpperCase() === key);
    if (idx >= 0) {
      const old = merged[idx];
      const totalQty = (old.quantity || 0) + (item.quantity || 0);
      merged[idx] = {
        ...old,
        quantity: totalQty,
        avg_buy_price: totalQty > 0
          ? ((old.quantity * old.avg_buy_price) + (item.quantity * item.avg_buy_price)) / totalQty
          : item.avg_buy_price,
        current_price: item.current_price,
      };
    } else {
      merged.push(item);
    }
  }
  return merged;
}

/**
 * Calculate full portfolio metrics from holdings + balances.
 * Returns { cryptoValue, stockValue, holdingsValue, totalValue, riskExposure }.
 */
export function calculatePortfolioMetrics(portfolio) {
  const cryptoHoldings = portfolio?.crypto_holdings || [];
  const stockHoldings = portfolio?.stock_holdings || [];
  const inrBalance = portfolio?.inr_balance || 0;
  const usdtBalance = portfolio?.usdt_balance || 0;

  const cryptoValue = cryptoHoldings.reduce((sum, h) => sum + (h.quantity * getLivePrice(h, 'crypto')), 0);
  const stockValue = stockHoldings.reduce((sum, h) => sum + (h.quantity * getLivePrice(h, 'stock')), 0);
  const holdingsValue = cryptoValue + stockValue;
  const usdtValue = usdtBalance * USDT_INR_RATE;
  const totalValue = holdingsValue + inrBalance + usdtValue;
  const riskExposure = totalValue > 0 ? Math.round((holdingsValue / totalValue) * 100) : 0;

  return { cryptoValue, stockValue, holdingsValue, usdtValue, totalValue, riskExposure };
}
