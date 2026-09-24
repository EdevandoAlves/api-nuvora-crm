#!/bin/bash

cd "$(dirname "$0")"

QUERY_FILE="../payloads/deals/findAll.json"

http --session=nuvora GET "$BASE/deals" \
  page=="$(jq -r '.page' "$QUERY_FILE")" \
  limit=="$(jq -r '.limit' "$QUERY_FILE")" \
  stage=="$(jq -r '.stage' "$QUERY_FILE")" \
  customerId=="$(jq -r '.customerId' "$QUERY_FILE")" \
  ownerId=="$(jq -r '.ownerId' "$QUERY_FILE")" \
  startDate=="$(jq -r '.startDate' "$QUERY_FILE")" \
  endDate=="$(jq -r '.endDate' "$QUERY_FILE")" \
  sortBy=="$(jq -r '.sortBy' "$QUERY_FILE")" \
  sortOrder=="$(jq -r '.sortOrder' "$QUERY_FILE")"
