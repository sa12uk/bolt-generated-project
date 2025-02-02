#!/bin/bash
export NODE_ENV=production
npm cache clean --force
npm ci --omit=dev
