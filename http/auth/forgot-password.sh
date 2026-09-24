#!/bin/bash

cd "$(dirname "$0")"

http POST "$BASE/auth/forgot-password" \
  <../payloads/auth/forgot-password.json
