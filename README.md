# APPUiO Cloud Portal  (Web Frontend)

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `npm run test` to execute the unit tests with jest.

## Running End-to-End Tests

Run `npm run e2e` to execute the end-to-end tests with cypress.

## Development

1. Run `docker compose up`
2. Run `npm start`

## Keycloak

You find Keycloak on http://localhost:8080/.

The default admin credentials are `admin:admin`.

The default user credentials are `user:1234`.

### Export realm

If you have made changes to the realm, be sure to export it via the command line.
The export via the UI does not contain the credentials and is therefore worthless for our purpose!

```
docker compose exec auth /opt/jboss/keycloak/bin/standalone.sh \
  -Djboss.socket.binding.port-offset=100 \
  -Dkeycloak.migration.action=export \
  -Dkeycloak.migration.provider=singleFile \
  -Dkeycloak.migration.realmName=appuio \
  -Dkeycloak.migration.usersExportStrategy=REALM_FILE \
  -Dkeycloak.migration.file=/tmp/realm.json
```

## Configuration

The APPUiO Cloud Portal can be configured with the `config.json` file which is located in the `src` directory.


## Deploy to OpenShift

Setup the project and deploy user

```bash
nstest=appuio-control-api-preview
sa=cloud-portal-deployer

oc new-project $nstest

oc -n $nstest create sa $sa

# Allow the deployer user to manage deployments in test namespace
oc -n $nstest policy add-role-to-user admin -z $sa --rolebinding-name admin
oc -n $nstest policy add-role-to-user system:image-pusher -z $sa
echo

# Get SA token
oc -n $nstest sa get-token $sa
```

Now, put the token into GitHub's Secrets
