#!/bin/bash

cd "$(dirname "$0")"

QUERY_FILE="../payloads/deals/findAll.json"

http --session=nuvora GET "$BASE/deals" \
  page=="$(jq -r '.page' "$QUERY_FILE")" \
  limit=="$(jq -r '.limit' "$QUERY_FILE")" \
  stage=="$(jq -r '.stage' "$QUERY_FILE")"
