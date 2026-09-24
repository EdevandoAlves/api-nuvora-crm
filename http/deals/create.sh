#!/bin/bash

cd "$(dirname "$0")"

http --session=nuvora POST "$BASE/deals" \
  <../payloads/deals/create.json
