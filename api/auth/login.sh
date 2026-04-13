#!/bin/bash

DOTENV_PATH="$(dirname "$0")/../.env"
source "$DOTENV_PATH"

EMAIL=${1:-"admin@nuvora.com"}
PASSWORD=${2:-"admin123"}

echo "Efetuando login para $EMAIL..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
       \"email\": \"$EMAIL\",
       \"password\": \"$PASSWORD\"
     }")

echo "$RESPONSE"

JQ_PATH="./jq"
if [ ! -f "$JQ_PATH" ]; then
  JQ_PATH="jq"
fi

if command -v "$JQ_PATH" &>/dev/null; then
  NEW_TOKEN=$(echo "$RESPONSE" | "$JQ_PATH" -r '.token' 2>/dev/null)
  if [ "$NEW_TOKEN" != "null" ] && [ -n "$NEW_TOKEN" ]; then
    sed -i "s/^TOKEN=.*/TOKEN=\"$NEW_TOKEN\"/" "$DOTENV_PATH"
    echo "✅ TOKEN atualizado no arquivo .env!"
  fi
fi
