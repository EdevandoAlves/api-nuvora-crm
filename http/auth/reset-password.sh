#!/bin/bash

cd "$(dirname "$0")"

http POST "$BASE/auth/reset-password" \
  <../payloads/auth/reset-password.json
