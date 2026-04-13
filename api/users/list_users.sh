#!/bin/bash

source $(dirname "$0")/../.env

PAGE=${1:-1}
LIMIT=${2:-10}

curl -s -X GET "$BASE_URL/users?page=$PAGE&limit=$LIMIT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
