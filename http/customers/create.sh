#!/bin/bash

cd "$(dirname "$0")"

http --session=nuvora POST "$BASE/customers" \
  <../payloads/customers/create.json
