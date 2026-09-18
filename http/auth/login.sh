#!/bin/bash

cd "$(dirname "$0")"

TOKEN=$(http POST "$BASE/auth/login" \
  <../payloads/secrets/userAdmin.json | jq -r '.accessToken')

http --session=nuvora "$BASE/auth/login" \
  "Authorization: Bearer $TOKEN" >/dev/null

echo "Token salvo na sessao nuvora"
