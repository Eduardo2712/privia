#!/bin/sh
set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "Waiting for Redis at $host:$port..."

timeout=60
counter=0

until nc -z "$host" "$port" 2>/dev/null; do
  counter=$((counter + 1))
  if [ $counter -ge $timeout ]; then
    echo "Timeout waiting for Redis"
    exit 1
  fi
  echo "Redis is unavailable - sleeping"
  sleep 1
done

echo "Redis is up - executing command"
exec $cmd
