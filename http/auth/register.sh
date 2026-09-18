#!/bin/bash

cd "$(dirname "$0")"

if [ -z "$1" ]; then
  echo "Uso: $0 SENHA"
  exit 1
fi

http POST "$BASE/auth/register" \
  < <(jq --arg password "$1" '.password = $password' \
    ../payloads/auth/register.json)
