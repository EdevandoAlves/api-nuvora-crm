#!/bin/bash

cd "$(dirname "$0")"

http POST "$BASE/auth/register" \
  <../payloads/auth/register.json
