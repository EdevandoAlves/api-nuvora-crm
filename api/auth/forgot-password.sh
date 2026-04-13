#!/bin/bash

source $(dirname "$0")/../.env

EMAIL=${1:-"admin@nuvora.com"}

curl -s -X POST "$BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
       \"email\": \"$EMAIL\"
     }"
