#!/bin/bash

set -eo pipefail

BASE_URL=https://id.test.vshn.net

USER=$1
PASSWORD=$2
REDIRECT_URI=$3

ACTION=$4

loginRealm=master

editRealm=VSHN-main-dev-realm
# The client ID has to be the UUID
editClientId=9b236a54-d2f4-4647-8ebf-4a4a880baf0c

loginUrl="${BASE_URL}/auth/realms/${loginRealm}/protocol/openid-connect/token"
clientUrl="${BASE_URL}/auth/admin/realms/${editRealm}/clients/${editClientId}"


echo "* Logging in to ${loginRealm}"
json_resp_login=$(curl -sS --fail --data "username=${USER}&password=${PASSWORD}&grant_type=password&client_id=admin-cli" "${loginUrl}")
access_token=$(echo "${json_resp_login}" | jq -r '.access_token')

echo "* Retrieving Client config '${editClientId}'"
json_resp_client=$(curl -sS --fail ${clientUrl} -H "Content-Type: application/json" -H "Authorization: bearer ${access_token}")

if [ "${ACTION}" = "remove" ]; then
  echo "* Removing '${REDIRECT_URI}' from Client config '${editClientId}'"
  json_req_update=$(echo ${json_resp_client} | jq -c '.redirectUris |= (.- ["'${REDIRECT_URI}'/*"] | unique) | .webOrigins |= (.- ["'${REDIRECT_URI}'"] | unique)')
else
  echo "* Adding '${REDIRECT_URI}' to Client config '${editClientId}'"
  json_req_update=$(echo ${json_resp_client} | jq -c '.redirectUris |= (.+ ["'${REDIRECT_URI}'/*"] | unique) | .webOrigins |= (.+ ["'${REDIRECT_URI}'"] | unique)')
fi

curl -sS --fail ${clientUrl} -H "Content-Type: application/json" -H "Authorization: bearer ${access_token}" -X PUT --data "${json_req_update}"
