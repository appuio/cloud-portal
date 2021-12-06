# cloud-portal
APPUiO Cloud Portal (Web Frontend)

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npm run test` to execute the unit tests.

## Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

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
