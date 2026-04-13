#!/bin/bash

source $(dirname "$0")/../.env

CUSTOMER_ID=${1:-"customer-uuid"}
NEW_OWNER_ID=${2:-"user-uuid"}

if [ "$CUSTOMER_ID" == "customer-uuid" ] || [ "$NEW_OWNER_ID" == "user-uuid" ]; then
  echo "Uso: ./transfer.sh <CUSTOMER_ID> <NEW_OWNER_ID>"
  exit 1
fi

curl -s -X PUT "$BASE_URL/customers/$CUSTOMER_ID/transfer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
       \"id\": \"$NEW_OWNER_ID\"
     }"
