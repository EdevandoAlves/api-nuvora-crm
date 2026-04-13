#!/bin/bash

source $(dirname "$0")/../.env

curl -s -X GET "$BASE_URL/me/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
