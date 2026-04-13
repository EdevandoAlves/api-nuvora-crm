#!/bin/bash

source $(dirname "$0")/../.env

EMAIL=${1:-"admin@nuvora.com"}
PASSWORD=${2:-"admin123"}
FIRST_NAME=${3:-"Admin"}
LAST_NAME=${4:-"User"}
COMPANY_NAME=${5:-"Nuvora CRM"}
CNPJ=${6:-"12345678000199"}

curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
       \"email\": \"$EMAIL\",
       \"password\": \"$PASSWORD\",
       \"firstName\": \"$FIRST_NAME\",
       \"lastName\": \"$LAST_NAME\",
       \"companyName\": \"$COMPANY_NAME\",
       \"cnpj\": \"$CNPJ\"
     }"
