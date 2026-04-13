#!/bin/bash

source $(dirname "$0")/../.env

QUERY=${1:-"exemplo"}

curl -s -X GET "$BASE_URL/customers/search?q=$QUERY" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
