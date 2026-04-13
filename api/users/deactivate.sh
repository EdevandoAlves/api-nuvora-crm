#!/bin/bash

source $(dirname "$0")/../.env

ID=${1:-"uuid-here"}

if [ "$ID" == "uuid-here" ]; then
  echo "Uso: ./deactivate.sh <USER_ID>"
  exit 1
fi

curl -s -X PUT "$BASE_URL/users/$ID/deactivate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
