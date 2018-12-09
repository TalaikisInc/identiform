#!/bin/bash

cp -r ./.scripts root@173.212.207.88:/root/
# For subsequent projects, only new .env is needeed
cp ./app/.env root@173.212.207.88:/root/.scripts
ssh root@173.212.207.88 "chmod +x /root/.scripts/pre_remote.sh"
# Verify permissions (optional):
ssh root@173.212.207.88 "ls -la /root/.scripts"
# Install remote repo:
ssh root@173.212.207.88 "bash /root/.scripts/pre_remote.sh"
# Add reote to local
git remote add production ssh://root@173.212.207.88/opt/identiform_app.git
# Check:
git remote -v
