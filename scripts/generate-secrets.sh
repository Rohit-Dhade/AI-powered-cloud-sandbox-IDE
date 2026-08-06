#!/bin/bash

set -e

set -a
source .env
set +a

envsubst < k8s/secrets-template.yml | kubectl apply -f -