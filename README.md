# APPUiO Cloud Portal (Web Frontend)

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `npm run test` to execute the unit tests with jest.

## Running End-to-End Tests

Run `npm run e2e-dev` to execute the end-to-end tests with cypress.

## Development

1. Duplicate `environments/environment.ts` and rename the file to `environment.development.ts`. Replace the values where necessary (mainly: `clientId: 'local-dev'` and ` issuer: 'https://id.dev.appuio.cloud/auth/realms/<your-realm-name>'`).
2. Start the local control api: https://github.com/appuio/control-api/tree/master/local-env
3. Run `kubectl proxy` to start a proxy server between localhost and the Kubernetes API server.
4. Run `npm start` to start angular locally.

## Keycloak

Use the dev instance from VSHN: https://id.dev.appuio.cloud
(if that returns a 404, use https://id.dev.appuio.cloud/auth/admin/master/console/)

To add a new dev realm for yourself, follow the instructions in the [control-api](https://github.com/appuio/control-api) under 'local-env'.
Note: Once the setup is done, login to keycloak, select the new realm on the top left, and under clients -> 'local-dev' -> Settings add `localhost:4200` (or `*`) to both 'Valid Redirct URIs' and 'Web Origins'.

## Configuration

The APPUiO Cloud Portal can be configured with the `config.json` file which is located in the `src` directory.

In addition to that, the environment variable `APPUIO_API` has to be set as well. (i.E `https://control-api-v1.22.1-control-plane:6443/apis/`)

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

# Annotate namespace
oc annotate namespace $nstest --overwrite "app.kubernetes.io/managed-by=GitHub Actions" "app.kubernetes.io/source=https://github.com/appuio/cloud-portal"

# Get SA token
oc -n $nstest sa get-token $sa
```

Now, put the token into GitHub's Secrets

## Use existing Keycloak in preview deployments

A GitHub action workflows dynamically registers the redirect URL in an existing Keycloak instance via API.

1. Create a new User in master realm
1. Set a secure password
1. In the role mappings, select `appuio-cloud-dev-realm` in the "Client Roles" dropdown.
   Add `manage-clients`.
1. Create a new Client in the target realm (e.g. `appuio-control-api`)
1. When editing the client, the URL shows the UUID of the client.
   Copy this value and set it in `.github/keycloak-redirect-url.sh`.
1. Update the `KEYCLOAK_USER` and `KEYCLOAK_PASSWORD` secrets in GitHub environment `preview` with the values in the first steps.
