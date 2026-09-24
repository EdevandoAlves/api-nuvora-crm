#!/bin/bash

cd "$(dirname "$0")"

if [ -z "$1" ]; then
  echo "Uso: $0 CUSTOMER_ID"
  exit 1
fi

http --session=nuvora PATCH "$BASE/customers/$1" \
  <../payloads/customers/update.json
