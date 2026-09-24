#!/bin/bash

cd "$(dirname "$0")"

if [ -z "$1" ]; then
  echo "Uso: $0 DEAL_ID"
  exit 1
fi

http --session=nuvora PATCH "$BASE/deals/$1/stage" \
  <../payloads/deals/update-stage.json
