#!/bin/sh
set -e

if [ $# -eq 0 ] || [ "$1" = "ticket" ] || [ "$1" = "help" ] || [ "${1#-}" != "$1" ]; then
	exec dumb-init -- node /app/dist/index.js "$@"
fi

exec dumb-init -- "$@"
