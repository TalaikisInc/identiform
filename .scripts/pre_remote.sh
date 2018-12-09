#!/bin/bash

cd /opt && \
  git init --bare identiform_app.git && \
  git clone identiform_app.git identiform_app

cp /root/.scripts/post-receive /opt/identiform_app.git/hooks
chmod ug+x /opt/identiform_app.git/hooks/post-receive
mkdir -p /opt/identiform_app/app
cp /root/.scripts/.env /opt/identiform_app/app
