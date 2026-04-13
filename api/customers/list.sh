#!/bin/bash

source $(dirname "$0")/../.env

PAGE=${1:-1}
LIMIT=${2:-10}
STATUS=${3:-""}
INDUSTRY=${4:-""}

curl -s -X GET "$BASE_URL/customers?page=$PAGE&limit=$LIMIT&status=$STATUS&industry=$INDUSTRY" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
