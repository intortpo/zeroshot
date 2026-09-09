#!/bin/sh
set -eu

BOOTSTRAP_KEY="${ZERO_TARGET_BOOTSTRAP_KEY:-${ZEROSHOT_TARGET_BOOTSTRAP_KEY:-}}"

if [ -n "${BOOTSTRAP_KEY}" ]; then
  previous_umask=$(umask)
  umask 077
  bootstrap_file=$(mktemp /tmp/zero-target-bootstrap.XXXXXX)
  trap 'rm -f "${bootstrap_file}"' EXIT HUP INT TERM
  printf '%s' "${BOOTSTRAP_KEY}" > "${bootstrap_file}"
  chmod 0600 "${bootstrap_file}"
  umask "${previous_umask}"
  unset ZERO_TARGET_BOOTSTRAP_KEY ZEROSHOT_TARGET_BOOTSTRAP_KEY BOOTSTRAP_KEY
  set -- "$@" --bootstrap-key-file "${bootstrap_file}"
fi

exec /usr/local/bin/zero "$@"

