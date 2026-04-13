#!/bin/bash

source $(dirname "$0")/../.env

ID=${1:-"uuid-here"}

if [ "$ID" == "uuid-here" ]; then
  echo "Uso: ./get_details.sh <CUSTOMER_ID>"
  exit 1
fi

curl -s -X GET "$BASE_URL/customers/$ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
