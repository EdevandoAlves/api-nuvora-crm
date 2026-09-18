#!/bin/bash

cd "$(dirname "$0")"

http --session=nuvora GET "$BASE/customers"
