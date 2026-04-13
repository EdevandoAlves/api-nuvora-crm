#!/bin/bash

source $(dirname "$0")/../.env

EMAIL=${1:-"novo@nuvora.com"}
FIRST_NAME=${2:-"Novo"}
LAST_NAME=${3:-"Usuario"}
ROLE=${4:-"SALES"} # Ex: ADMIN, OWNER, SALES, MANAGER

curl -s -X POST "$BASE_URL/users/invite" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
       \"email\": \"$EMAIL\",
       \"firstName\": \"$FIRST_NAME\",
       \"lastName\": \"$LAST_NAME\",
       \"role\": \"$ROLE\"
     }"
