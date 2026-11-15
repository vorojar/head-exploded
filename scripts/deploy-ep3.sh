#!/bin/bash
# Deploy the head-exploded webpage (3 episodes) to the Xiaomi 15 Pro server.
# Run when the phone's SSH (Termux sshd, port 8022) is back.
# Verifies each file by md5 on the phone after upload.
set -e
PHONE="u0_a717@100.93.28.43"
REMOTE='~/server/apps/xiaomi-test-site/current/www/head-exploded'
SRC="$HOME/workspace/skull3d/remotion/player/dist"

# The ProxyCommand value must be quoted as a whole (see AGENTS.md scp lesson).
# NOTE: SSH_OPTS must NOT be expanded unquoted — its ProxyCommand value contains
# spaces, so `ssh $SSH_OPTS ...` word-splits it and ssh treats the proxy path as
# the hostname ("hostname contains invalid characters"). Use eval like SCP does.
SCP="scp -o \"ProxyCommand=bash \$HOME/workspace/mac-ssh/ts-proxy.sh %h %p\" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/xiaomi15_known -o BatchMode=yes -i \$HOME/.ssh/id_ed25519 -P 8022"
SSH="ssh -o \"ProxyCommand=bash \$HOME/workspace/mac-ssh/ts-proxy.sh %h %p\" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/xiaomi15_known -o BatchMode=yes -i \$HOME/.ssh/id_ed25519 -p 8022"

echo "== uploading =="
eval "$SCP $SRC/index.html $PHONE:$REMOTE/index.html"
eval "$SCP $SRC/assets/index-*.js $PHONE:$REMOTE/assets/"
eval "$SCP $SRC/mixed3.wav $PHONE:$REMOTE/mixed3.wav"

echo "== verifying md5 on phone =="
eval "$SSH $PHONE \"cd $REMOTE && md5sum index.html assets/index-*.js mixed.wav mixed2.wav mixed3.wav && ls -la\""

echo "== removing old bundles (keep only the current one) =="
CURRENT=$(basename $SRC/assets/index-*.js)
eval "$SSH $PHONE \"cd $REMOTE/assets && ls index-*.js | grep -v $CURRENT | xargs -r rm -v\""

echo "== live check =="
curl -s -o /dev/null -w "index.html: %{http_code}\n" https://xiaomi.bibidu.com/head-exploded/
curl -s -o /dev/null -w "bundle: %{http_code}\n" https://xiaomi.bibidu.com/head-exploded/assets/$CURRENT
curl -s -o /dev/null -w "mixed3.wav: %{http_code}\n" https://xiaomi.bibidu.com/head-exploded/mixed3.wav
echo "DONE"
