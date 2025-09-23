# Multi-Currency Support Implementation

## Overview

This implementation adds comprehensive multi-currency support to the e-commerce backend following Oracle's specifications. The system maintains backward compatibility while introducing new currency fields and exchange rate management.

## Key Components

### 1. Money Pydantic Schema (`app/money.py`)

- **Money**: Base schema for currency representation with minor units (cents, pence, etc.)
- **Currency**: Enum supporting USD, GBP, EUR, AUD, MXN, JPY
- **MoneyFields**: Mixin for SQLModel entities requiring money fields

### 2. Database Models (`app/models.py`)

#### Updated Product Model
- `price_amount_minor`: Price in minor units (cents)  
- `price_currency`: ISO 4217 currency code (default "USD")
- Maintains existing `price` field for backward compatibility

#### Updated DeliveryOption Model
- `price_amount_minor`: Delivery cost in minor units
- `price_currency`: Currency code (default "USD")  
- `min_order_amount_minor`: Minimum order value in minor units
- Maintains existing fields for backward compatibility

#### New User Model
- Basic user information for orders
- `email`, `first_name`, `last_name`

#### New Order Model
- `currency`: Order currency
- `total_amount_minor`: Total in minor units
- `total_usd_minor`: USD conversion snapshot
- `fx_rate_decimal`: Exchange rate used
- `fx_provider`: Rate provider name  
- `fx_timestamp`: Rate timestamp

#### New OrderItem Model
- `unit_price_amount_minor`: Item price at order time
- `unit_price_currency`: Item currency
- `subtotal_amount_minor`: Line total
- Links to product and order

#### ExchangeRateLatest Model
- Caches latest FX rates between currencies
- Primary key: `(from_currency, to_currency)`
- Includes provider and timestamp metadata

### 3. Migration (`alembic/versions/92c7686c770a_*.py`)

- Adds new currency fields to existing tables
- Creates new tables (users, orders, order_items, exchange_rates_latest)
- Backfills existing data: converts prices to minor units and sets USD currency
- Maintains backward compatibility

### 4. Seed Data (`app/seed.py`)

- Updates product seeding to populate currency fields
- Updates delivery option seeding with currency support
- Adds exchange rate seeding with sample rates for 6 currencies
- Converts prices to minor units (cents) automatically

### 5. Test Coverage (`tests/test_money.py`)

- Tests Money schema creation and validation
- Tests currency conversions (including JPY special handling)
- Verifies exchange rate data exists
- Validates all supported currencies

## Supported Currencies

- **USD** (US Dollar) - Base currency
- **GBP** (British Pound)
- **EUR** (Euro)
- **AUD** (Australian Dollar)
- **MXN** (Mexican Peso)
- **JPY** (Japanese Yen) - No minor units

## Key Features

### Minor Units Handling
- All monetary amounts stored as integers in minor units (cents, pence, etc.)
- JPY handled as whole units (no minor units)
- Automatic conversion between major and minor units

### Backward Compatibility
- Existing `price` fields preserved
- New currency fields populated alongside old fields
- Existing API contracts maintained

### Exchange Rate Management
- Sample exchange rates seeded for development
- FX rate caching infrastructure in place
- Provider and timestamp tracking

### Order Currency Support
- Orders can be placed in any supported currency
- USD conversion snapshot stored at order time
- FX rate metadata preserved for auditing

## Database Schema Changes

```sql
-- Products table additions
ALTER TABLE products ADD COLUMN price_amount_minor INTEGER;
ALTER TABLE products ADD COLUMN price_currency VARCHAR(3) DEFAULT 'USD';

-- Delivery options table additions  
ALTER TABLE delivery_options ADD COLUMN price_amount_minor INTEGER;
ALTER TABLE delivery_options ADD COLUMN price_currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE delivery_options ADD COLUMN min_order_amount_minor INTEGER;

-- New tables
CREATE TABLE users (...);
CREATE TABLE orders (...);
CREATE TABLE order_items (...); 
CREATE TABLE exchange_rates_latest (...);
```

## Usage Examples

### Creating Money Objects
```python
# From minor units
money = Money(amount_minor=2999, currency=Currency.USD)  # $29.99

# From major units
money = Money.from_amount(29.99, Currency.USD)  # Also $29.99

# JPY handling
money_jpy = Money(amount_minor=1000, currency=Currency.JPY)  # ¥1000
```

### Exchange Rate Queries
```python
rate = session.exec(
    select(ExchangeRateLatest).where(
        ExchangeRateLatest.from_currency == "USD",
        ExchangeRateLatest.to_currency == "GBP"
    )
).first()
```

## Testing

Run the full test suite:
```bash
uv run pytest
```

Run currency-specific tests:
```bash
uv run pytest tests/test_money.py -v
```

## Data Verification

Check currency data in database:
```bash
# Products with currency fields
sqlite3 store.db "SELECT title, price, price_amount_minor, price_currency FROM products LIMIT 3;"

# Exchange rates
sqlite3 store.db "SELECT from_currency, to_currency, rate_decimal FROM exchange_rates_latest;"
```

## Future Enhancements

1. **Live Exchange Rates**: Integrate with external FX API
2. **Currency Conversion API**: Add endpoints for real-time conversion
3. **Multi-Currency Cart**: Support mixed-currency shopping carts
4. **Localized Pricing**: Region-specific pricing strategies
5. **Historical Rates**: Track exchange rate history for reporting

## Files Modified/Created

- `app/money.py` - New currency schemas and enums
- `app/models.py` - Updated with currency fields and new models
- `app/schemas.py` - New schemas for currency support
- `app/seed.py` - Enhanced seeding with currency data
- `tests/test_money.py` - Currency functionality tests
- `alembic/versions/92c7686c770a_*.py` - Database migration
- `app/main.py` - Simplified to work with new schema

The implementation provides a solid foundation for multi-currency e-commerce operations while maintaining full backward compatibility with existing systems.
