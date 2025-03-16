npm i 
npx hardhat node
npx hardhat run --network localhost scripts/deploy.js
node api.js

```
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "card_number": "4111111111111111",
    "cvv": "123",
    "location": "New York, NY",
    "ip_address": "192.168.1.1",
    "merchant": "Example Store",
    "amount": 99.99,
    "transaction_type": "purchase",
    "time_of_day": 1430
  }'
 ```
curl http://localhost:3000/api/transactions/0xc47805ea048dd006545bec45b6e9b34f0b67568d817b29ea99fad6a9252b56bc
curl http://localhost:3000/api/transactions
