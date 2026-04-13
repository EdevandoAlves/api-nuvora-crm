#!/bin/bash

source $(dirname "$0")/../.env

COMPANY_NAME=${1:-"Cliente Exemplo"}
CNPJ=${2:-"12345678000199"}

curl -s -X POST "$BASE_URL/customers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
       \"companyName\": \"$COMPANY_NAME\",
       \"cnpj\": \"$CNPJ\",
       \"industry\": \"Technology\",
       \"website\": \"www.exemplo.com\",
       \"status\": \"LEAD\",
       \"source\": \"Website\",
       \"address\": \"Rua Exemplo, 123\"
     }"
