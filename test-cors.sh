#!/bin/bash

echo "Testing CORS for production domain..."
echo "======================================"
echo ""

curl -X POST https://admin.climatecontributionframework.org/graphql \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.climatecontributionframework.org" \
  -d '{"query":"{ __typename }"}' \
  -i 2>&1 | grep -E "(HTTP|access-control|Access-Control)"

echo ""
echo "Testing CORS for Vercel domain..."
echo "======================================"
echo ""

curl -X POST https://admin.climatecontributionframework.org/graphql \
  -H "Content-Type: application/json" \
  -H "Origin: https://climatecontributionframework.vercel.app" \
  -d '{"query":"{ __typename }"}' \
  -i 2>&1 | grep -E "(HTTP|access-control|Access-Control)"
